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

const unquote = (raw) => {
  const v = raw.trim();
  if (/^".*"$/.test(v)) return v.slice(1, -1).replace(/\\"/g, '"');
  if (/^'.*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
  return v;
};

/**
 * Read the play's frontmatter subset. Returns the data, the body after the
 * fence, and the lines the subset cannot read (each is a finding).
 * @param {string} text
 * @returns {{ present: boolean, data: Record<string, string | Record<string, string>>, body: string, unread: string[] }}
 */
export function readFrontmatter(text) {
  let str = String(text);
  if (str.charCodeAt(0) === 0xfeff) str = str.slice(1);
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(str);
  if (!m) return { present: false, data: {}, body: str, unread: [] };
  const data = {};
  const unread = [];
  let open = null;
  for (const raw of m[1].split(/\r?\n/)) {
    if (!raw.trim() || /^\s*#/.test(raw)) continue;
    const sub = /^[ \t]+([A-Za-z_][\w-]*):[ \t]*(.*)$/.exec(raw);
    if (sub && open) {
      if (typeof data[open] !== "object") data[open] = {};
      data[open][sub[1]] = unquote(sub[2]);
      continue;
    }
    const kv = /^([A-Za-z_][\w-]*):[ \t]*(.*)$/.exec(raw);
    if (!kv) {
      unread.push(raw);
      continue;
    }
    const value = unquote(kv[2]);
    data[kv[1]] = value;
    open = value === "" ? kv[1] : null;
  }
  return { present: true, data, body: str.slice(m[0].length), unread };
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
 * The headers of a body in order, fence-aware, and the chapters with whether
 * each carries content (prose or a `###` subchapter). A trailing `---` rule
 * with no chapter after it opens a coda (a builder note) that is not a chapter.
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
  return { headers, chapters };
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
  if (/[–—]/.test(text)) e.push("en/em-dash present (use ' - ')");
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
