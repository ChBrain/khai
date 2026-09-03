// What one markdown link points at, in a house that is mid-migration.
//
// A house used to cast its neighbours one way. `nordics` still does:
// `](../../cultures/denmark/play_denmark.md)`, a relative path across one
// tarball. A house that runs a migration ratchet casts them the other way too,
// because a unit that has left the umbrella is reachable only through npm:
// `](@chbrain/khai-cultures-germany/play_germany.md)`. Both shapes are live in
// one house at once, for as long as the walk lasts -- which is forever in
// practice, since the walk is one-way and unfinished by design.
//
// WHY THIS FILE EXISTS. `referencedIds` resolved the relative shape and only
// that shape, so on the day DACH's three members became packages the derivation
// stopped seeing casts that were still plainly there in the file. It did not
// fail: it derived the empty set, the field was omitted because it was empty,
// and the house published a group that referenced nothing. Nineteen groups, one
// of them silently hollow, and nothing in the build said so.
//
// So there is one rule and every reader goes through it. A second
// implementation of "what does this link point at" -- in the registry build, in
// a consumer's link rewriter, in a house's own gate -- is the same divergence
// the relink rule was moved here to end, and this rule now has two vantages to
// stay identical across rather than one.

import { readFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";

/** A bare `@scope/name` prefix, and the rest of the specifier after it. */
const SPECIFIER = /^(@[a-z0-9-][a-z0-9-._~]*\/[a-z0-9-][a-z0-9-._~]*)\/(.+)$/;

/**
 * Where a markdown link target lands, read from `fromFile` in a house whose
 * units live under `unitsDir` or in packages named by `packageIds`.
 *
 * Returns:
 *   `{ unitId, file }`   the link lands in a unit of that house, either shape
 *   `{ external: href }` an absolute URL: another house's problem, not a unit
 *   `null`               anything else -- a sibling file, a link out of the
 *                        collection, a specifier for a package this house does
 *                        not know
 *
 * `packageIds` maps an npm name to the unit id that package ships. It is the
 * caller's to supply because the mapping is a HOUSE's rule, not the kit's: the
 * cultures house derives `@chbrain/khai-cultures-de-bavaria` from `de_bavaria`
 * by a naming rule frozen before its first publish, and a kit that hard-coded
 * that rule would be wrong for the next house to migrate. Omitted, the
 * specifier shape simply does not resolve -- which is safe here only because a
 * referencing entry that derives NO references is now a build error, so a
 * forgotten map goes red rather than quiet.
 *
 * @param {string} href the raw link target, fragment and all
 * @param {{ fromFile: string, unitsDir: string, packageIds?: Map<string,string> }} where
 * @returns {{ unitId: string, file: string } | { external: string } | null}
 */
export function linkTarget(href, { fromFile, unitsDir, packageIds = new Map() }) {
  const raw = String(href ?? "").trim();
  if (!raw) return null;
  const target = raw.split("#")[0];
  if (!target) return null; // a bare "#anchor": this file, not a unit
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(target) || target.startsWith("mailto:"))
    return { external: raw };

  const spec = SPECIFIER.exec(target);
  if (spec) {
    const unitId = packageIds.get(spec[1]);
    return unitId ? { unitId, file: spec[2] } : null;
  }

  // The relative shape. Resolved against the casting file's own directory and
  // then measured against the collection, so a link that climbs out of the
  // house ("../../../elsewhere") lands outside and is not a unit.
  const rel = relative(resolve(unitsDir), resolve(dirname(fromFile), target));
  if (!rel || rel.startsWith("..") || isAbsolute(rel)) return null;
  const parts = rel.split(/[/\\]/);
  const unitId = parts.shift();
  if (!unitId) return null;
  return { unitId, file: parts.join("/") };
}

/**
 * Every unit id a file casts, sorted and deduplicated: the build-derived
 * `references` of a referencing entry.
 *
 * Both shapes count. Which one a cast happens to wear is a fact about where the
 * migration ratchet has got to, and a group's membership must not depend on it.
 *
 * @param {string} file absolute path to the casting file (a group's anchor)
 * @param {string} unitsDir absolute path to the referenced collection's dir
 * @param {Map<string,string>} [packageIds] npm name -> unit id
 * @returns {string[]}
 */
export function castIds(file, unitsDir, packageIds = new Map()) {
  const text = readFileSync(file, "utf8");
  const ids = new Set();
  for (const m of text.matchAll(/\]\(([^()\s]+)\)/g)) {
    const hit = linkTarget(m[1], { fromFile: file, unitsDir, packageIds });
    if (hit && hit.unitId) ids.add(hit.unitId);
  }
  return [...ids].sort((a, b) => a.localeCompare(b));
}
