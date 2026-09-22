#!/usr/bin/env node
// The play's shape, checked once. This file is the single source of the
// mechanical part of the play contract: the frontmatter a play carries, the
// H1, the six ENACTS chapters in order and none empty, the bytes the house
// accepts. The canon re-exports its chapter list from here; the conformance
// kit calls checkPlay for every play the hook and CI see; the playwright skill
// ships this very file under scripts/, so a runtime with node runs the same
// check before it delivers. It imports nothing but node, on purpose: a skill
// runs in a stranger's workspace with no khai installed.
//
//   node check_play.mjs <play.md> [more.md...]   one line per file; exit 1 on any finding
//
// The frontmatter reader is deliberately narrower than YAML: `key: value`
// lines, values bare or quoted, and one level of map (the stamp). That is the
// whole subset a play uses; anything beyond it is a finding that says so,
// rather than a guess.

import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** The ENACTS chapters, in order. The canon's play type declares the same list; a test holds the two equal. */
export const PLAY_CHAPTERS = ["Estate", "Name", "Arc", "Company", "Triggers", "Stakes"];
/** The frontmatter keys a play may carry. Mirrors the kit's base keys plus the play's extras. */
export const PLAY_KEYS = [
  "khai",
  "title",
  "description",
  "license",
  "stamp",
  "language",
  "declared",
  "voice",
  "provenance",
];
export const STAMP_KEYS = ["owner", "version", "date"];
export const PROVENANCE_VALUES = ["sourced", "free", "unverified"];

const safeKey = (k) => k !== "__proto__" && k !== "constructor" && k !== "prototype";

