import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Split a content file's YAML frontmatter from its body, on js-yaml 4.2.0 — the
// merge-key quadratic-DoS in gray-matter's bundled js-yaml 3.x (GHSA-h67p-54hq-rp68)
// is closed here. A malformed block throws a YAMLException, exactly the case
// parseMethod's try/catch already absorbs.
function parseFrontmatter(text) {
  let str = String(text);
  if (str.charCodeAt(0) === 0xfeff) str = str.slice(1);
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(str);
  if (!m) return { data: {}, content: str };
  const loaded = yaml.load(m[1]);
  return {
    data: loaded && typeof loaded === "object" ? loaded : {},
    content: str.slice(m[0].length),
  };
}
const methodsDir = join(__dirname, "..", "methods");

/**
 * @typedef {Object} MethodPrompt
 * @property {string} key    - machine key, e.g. "liked"
 * @property {string} label  - display label, e.g. "Liked"
 * @property {string} question - the prompt question
 */

/**
 * @typedef {Object} MethodAttribution
 * @property {string} name
 */

/**
 * @typedef {Object} MethodSource
 * @property {string} title
 * @property {number|null} [published]
 * @property {string|null} [url]
 */

/**
 * @typedef {Object} Method
 * @property {string} id
 * @property {string} name
 * @property {string} type             - taxonomy: "retrospective" | "planning" | "review" | ...
 * @property {MethodAttribution[]} invented_by
 * @property {number|null} [year]
 * @property {MethodSource|null} [source]
 * @property {MethodPrompt[]} prompts
 * @property {string} body             - the markdown description (body, post-frontmatter)
 */

/**
 * Parse a single method file. Returns null on parse error rather than throwing.
 * @param {string} file
 * @returns {Method|null}
 */
function parseMethod(file) {
  // Returns null (never throws) on a read error or malformed YAML frontmatter,
  // so one bad file is dropped by the .filter(Boolean) in listMethods rather
  // than taking down the whole registry. parseFrontmatter throws a YAMLException
  // on invalid frontmatter, which is exactly the case the contract must absorb.
  try {
    const raw = readFileSync(join(methodsDir, file), "utf8");
    const { data, content } = parseFrontmatter(raw);
    if (!data.id || !data.name || !data.type) return null;
    return { ...data, body: content.trim() };
  } catch {
    return null;
  }
}

/**
 * Return every method in the registry, sorted by id.
 * @returns {Method[]}
 */
export function listMethods() {
  return readdirSync(methodsDir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map(parseMethod)
    .filter(Boolean);
}

/**
 * Return a single method by id, or null if not found.
 * @param {string} id
 * @returns {Method|null}
 */
export function loadMethod(id) {
  return listMethods().find((m) => m.id === id) ?? null;
}

/**
 * Return all methods of a given type (e.g. "retrospective").
 * @param {string} type
 * @returns {Method[]}
 */
export function listMethodsByType(type) {
  return listMethods().filter((m) => m.type === type);
}
