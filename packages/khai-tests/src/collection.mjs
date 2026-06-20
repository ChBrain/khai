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

/**
 * The `kind` discriminator stamped on a collection's registry entries — the field
 * the website reads to tell a culture from a group. An explicit `kind` on the
 * spec wins; otherwise it is the singular of the key (cultures -> culture,
 * plays -> play, groups -> group), the same rule that singularizes the anchor.
 * Kept out of {@link resolveCollection} so that function's `{dir,key,anchor}`
 * shape (and its callers) stay byte-identical.
 * @param {*} spec  the raw collection spec (string or object) or undefined
 * @param {string} key  the resolved collection key
 * @returns {string}
 */
export function collectionKind(spec, key) {
  if (spec && typeof spec === "object" && typeof spec.kind === "string" && spec.kind.trim()) {
    return spec.kind.trim();
  }
  return String(key).replace(/s$/, "");
}

/**
 * Every collection a house indexes: the **primary** (counted) collection first,
 * then any **referencing** collections declared in `khai.collections`. Each
 * carries `{ dir, key, anchor, kind }`; a referencing collection adds
 * `references`, the key of the collection whose items its entries link (default:
 * the primary key). The primary is {@link resolveCollection} enriched with its
 * kind, so a house that declares no extra collections behaves exactly as before.
 * @param {object} [pkg] the parsed package.json
 * @returns {{ dir: string, key: string, anchor: string, kind: string, references?: string }[]}
 */
export function resolveCollections(pkg) {
  const primaryBase = resolveCollection(pkg);
  const primary = { ...primaryBase, kind: collectionKind(pkg?.khai?.collection, primaryBase.key) };
  const extra = Array.isArray(pkg?.khai?.collections) ? pkg.khai.collections : [];
  const referencing = extra.map((spec) => {
    const base = resolveCollection({ khai: { collection: spec } });
    const references =
      spec && typeof spec === "object" && typeof spec.references === "string"
        ? spec.references
        : primary.key;
    return { ...base, kind: collectionKind(spec, base.key), references };
  });
  return [primary, ...referencing];
}

/**
 * Every collection a house at `root` indexes, read from its package.json.
 * @param {string} root
 * @returns {{ dir: string, key: string, anchor: string, kind: string, references?: string }[]}
 */
export function resolveCollectionsAt(root) {
  return resolveCollections(safePackageJson(root));
}