const unquote = (raw) => {
  const v = raw.trim();
  if (/^".*"$/.test(v)) return v.slice(1, -1).replace(/\\"/g, '"');
  if (/^'.*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
  return v;
};

/**
 * Read the play's frontmatter subset. Returns the data, the body after the
 * fence, the lines the subset cannot read, and the keys given twice (each of
 * the last two is a finding).
 *
 * `dupes` exists because assignment is last-wins and YAML is not. The kit's own
 * loader is js-yaml, which THROWS on a duplicated mapping key -- so without
 * this, a play carrying `license:` twice passes here and fails the validator
 * every house actually runs, and the portable checker that is supposed to give
 * a stranger's workspace the same answer gives a different one. A checker whose
 * clear is not the real clear is worse than no checker, because it is trusted.
 * A duplicated sub-key under the stamp counts the same and is reported by its
 * path (`stamp.owner`).
 *
 * @param {string} text
 * @returns {{ present: boolean, data: Record<string, string | Record<string, string>>, body: string, unread: string[], dupes: string[] }}
 */
export function readFrontmatter(text) {
  let str = String(text);
  if (str.charCodeAt(0) === 0xfeff) str = str.slice(1);
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(str);
  if (!m) return { present: false, data: {}, body: str, unread: [], dupes: [] };
  // Null-prototype maps, and the three names that would reach a prototype are
  // not keys a play has, so they stay unread rather than land anywhere.
  const data = Object.create(null);
  const unread = [];
  // Seen paths rather than `key in data`: a null-prototype map answers `in`
  // correctly, but the stamp's sub-keys need their own namespace and a second
  // `stamp:` line must be caught as well as a second `stamp.owner`.
  const seen = new Set();
  const dupes = [];
  let open = null;
  for (const raw of m[1].split(/\r?\n/)) {
    if (!raw.trim() || /^\s*#/.test(raw)) continue;
    // One bounded quantifier per regex and the trimming in JS: no overlap
    // between a whitespace run and the value, so no polynomial backtracking.
    const sub = /^([ \t]+)([A-Za-z_][\w-]*):(.*)$/.exec(raw);
    if (sub && open && safeKey(sub[2])) {
      if (typeof data[open] !== "object") data[open] = Object.create(null);
      const path = `${open}.${sub[2]}`;
      if (seen.has(path)) dupes.push(path);
      seen.add(path);
      data[open][sub[2]] = unquote(sub[3]);
      continue;
    }
    const kv = /^([A-Za-z_][\w-]*):(.*)$/.exec(raw);
    if (!kv || !safeKey(kv[1])) {
      unread.push(raw);
      continue;
    }
    if (seen.has(kv[1])) dupes.push(kv[1]);
    seen.add(kv[1]);
    const value = unquote(kv[2]);
    data[kv[1]] = value;
    open = value === "" ? kv[1] : null;
  }
  return { present: true, data, body: str.slice(m[0].length), unread, dupes };
}

/** Which body lines sit inside a fenced code block; the fence lines count as inside. */
function fencedLines(lines) {
  const fenced = new Array(lines.length).fill(false);
  let marker = null;
  for (let i = 0; i < lines.length; i++) {
    if (marker === null) {
      const open = /^\s*(`{3,}|~{3,})/.exec(lines[i]);
      if (open) {
        marker = open[1];
        fenced[i] = true;
      }
    } else {
      fenced[i] = true;
      const close = /^\s*(`{3,}|~{3,})\s*$/.exec(lines[i]);
      if (close && close[1][0] === marker[0] && close[1].length >= marker.length) marker = null;
    }
  }
  return fenced;
}

/** `## Name ##` reads as "Name"; a `#` not preceded by a space (C#) is text. */
function headerText(rest) {
  let t = rest.trim();
  if (t.endsWith("#")) {
    let j = t.length;
    while (j > 0 && t[j - 1] === "#") j--;
    if (j > 0 && /\s/.test(t[j - 1])) t = t.slice(0, j).trimEnd();
  }
  return t;
}

/**
 * The headers of a body in order, fence-aware, the chapters with whether each
 * carries content (prose or a `###` subchapter), and the coda.
 *
 * A `---` rule with no `## ` chapter after it opens a coda (a builder note):
 * everything past it leaves the chapters. Markdown gives no way to tell that
 * rule apart from a thematic break an author meant to keep inside the final
 * chapter, and the difference is what the rule MEANS, so nothing here can
 * decide it -- but the consequence was invisible, which is the part that could
 * be fixed. The coda comes back so the command can say how much text left the
 * chapters, and an author who meant a thematic break has the escape that
 * already worked and was never written down: `***` and `___` are thematic
 * breaks too, and only a bare `---` opens a coda.
 *
 * Measured before choosing to report rather than refuse: no play or plan in
 * this repository carries a coda; the two that do are the templates, whose
 * builder notes are exactly what the device is for. Refusing a coda would fail
 * them for using the feature correctly.
 */
export function readBody(body) {
  const lines = body.split("\n");
  const fenced = fencedLines(lines);
  const headers = [];
  for (let i = 0; i < lines.length; i++) {
    if (fenced[i]) continue;
    const h = /^(#{1,6})(?=[ \t])/.exec(lines[i]);
    if (!h) continue;
    const text = headerText(lines[i].slice(h[1].length));
    if (text) headers.push({ level: h[1].length, text, line: i + 1 });
  }
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (fenced[i] || lines[i] !== "---") continue;
    if (!headers.some((h) => h.level === 2 && h.line > i + 1)) {
      end = i;
      break;
    }
  }
  const coda =
    end < lines.length
      ? lines
          .slice(end + 1)
          .join("\n")
          .trim()
      : "";
  const h2s = headers.filter((h) => h.level === 2 && h.line <= end);
  const chapters = h2s.map((h, k) => {
    const from = h.line;
    const to = k + 1 < h2s.length ? h2s[k + 1].line - 1 : end;
    const hasSub = headers.some((x) => x.level === 3 && x.line > from && x.line <= to);
    const prose = lines
      .slice(from, to)
      .filter((l, j) => !/^(#{1,6})(?=[ \t])/.test(l) || fenced[from + j])
      .join("\n")
      .trim();
    return { name: h.text, filled: Boolean(prose) || hasSub };
  });
  return { headers, chapters, coda };
}

/**
 * Every finding on one play's text. Empty means the shape holds.
 * @param {string} text
 * @param {{ resolvedLanguage?: string }} [opts]  the project's language, when a kit knows it; else the file's own
 * @returns {string[]}
 */
export function checkPlay(text, opts = {}) {
  if (typeof text !== "string") return ["play text is required"];
  const e = [];

  // The bytes.
  if (text.charCodeAt(0) === 0xfeff) e.push("BOM present");
  if (/\r\n/.test(text)) e.push("CRLF present");
  // The two dash characters as escapes, never raw: the file ships inside a skill
  // bundle whose guard bans them in every file, code included.
  if (/[\u2013\u2014]/.test(text)) e.push("en/em-dash present (use ' - ')");
  if (/�/.test(text))
    e.push("U+FFFD replacement character present (a bad decode lost a character)");
  if (/\\u[0-9a-fA-F]{4}/.test(text))
    e.push("literal unicode escape present (e.g. \\u2014); write the character, not the escape");
  if (text.length > 0 && !text.endsWith("\n")) e.push("no LF at EOF");

  // The frontmatter.
  const fm = readFrontmatter(text);
  if (!fm.present) e.push("frontmatter missing: a play opens with a `---` block");
  for (const line of fm.unread)
    e.push(`frontmatter beyond a play's subset (key: value, one level of map): "${line.trim()}"`);
  // Parity with the loader every house runs: js-yaml throws on a duplicated
  // mapping key, so a play that passed here and failed there was the checker
  // lying about a clear.
  for (const key of fm.dupes) e.push(`duplicate frontmatter key: ${key}`);
  const d = fm.data;
  for (const k of Object.keys(d))
    if (!PLAY_KEYS.includes(k)) e.push(`unknown frontmatter key: ${k}`);
  if (fm.present) {
    if (typeof d.khai !== "string" || d.khai === "") e.push("frontmatter missing `khai` type");
    else if (d.khai !== "play") e.push(`frontmatter khai must be "play", got "${d.khai}"`);
    if (!d.license) e.push("frontmatter missing `license`");
    if (!d.description) e.push("frontmatter missing required key: description");
    if (!d.stamp || typeof d.stamp !== "object") e.push("frontmatter missing `stamp`");
    else {
      for (const k of Object.keys(d.stamp))
        if (!STAMP_KEYS.includes(k)) e.push(`unknown stamp key: ${k}`);
      for (const k of STAMP_KEYS) if (!d.stamp[k]) e.push(`stamp missing ${k}`);
    }
    if ("provenance" in d && !PROVENANCE_VALUES.includes(d.provenance))
      e.push(
        `frontmatter "provenance" must be one of [${PROVENANCE_VALUES.join(", ")}], got "${d.provenance}"`,
      );
  }

  // The H1 and the title that echoes it.
  const { headers, chapters } = readBody(fm.body);
  const first = headers[0];
  let name = null;
  if (!first || first.level !== 1) e.push("missing H1 title line");
  else {
    const count = headers.filter((h) => h.level === 1).length;
    if (count > 1) e.push(`a khai file has exactly one H1 (#); found ${count}`);
    const m = /^Play: (.+)$/.exec(first.text);
    if (!m) e.push(`H1 must read "# Play: <Name>", got "# ${first.text}"`);
    else name = m[1].trim();
  }
  if (fm.present) {
    const title = typeof d.title === "string" ? d.title : "";
    if (title.trim() === "") e.push("frontmatter missing `title`");
    const language =
      opts.resolvedLanguage ?? (typeof d.language === "string" ? d.language : "english");
    const declared = typeof d.declared === "string" ? d.declared : null;
    if (language !== "english" && (declared === null || declared.trim() === ""))
      e.push("frontmatter missing `declared` for non-english play");
    const expected = declared !== null ? declared : title;
    if (name && expected.trim() !== "" && expected.trim() !== name)
      e.push(`frontmatter title/declared "${expected}" must match the H1 name "${name}"`);
  }

  // The six chapters, in order, each with something in it.
  const seen = chapters.map((c) => c.name);
  if (seen.length !== PLAY_CHAPTERS.length || seen.some((n, i) => n !== PLAY_CHAPTERS[i]))
    e.push(
      `play chapters must be exactly [${PLAY_CHAPTERS.join(", ")}] in order (ENACTS); got [${seen.join(", ")}]`,
    );
  else for (const c of chapters) if (!c.filled) e.push(`chapter "${c.name}" is empty`);

  return e;
}

/** The command: one line per file, exit 1 when any file has a finding. */
export function main(argv, { log = console.log, error = console.error } = {}) {
  if (argv.length === 0) {
    error("usage: check_play.mjs <play.md> [more.md...]");
    return 2;
  }
  let red = 0;
  for (const file of argv) {
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch (err) {
      error(`${file}: ${err.message}`);
      red++;
      continue;
    }
    // Not a finding, and not on stdout: a coda is legal (the templates use one)
    // and `ok <file>` is this command's machine-readable contract. But a `---`
    // meant as a thematic break inside the last chapter silently moves its text
    // out of the chapters, and silence is the part that could be fixed -- so the
    // note goes to stderr beside the findings, where a reader already looks.
    const { coda } = readBody(readFrontmatter(text).body);
    if (coda) {
      const n = coda.split("\n").length;
      error(
        `${file}: note: ${n} line${n === 1 ? "" : "s"} after a \`---\` rule read as a coda and ` +
          `${n === 1 ? "sits" : "sit"} outside the chapters; use \`***\` for a thematic break inside one`,
      );
    }
    const findings = checkPlay(text);
    if (findings.length === 0) log(`ok ${file}`);
    else {
      for (const f of findings) error(`${file}: ${f}`);
      red++;
    }
  }
  return red ? 1 : 0;
}

const isMain = (() => {
  try {
    return (
      process.argv[1] &&
      realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return false;
  }
})();
if (isMain) process.exit(main(process.argv.slice(2)));
