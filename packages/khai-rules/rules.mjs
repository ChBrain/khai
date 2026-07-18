// Rule atoms. Each takes already-parsed input and returns a list of error
// strings (empty = pass). They are pure and composable: the same atoms run in
// package mode (one file) and suite mode (every file), so a rule has exactly
// one home. Lifting a check = adding an atom here and wiring it into validate.
//
// Pure and canon-agnostic: a checker that needs the architecture (a type's
// chapters, the known type ids) takes that contract as an argument. Nothing
// here imports the canon, so khai-arch and khai-tests both pull down into here.

import { existsSync } from "node:fs";
import { join } from "node:path";
import { sectionBody } from "./parse.mjs";

const proper = (typeId) => typeId.charAt(0).toUpperCase() + typeId.slice(1);
// Escape regex metacharacters before interpolating a value into a RegExp.
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// --- encoding -------------------------------------------------------------
// Guards what the reader (and the model) sees: the bytes inside the file.
export function checkEncoding(text) {
  const e = [];
  if (text.charCodeAt(0) === 0xfeff) e.push("BOM present");
  if (/\r\n/.test(text)) e.push("CRLF present");
  if (/[–—]/.test(text)) e.push("en/em-dash present (use ' - ')");
  // U+FFFD is the scar a bad decode leaves (wrong encoding, mojibake, a
  // truncated multibyte sequence): a character was already lost.
  if (/�/.test(text))
    e.push("U+FFFD replacement character present (a bad decode lost a character)");
  // A literal escape sequence (the six characters of `—`) means a
  // serialization layer leaked into prose: the reader sees the escape, not the
  // glyph.
  if (/\\u[0-9a-fA-F]{4}/.test(text))
    e.push("literal unicode escape present (e.g. \\u2014); write the character, not the escape");
  if (text.length > 0 && !text.endsWith("\n")) e.push("no LF at EOF");
  return e;
}

// --- filename: a structured identifier, ASCII, underscores not hyphens -----
// Guards that the file can be found and parsed at all. The filename is a key:
// tooling parses `<type>_<descriptor>.md` and links resolve by it. Non-ASCII
// breaks portability (filesystems normalise Unicode differently, git and URLs
// mangle it); a hyphen breaks the underscore-delimited grammar.
export function checkFilename(name) {
  const e = [];
  if (!/^[\x20-\x7e]+$/.test(name))
    e.push(`non-ASCII filename "${name}"; use ASCII characters only`);
  if (name.includes("-")) e.push(`hyphen in filename "${name}"; use an underscore`);
  return e;
}

// --- frontmatter: closed keys, known type, stamp shape --------------------
const FM_KEYS = ["khai", "license", "stamp", "title", "language", "declared"];
const STAMP_KEYS = ["owner", "version", "date"];

export function checkFrontmatter(doc, { typeIds, extra = {} }) {
  const e = [];
  if (!doc.ok) return [`frontmatter does not parse: ${doc.error}`];
  // `extra` adds per-type keys beyond the base set (e.g. persona's `type:`),
  // each mapped to its allowed enum. The canon owns the map; the kit passes it
  // in, so this stays canon-agnostic.
  const allowed = [...FM_KEYS, ...Object.keys(extra)];
  const keys = Object.keys(doc.data);
  for (const k of keys) {
    if (!allowed.includes(k)) e.push(`unknown frontmatter key: ${k}`);
  }
  const khai = doc.data.khai;
  if (typeof khai !== "string") e.push("frontmatter missing `khai` type");
  else if (!typeIds.includes(khai)) e.push(`unknown khai type: ${khai}`);
  else if (khai !== khai.toLowerCase()) e.push(`khai type must be lowercase: ${khai}`);
  if (!doc.data.license) e.push("frontmatter missing `license`");
  const stamp = doc.data.stamp;
  if (!stamp || typeof stamp !== "object") e.push("frontmatter missing `stamp`");
  else {
    for (const k of Object.keys(stamp)) {
      if (!STAMP_KEYS.includes(k)) e.push(`unknown stamp key: ${k}`);
    }
    for (const k of STAMP_KEYS) {
      if (!stamp[k]) e.push(`stamp missing ${k}`);
    }
  }
  // Each extra key declares its allowed enum and whether it is required. A bare
  // array is shorthand for an optional key with that enum.
  for (const [k, spec] of Object.entries(extra)) {
    const values = Array.isArray(spec) ? spec : spec?.values;
    const required = Array.isArray(spec) ? false : Boolean(spec?.required);
    if (required && !(k in doc.data)) e.push(`frontmatter missing required key: ${k}`);
    if (k in doc.data && Array.isArray(values) && !values.includes(doc.data[k]))
      e.push(`frontmatter "${k}" must be one of [${values.join(", ")}], got "${doc.data[k]}"`);
  }
  return e;
}

