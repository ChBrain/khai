import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative, isAbsolute } from "node:path";
import { parseDoc } from "@chbrain/khai-rules";
import { validateCollectionRegistry } from "./validate.mjs";
import { resolveCollection, resolveCollectionAt, resolveCollections } from "./collection.mjs";

export { resolveCollection, resolveCollections };

/**
 * Count the items in a house's collection: the same set the registry and the
 * numbering guard count, i.e. each non-hidden subdirectory of the collection dir
 * that holds an anchor file (`<anchor>*.md`).
 * @param {string} root
 * @param {{ dir: string, key: string, anchor: string }} [collection]
 * @returns {number}
 */
export function countItems(root, collection = resolveCollectionAt(root)) {
  const itemsDir = join(root, collection.dir);
  if (!existsSync(itemsDir)) return 0;
  let n = 0;
  for (const e of readdirSync(itemsDir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith(".")) continue;
    if (
      readdirSync(join(itemsDir, e.name)).some(
        (f) => f.startsWith(collection.anchor) && f.endsWith(".md"),
      )
    )
      n++;
  }
  return n;
}

/**
 * Count the plays in a house. Back-compat alias for {@link countItems}, which
 * resolves the collection from package.json (plays when unset).
 * @param {string} root
 * @returns {number}
 */
export function countPlays(root) {
  return countItems(root);
}

/**
 * The house numbering rule, computed not chosen: the minor version IS the play
 * count. Derive the version from the count, preserving the major (a house stays
 * 0.x; the guard flags a non-zero major) and the patch (changeset-driven), but
 * resetting the patch to 0 whenever the count moves the minor, since a fresh
 * minor line starts at .0. This makes the build the single writer of the minor,
 * so a manual edit or a stray minor changeset that drifted it is healed on the
 * next build rather than shipped.
 * @param {string} currentVersion  the version currently in package.json
 * @param {number} count           the play count
 * @returns {string} the derived semver version
 */
export function deriveVersionFrom(currentVersion, count) {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(String(currentVersion ?? ""));
  const major = m ? Number(m[1]) : 0;
  const curMinor = m ? Number(m[2]) : -1;
  const patch = m ? Number(m[3]) : 0;
  return `${major}.${count}.${count === curMinor ? patch : 0}`;
}

/**
 * The derived version for a house at `root`: its package.json version with the
 * minor reconciled to the play count. Pure read; does not write.
 * @param {string} root
 * @returns {string}
 */
export function deriveHouseVersion(root) {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  return deriveVersionFrom(pkg.version, countItems(root, resolveCollection(pkg)));
}

/**
 * The optional `iso` a per-item `geo.json` sidecar places on its registry entry.
 * A generic per-item sidecar (not a cultures concept): absent file or absent
 * `iso` ⇒ the entry is non-mappable. Read leniently — a malformed sidecar simply
 * contributes no `iso` rather than failing the build.
 * @param {string} itemSubdir
 * @returns {string|undefined}
 */
function readGeoIso(itemSubdir) {
  const geoPath = join(itemSubdir, "geo.json");
  if (!existsSync(geoPath)) return undefined;
  try {
    const geo = JSON.parse(readFileSync(geoPath, "utf8"));
    if (geo && typeof geo.iso === "string" && geo.iso.trim()) return geo.iso.trim();
  } catch {
    /* a broken sidecar is non-mappable, not a build failure */
  }
  return undefined;
}

/**
 * The item ids a referencing entry casts: the build-derived `references`. Every
 * inline link in the anchor file that resolves under `referencedDir` contributes
 * its item id (the first path segment beneath that dir). Derived, never authored —
 * and since those links are the same casts `checkLinks` gates, a reference can
 * never point at a member that does not exist.
 * @param {string} anchorFile  absolute path to the referencing item's anchor
 * @param {string} referencedDir  absolute path to the referenced collection's dir
 * @returns {string[]} unique ids, sorted
 */
function referencedIds(anchorFile, referencedDir) {
  const text = readFileSync(anchorFile, "utf8");
  const anchorDir = dirname(anchorFile);
  const refRoot = resolve(referencedDir);
  const ids = new Set();
  const re = /\]\(([^()\s]+)\)/g;
  let m;
  while ((m = re.exec(text))) {
    const target = m[1].split("#")[0];
    if (!target || /^[a-z]+:\/\//i.test(target)) continue;
    const rel = relative(refRoot, resolve(anchorDir, target));
    if (rel.startsWith("..") || isAbsolute(rel)) continue; // not under the referenced dir
    const id = rel.split(/[/\\]/)[0];
    if (id) ids.add(id);
  }
  return [...ids].sort((a, b) => a.localeCompare(b));
}

/**
 * Build the registry entries for one collection: each item's `{ kind, id, title,
 * description }`, plus an optional `iso` (from a `geo.json` sidecar) and, for a
 * referencing collection, the build-derived `references`. A missing collection
 * dir yields no entries (a house may declare a referencing collection before it
 * holds any items).
 * @param {string} root
 * @param {{ dir: string, key: string, anchor: string, kind: string, references?: string }} collection
 * @param {{ key: string, dir: string }[]} allCollections  for resolving `references` targets
 * @returns {object[]}
 */
