import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
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
 * @property {string|null} [license]
 * @property {MethodPrompt[]} prompts
 * @property {string} body             - the markdown description (body, post-frontmatter)
 */

/**
 * Parse a single method file. Returns null on parse error rather than throwing.
 * @param {string} file
 * @returns {Method|null}
 */
function parseMethod(file) {
  const raw = readFileSync(join(methodsDir, file), "utf8");
  const { data, content } = matter(raw);
  if (!data.id || !data.name || !data.type) return null;
  return { ...data, body: content.trim() };
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