// --- H1: "# <Type>: <Name>", exactly one ---------------------------------
export function checkH1(doc, { type }) {
  const first = doc.headers[0];
  if (!first || first.level !== 1) return { name: null, errors: ["missing H1 title line"] };
  // Exactly one H1 (#) per instance -- the title line. By design a khai file
  // never carries a second first-level header; a second `#` is structural drift.
  const count = doc.headers.filter((h) => h.level === 1).length;
  const extra = count > 1 ? [`a khai file has exactly one H1 (#); found ${count}`] : [];
  const m = new RegExp(`^${escapeRe(proper(type))}: (.+)$`).exec(first.text);
  if (!m)
    return {
      name: null,
      errors: [...extra, `H1 must read "# ${proper(type)}: <Name>", got "# ${first.text}"`],
    };
  return { name: m[1].trim(), errors: extra };
}

// --- title: present, and echoes the H1 name ------------------------------
// The frontmatter `title` must be present and must equal the instance's H1 name
// ("# Type: Name"), so stripping the YAML (e.g. before handing content to an
// LLM) loses nothing -- the rendered title is recoverable from the markdown
// alone. This holds for every type, play included: a play's title echoes its
// H1, not its `## Name` chapter (that chapter carries the production's billed
// name, a separate concern the validator leaves alone). This is the frontmatter
// `title` key -- distinct from the retired `## Title` section spelling (now
// `## Taxonomy`).
export function checkTitle(doc, { type, resolvedLanguage }) {
  if (!doc.ok) return []; // a parse failure is reported by checkFrontmatter
  const title = doc.data?.title;
  if (typeof title !== "string" || title.trim() === "") return ["frontmatter missing `title`"];

  // Enforce presence of `declared` key in frontmatter if language is not "english"
  const isEnglish = !resolvedLanguage || resolvedLanguage === "english";
  const declared = doc.data?.declared;

  if (!isEnglish) {
    if (typeof declared !== "string" || declared.trim() === "") {
      return ["frontmatter missing `declared` for non-english play"];
    }
  }

  // Echo H1 name against declared if present, otherwise against title
  const expectedMatch = declared !== undefined && declared !== null ? declared : title;

  // Echo against the H1 name. A malformed/absent H1 is already reported by
  // checkH1, so when there is no name to echo we stay silent rather than
  // double-report it.
  const { name } = checkH1(doc, { type });
  if (!name) return [];
  if (expectedMatch.trim() !== name)
    return [`frontmatter title/declared "${expectedMatch}" must match the H1 name "${name}"`];
  return [];
}

// --- H2 set: exact, ordered, closed --------------------------------------
export function checkH2SetAndOrder(doc, { expected }) {
  const got = doc.headers.filter((h) => h.level === 2).map((h) => h.text);
  if (got.length === expected.length && got.every((t, i) => t === expected[i])) return [];
  return [
    `H2 sections must be exactly, in order: [${expected.join(", ")}]; ` + `got [${got.join(", ")}]`,
  ];
}