function buildItems(root, collection, allCollections) {
  const itemsDir = join(root, collection.dir);
  if (!existsSync(itemsDir)) return [];

  const subdirs = readdirSync(itemsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

  const referencedDir = collection.references
    ? allCollections.find((c) => c.key === collection.references)?.dir
    : undefined;

  const items = [];
  for (const id of subdirs) {
    const itemSubdir = join(itemsDir, id);
    const files = readdirSync(itemSubdir);
    const anchorFileName = files.find((f) => f.startsWith(collection.anchor) && f.endsWith(".md"));
    if (!anchorFileName) {
      console.warn(
        `Warning: anchor file ${collection.anchor}*.md not found in ${collection.dir}/${id}`,
      );
      continue;
    }

    const anchorFile = join(itemSubdir, anchorFileName);

    const text = readFileSync(anchorFile, "utf8");
    const doc = parseDoc(text);
    if (!doc.ok) {
      throw new Error(
        `failed to parse anchor frontmatter of ${collection.dir}/${id}/${anchorFileName}`,
      );
    }

    const title = doc.data?.title || id;

    // The registry is the English-facing index, so the description is the
    // canon's own one-line `description:` from frontmatter (the same English
    // slot as `title`). Fall back to the first ## Arc paragraph (the
    // declared-language synopsis the book reads) only when no frontmatter
    // description is authored, so a house keeps building while its plays adopt
    // the field.
    let description = typeof doc.data?.description === "string" ? doc.data.description.trim() : "";
    if (!description) {
      const content = doc.body || "";
      const arcMatch = content.match(/^##\s+Arc\s*$/im);
      if (arcMatch) {
        const startIndex = arcMatch.index + arcMatch[0].length;
        const rest = content.slice(startIndex).trim();
        const nextHeadingMatch = rest.match(/^##\s+/m);
        const sectionText = nextHeadingMatch ? rest.slice(0, nextHeadingMatch.index).trim() : rest;
        const paragraphs = sectionText
          .split(/\r?\n\r?\n/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
        description = paragraphs[0] || "";
      }
    }

    // kind first: the discriminator the website reads, explicit on every entry.
    const entry = { kind: collection.kind, id, title, description };

    const iso = readGeoIso(itemSubdir);
    if (iso) entry.iso = iso;

    if (referencedDir) {
      const refs = referencedIds(anchorFile, join(root, referencedDir));
      if (refs.length) entry.references = refs;
    }

    items.push(entry);
  }

  // items are pushed in subdir order, which is already sorted by localeCompare
  // above, so the output is deterministic without a second sort.
  return items;
}

/**
 * Compute the registry a house's source *would* build to, writing nothing. The
 * pure core shared by {@link buildRegistry} (which writes it) and the conformance
 * drift check (which compares the committed file against it), so the build is
 * provably the single writer of `registry.json` and a hand edit is caught, not
 * shipped.
 * @param {string} root
 * @returns {{ registryData: object, version: string, packageJson: object,
 *   packageJsonPath: string, registryPath: string }}
 */
export function computeRegistry(root) {
  const packageJsonPath = join(root, "package.json");
  if (!existsSync(packageJsonPath)) {
    throw new Error(`missing package.json at ${root}`);
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const name = packageJson.name;

  const collections = resolveCollections(packageJson);
  const primary = collections[0];
  const primaryDir = join(root, primary.dir);
  if (!existsSync(primaryDir)) {
    throw new Error(`missing ${primary.dir} directory at ${root}`);
  }

  // One array per collection, keyed by its key (cultures, groups, ...). Referencing
  // collections ride alongside; only the primary feeds the version count below.
  const arrays = {};
  for (const collection of collections) {
    arrays[collection.key] = buildItems(root, collection, collections);
  }
  const primaryItems = arrays[primary.key];

  // The minor IS the primary item count: derive the version so the build is the
  // single writer of the minor. Referencing collections (e.g. groups) never move it.
  const version = deriveVersionFrom(packageJson.version, primaryItems.length);

  const registryData = {
    $schema: "http://json-schema.org/draft-07/schema#",
    name,
    version,
    ...arrays,
  };

  return {
    registryData,
    version,
    packageJson,
    packageJsonPath,
    registryPath: join(root, "registry.json"),
  };
}

export function buildRegistry(root) {
  const { registryData, version, packageJson, packageJsonPath, registryPath } =
    computeRegistry(root);

  // Reconcile package.json (the published artifact; registry.json is not in the
  // package files) so the build is the single writer of the minor.
  if (packageJson.version !== version) {
    packageJson.version = version;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n", "utf8");
  }

  writeFileSync(registryPath, JSON.stringify(registryData, null, 2) + "\n", "utf8");

  // build extracts blurbs best-effort; surface (without failing) anything the
  // verify gate will later reject so the author can fix it before committing.
  const check = verifyRegistry(root);
  if (!check.ok) {
    console.warn("Warning: built registry.json does not yet pass verification:");
    for (const err of check.errors) {
      console.warn(`  - ${err}`);
    }
  }
}

export function verifyRegistry(root) {
  const results = validateCollectionRegistry(root);
  if (results.length > 0) {
    return {
      ok: false,
      errors: results[0].errors,
    };
  }
  return { ok: true, errors: [] };
}
