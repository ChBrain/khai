// The collection a content house indexes — the one knob that turns the kit from
// "plays only" into "any named collection". A play house declares nothing and
// gets the historical behaviour (the `plays/` dir, the `play_*.md` per-item
// anchor, the `plays` registry key); a house indexing something else (e.g.
// cultures) names it in package.json `khai.collection`. Kept in its own module
// so both the registry builder and the validator resolve it the same way without
// importing one another.

import { readFileSync } from "node:fs";
import { join } from "node:path";

// The default collection: every collection-agnostic code path falls back to
// this, so a house that declares nothing behaves exactly as it did before the
// collection abstraction existed.
export const DEFAULT_COLLECTION = { dir: "plays", key: "plays", anchor: "play_" };

// The per-item anchor file prefix, derived from a collection name by dropping a
// trailing plural "s": plays -> play_, cultures -> culture_. An explicit
// `anchor` in the config overrides this for any name the rule does not fit.
export function singularAnchor(name) {
  return `${String(name).replace(/s$/, "")}_`;
}

/**
 * Read a house's package.json without throwing: a missing or malformed manifest
 * resolves to the default (plays) collection, so the historical no-config houses
 * and the bare-directory test fixtures keep working.
 * @param {string} root
 * @returns {object}
 */
export function safePackageJson(root) {
  try {
    return JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  } catch {
    return {};
  }
}

/**
 * The collection a house indexes, computed from package.json `khai.collection`.
 * Absent -> plays (back-compat). A string is the shorthand (dir == key == name,
 * anchor singularized); an object `{ dir, key, anchor }` overrides any field.
 * @param {object} [pkg] the parsed package.json
 * @returns {{ dir: string, key: string, anchor: string }}
 */
export function resolveCollection(pkg) {
  const c = pkg?.khai?.collection;
  if (!c) return { ...DEFAULT_COLLECTION };
  if (typeof c === "string") {
    return { dir: c, key: c, anchor: singularAnchor(c) };
  }
  const key = c.key || c.dir || DEFAULT_COLLECTION.key;
  const dir = c.dir || key;
  const anchor = c.anchor || singularAnchor(key);
  return { dir, key, anchor };
}

/**
 * The collection a house at `root` indexes, read straight from its package.json.
 * @param {string} root
 * @returns {{ dir: string, key: string, anchor: string }}
 */
export function resolveCollectionAt(root) {
  return resolveCollection(safePackageJson(root));
}