// --- Owner: bullets, closed key whitelist, expected values ----------------
export function checkOwner(doc, { expected }) {
  const lines = sectionBody(doc.body, "Owner");
  if (lines === null) return ["missing `## Owner` section"];
  const got = {};
  const e = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    // Split on the first colon, then trim both sides in JS. Avoids lazy
    // quantifiers + trailing \s*$ (polynomial backtracking on adversarial,
    // user-submitted markdown).
    const m = /^-[ \t]+([A-Za-z][A-Za-z ]*):(.*)$/.exec(line);
    if (!m) {
      e.push(`malformed Owner line: "${line.trim()}"`);
      continue;
    }
    const key = m[1].trimEnd();
    const value = m[2].trim();
    got[key] = value;
  }
  const want = Object.keys(expected);
  for (const k of Object.keys(got)) {
    if (!want.includes(k)) e.push(`unknown Owner key: ${k}`);
  }
  for (const k of want) {
    if (!(k in got)) e.push(`Owner missing key: ${k}`);
    else if (got[k] !== expected[k]) e.push(`Owner.${k} must be "${expected[k]}", got "${got[k]}"`);
  }
  return e;
}

// --- extensions: H3+ are engine-governed; deny any not declared -----------
export function checkExtensions(doc, { allowed = new Set() } = {}) {
  return doc.headers
    .filter((h) => h.level >= 3 && !allowed.has(h.text))
    .map(
      (h) =>
        `undeclared extension "${"#".repeat(h.level)} ${h.text}" ` +
        `(line ${h.line}); H3+ are engine-imposed and none are declared`,
    );
}

// --- links: relative .md targets must resolve ----------------------------
// `exempt` is a set of basenames that need not resolve in the local tree
// because they are wiring references into an installed engine (resolved via
// npm, not co-located) -- e.g. a consumer persona links `position_female.md`,
// which lives in node_modules, not next to the persona.
export function checkLinks(text, baseDir, { exempt = new Set(), resolvePackageDir } = {}) {
  const e = [];
  // Single bounded char-class capture for the link target. No adjacent
  // quantifiers that can match the same input, so the global scan stays
  // linear on adversarial input like "[[[[..." (CodeQL polynomial-regex).
  const re = /\]\(([^()\s]+)\)/g;
  let m;
  while ((m = re.exec(text))) {
    const target = m[1].split("#")[0];
    // Empty (a pure "#anchor") or an external URI scheme (http://, mailto:, ...)
    // addresses nothing on this disk -- not a local link to resolve.
    if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    // A package-specifier link (`@scope/name/member.md`) references another
    // package the consumer must DECLARE as a dependency -- the hard-reference
    // contract of the composite layer. The caller supplies the resolution
    // (resolvePackageDir: name -> dir for a declared+installed package, else
    // null); without a resolver the link fails closed, because a reference
    // nobody can resolve is a claim nobody can check.
    const pkgMatch = /^(@[^/\s]+\/[^/\s]+)\/(.+)$/.exec(target);
    if (pkgMatch) {
      const [, pkgName, rest] = pkgMatch;
      const pkgDir = resolvePackageDir ? resolvePackageDir(pkgName) : null;
      if (!pkgDir)
        e.push(
          `package link ${target}: "${pkgName}" is not a declared, installed dependency -- ` +
            `a hard reference must be backed by a dependency the package.json names`,
        );
      else if (!existsSync(join(pkgDir, rest)))
        e.push(`package link ${target}: "${rest}" does not exist in the installed ${pkgName}`);
      continue;
    }
    if (exempt.has(target.split("/").pop())) continue;
    // A relative link must resolve to a file that exists. The canon writes every
    // intra-content link to a sibling `.md`, so a target that drops the
    // extension (`[x](pitch_kri)` for `pitch_kri.md`) is the common miss and the
    // one the ".md-only" check used to wave through. Resolve the target as
    // written; only then is a link that points at nothing -- extension or not --
    // caught. Flag the missing-extension case distinctly so the fix is obvious.
    if (existsSync(join(baseDir, target))) continue;
    if (!target.endsWith(".md") && existsSync(join(baseDir, `${target}.md`)))
      e.push(`broken link: ${target} (missing .md extension; did you mean ${target}.md?)`);
    else e.push(`broken link: ${target}`);
  }
  return e;
}

