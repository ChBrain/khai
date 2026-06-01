// Rule atoms. Each takes already-parsed input and returns a list of error
// strings (empty = pass). They are pure and composable: the same atoms run in
// package mode (one file) and suite mode (every file), so a rule has exactly
// one home. Lifting a check = adding an atom here and wiring it into validate.

import { existsSync } from "node:fs";
import { join } from "node:path";
import { sectionBody } from "./parse.mjs";

const proper = (typeId) => typeId.charAt(0).toUpperCase() + typeId.slice(1);

// --- encoding -------------------------------------------------------------
export function checkEncoding(text) {
  const e = [];
  if (text.charCodeAt(0) === 0xfeff) e.push("BOM present");
  if (/\r\n/.test(text)) e.push("CRLF present");
  if (/[–—]/.test(text)) e.push("en/em-dash present (use --)");
  if (text.length > 0 && !text.endsWith("\n")) e.push("no LF at EOF");
  return e;
}

// --- frontmatter: closed keys, known type, stamp shape --------------------
const FM_KEYS = ["khai", "license", "stamp"];
const STAMP_KEYS = ["owner", "version", "date"];

export function checkFrontmatter(doc, { typeIds }) {
  const e = [];
  if (!doc.ok) return [`frontmatter does not parse: ${doc.error}`];
  const keys = Object.keys(doc.data);
  for (const k of keys) {
    if (!FM_KEYS.includes(k)) e.push(`unknown frontmatter key: ${k}`);
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
  return e;
}

// --- H1: "# <Type>: <Name>" ----------------------------------------------
export function checkH1(doc, { type }) {
  const first = doc.headers[0];
  if (!first || first.level !== 1) return { name: null, errors: ["missing H1 title line"] };
  const m = new RegExp(`^${proper(type)}: (.+)$`).exec(first.text);
  if (!m)
    return {
      name: null,
      errors: [`H1 must read "# ${proper(type)}: <Name>", got "# ${first.text}"`],
    };
  return { name: m[1].trim(), errors: [] };
}

// --- H2 set: exact, ordered, closed --------------------------------------
export function checkH2SetAndOrder(doc, { expected }) {
  const got = doc.headers.filter((h) => h.level === 2).map((h) => h.text);
  if (got.length === expected.length && got.every((t, i) => t === expected[i])) return [];
  return [
    `H2 sections must be exactly, in order: [${expected.join(", ")}]; ` + `got [${got.join(", ")}]`,
  ];
}

// --- Title: present, non-empty, equals the H1 name ------------------------
export function checkTitle(doc, { name }) {
  const lines = sectionBody(doc.body, "Title");
  if (lines === null) return ["missing `## Title` section"];
  const value = lines.join("\n").trim();
  if (!value) return ["`## Title` is empty"];
  if (name && value !== name)
    return [`\`## Title\` ("${value}") must match the H1 name ("${name}")`];
  return [];
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
export function checkLinks(text, baseDir) {
  const e = [];
  // Single bounded char-class capture for the link target. No adjacent
  // quantifiers that can match the same input, so the global scan stays
  // linear on adversarial input like "[[[[..." (CodeQL polynomial-regex).
  const re = /\]\(([^()\s]+)\)/g;
  let m;
  while ((m = re.exec(text))) {
    const target = m[1].split("#")[0];
    if (!target || /^https?:\/\//.test(target)) continue;
    if (target.endsWith(".md") && !existsSync(join(baseDir, target)))
      e.push(`broken link: ${target}`);
  }
  return e;
}

// --- wiring: an instance must link a required engine target ---------------
// Engines declare, in their manifest `requires`, that instances of a given
// khai type must link one of the engine's files (resolved to basenames) inside
// a named section -- e.g. gender requires every persona to link one of its
// expressions under Projection. The kit only enforces what the engine declared;
// the rule itself lives nowhere but here, so a requirement has one home.
export function checkWiring(doc, { section, targets, engine }) {
  const lines = sectionBody(doc.body, section);
  if (lines === null)
    return [`wiring(${engine}): missing "## ${section}" section to carry the required link`];
  const found = linkBasenames(lines.join("\n"));
  if (found.some((b) => targets.has(b))) return [];
  const want = [...targets].join(", ");
  const got = found.length ? found.join(", ") : "no links";
  return [`wiring(${engine}): "## ${section}" must link one of [${want}]; found [${got}]`];
}

/** Basenames of every relative markdown link target in a block of text. */
function linkBasenames(text) {
  const re = /\]\(([^()\s]+)\)/g;
  const out = [];
  let m;
  while ((m = re.exec(text))) {
    const target = m[1].split("#")[0];
    if (!target || /^https?:\/\//.test(target)) continue;
    out.push(target.split("/").pop());
  }
  return out;
}