// --- wiring: an instance must link a required engine target ---------------
// Engines declare, in their manifest `requires`, that instances of a given
// khai type must link one of the engine's files (resolved to basenames) inside
// a named section -- e.g. gender requires every persona to link one of its
// expressions under Projection. The kit only enforces what the engine declared;
// the rule itself lives nowhere but here, so a requirement has one home.
// Two extra fields sharpen the check where installed engines collide on a
// filename (`package`: the engine's own npm name; `ambiguous`: the basenames
// shipped by more than one installed engine). A bare link satisfies the
// requirement only while its basename is unambiguous among installed engines;
// where two engines ship the file, the link must qualify its package
// (`@scope/engine/member.md`) or it names nothing determinate -- and a link
// qualified to a DIFFERENT package never satisfies this engine's requirement,
// however familiar the basename. Both fields are optional: without them the
// check keeps its original basename behavior.
export function checkWiring(doc, { section, targets, engine, package: pkgName, ambiguous }) {
  const lines = sectionBody(doc.body, section);
  if (lines === null)
    return [`wiring(${engine}): missing "## ${section}" section to carry the required link`];
  const found = linkTargets(lines.join("\n"));
  const ambiguousHits = [];
  for (const { base, pkg } of found) {
    if (!targets.has(base)) continue;
    if (pkg) {
      // Qualified: counts only for the engine it names.
      if (!pkgName || pkg === pkgName) return [];
      continue;
    }
    if (ambiguous && ambiguous.has(base)) {
      ambiguousHits.push(base);
      continue;
    }
    return [];
  }
  if (ambiguousHits.length) {
    const qualified = pkgName ? `${pkgName}/${ambiguousHits[0]}` : `<package>/${ambiguousHits[0]}`;
    return [
      `wiring(${engine}): "## ${section}" links [${[...new Set(ambiguousHits)].join(", ")}], ` +
        `but more than one installed engine ships that file -- a bare link names nothing ` +
        `determinate; qualify it (${qualified})`,
    ];
  }
  const want = [...targets].join(", ");
  const got = found.length
    ? found.map((f) => (f.pkg ? `${f.pkg}/${f.base}` : f.base)).join(", ")
    : "no links";
  return [`wiring(${engine}): "## ${section}" must link one of [${want}]; found [${got}]`];
}

/** Basenames of every relative markdown link target in a block of text. */
function linkBasenames(text) {
  return linkTargets(text).map((t) => t.base);
}

/** Structured link targets: the basename, plus the package a specifier link
 * (`@scope/name/member.md`) qualifies it with (null for a bare/relative link). */
function linkTargets(text) {
  const re = /\]\(([^()\s]+)\)/g;
  const out = [];
  let m;
  while ((m = re.exec(text))) {
    const target = m[1].split("#")[0];
    if (!target || /^https?:\/\//.test(target)) continue;
    const pkgMatch = /^(@[^/\s]+\/[^/\s]+)\/(.+)$/.exec(target);
    if (pkgMatch) out.push({ base: pkgMatch[2].split("/").pop(), pkg: pkgMatch[1] });
    else out.push({ base: target.split("/").pop(), pkg: null });
  }
  return out;
}

// --- link text: never a technical filename --------------------------------
// A link's *text* is read literally by an LLM, so it must carry meaning, not a
// token: `[gender](position_gender.md)` is good; `[position_gender.md](...)`
// injects a noisy filename, and `[](...)` injects nothing. Flag any link whose
// text is empty or looks like a filename (ends in a known extension, or equals
// the target's basename). External (http) links are exempt.
export function checkLinkText(text) {
  const e = [];
  // Fix: Avoid polynomial ReDoS on malicious input; use negated char class without nested brackets (CodeQL #215).
  const re = /\[([^\[\]\n]*)\]\(([^()\s]+)\)/g;
  let m;
  while ((m = re.exec(text))) {
    const label = m[1].trim();
    const target = m[2].split("#")[0];
    if (/^https?:\/\//.test(target)) continue;
    const base = target.split("/").pop();
    if (!label) e.push(`empty link text for "${target}"; use a natural name`);
    else if (/\.(md|mjs|json|ts|js)$/i.test(label) || label === base)
      e.push(`link text "${label}" is a filename; use a natural name (e.g. [gender](${base}))`);
  }
  return e;
}

// --- connectivity: no file hangs loose ------------------------------------
// The engine's docs should form one link graph (the Obsidian view): no orphan.
// Given [{ name, text }], build an undirected graph from the relative markdown
// links between the named files and return the names with no edge to any other
// file in the set. Pure: the package walk that feeds it lives in validate.mjs.
export function looseFiles(files) {
  const names = new Set(files.map((f) => f.name));
  const degree = new Map(files.map((f) => [f.name, 0]));
  const re = /\]\(([^()\s]+)\)/g;
  for (const f of files) {
    let m;
    while ((m = re.exec(f.text))) {
      const target = m[1].split("#")[0].split("/").pop();
      if (target && names.has(target) && target !== f.name) {
        degree.set(f.name, degree.get(f.name) + 1);
        degree.set(target, degree.get(target) + 1);
      }
    }
  }
  return files.filter((f) => degree.get(f.name) === 0).map((f) => f.name);
}

// --- clause dash: the LLM's favourite punctuation, not the house voice -----
// em/en-dash are caught by checkEncoding; this catches the *spaced hyphen*
// " - " used as a clause separator (the em-dash in disguise). The house voice
// uses , ; : ( ) instead. A line-start list marker ("- ") and a "---" fence are
// not clause dashes and are exempt.
export function checkClauseDash(text) {
  const e = [];
  text.split("\n").forEach((line, i) => {
    if (/^\s*-{3,}\s*$/.test(line)) return; // --- fence / thematic rule
    // drop a leading bullet marker, then numeric ranges (the CVI sanctions a
    // spaced hyphen between numbers, e.g. "400 - 500"). A tab around the hyphen
    // is the same clause dash as a space, so match either ([ \t]).
    const body = line.replace(/^\s*[-*]\s+/, "").replace(/\d[ \t]-[ \t]\d/g, " ");
    if (/\S[ \t]-[ \t]\S/.test(body))
      e.push(`line ${i + 1}: spaced hyphen " - " as a clause dash; use , ; : or ()`);
  });
  return e;
}

// --- footer: no trailing version/attribution stamp ------------------------
// Lifted files carry footers like "_v0.3.0 - KAI Cultures_"; metadata belongs
// in YAML frontmatter, not a footer. Flag a trailing italic-underscore line.
export function checkNoFooter(text) {
  // Fix: Avoid polynomial ReDoS in /\s+$/ by using trimEnd() instead (CodeQL: polynomial-redos).
  const lines = text.trimEnd().split("\n");
  const last = (lines[lines.length - 1] ?? "").trim();
  if (/^_.+_$/.test(last))
    return [`trailing footer "${last}"; put metadata in YAML frontmatter, not a footer`];
  return [];
}

// --- frontmatter present: metadata lives in YAML, not prose ---------------
// A doc whose metadata must be machine-readable (e.g. REFERENCES) needs a
// leading "---" YAML block, not a "**Bold:**" header that no validator can read.
export function checkHasFrontmatter(text) {
  // Tolerate CRLF line endings and a leading BOM, both of which gray-matter
  // parses fine: matching only "\n" reported a valid CRLF file as having no
  // frontmatter (a false positive that contradicted the actual parse).
  const body = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  return /^---\r?\n[\s\S]*?\r?\n---\r?\n/.test(body)
    ? []
    : ["missing YAML frontmatter (a leading --- block); metadata must not live in prose"];
}
