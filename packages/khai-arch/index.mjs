// Machine-readable contract for the khai architecture, read at runtime from
// the canon's own type-definition files. The `.md` frontmatter is the single
// source of truth (and is mnemonic-locked by khai-arch's own tests), so this
// export can never drift from the definitions — there is no generated artifact
// to fall out of sync.
//
// Consumers (khai-tests, the configurator website) import `types` instead of
// re-parsing markdown, collapsing N drift points to zero.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import matter from "gray-matter";

const here = dirname(fileURLToPath(import.meta.url));
const archDir = join(here, "architecture");

/**
 * @typedef {Object} KhaiType
 * @property {string} id        canonical slug, equals the `khai:` value instances declare
 * @property {"house"|"element"|"meta"} class
 * @property {string} mnemonic
 * @property {string[]} chapters  required `## <chapter>` sections, in canonical order
 * @property {string} subtitle
 */

/** @type {Record<string, KhaiType>} */
export const types = Object.fromEntries(
  readdirSync(archDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => matter(readFileSync(join(archDir, f), "utf8")).data)
    .filter((d) => d && typeof d.id === "string" && Array.isArray(d.chapters))
    .map((d) => [
      d.id,
      {
        id: d.id,
        class: d.class,
        mnemonic: d.mnemonic,
        chapters: d.chapters,
        subtitle: d.subtitle,
      },
    ]),
);

/**
 * The playbook spine, owned by the canon. model.md declares the ordered groups
 * (each an ordered list of type ids) in a `groups` yaml block; this reads it so
 * consumers render the playbook instead of re-declaring its order or grouping.
 * Parsed via gray-matter by wrapping the block as frontmatter -- no extra yaml
 * dependency.
 * @type {{ id: string, label: string, members: string[] }[]}
 */
const modelText = readFileSync(join(archDir, "model.md"), "utf8");
const groupsBlock = modelText.match(/```ya?ml\n([\s\S]*?)```/);
export const playbook = groupsBlock
  ? (matter(`---\n${groupsBlock[1]}---\n`).data.groups ?? [])
  : [];

/** Required `## ` section headers for a type id, in canonical order. */
export function chaptersFor(typeId) {
  return types[typeId]?.chapters ?? null;
}

/**
 * WIRES: the chapters of an engine card. An engine instance fills the `engines`
 * type (WIRE: Wire, Issue, Require, Enforce) and adds one chapter -- Setup, the
 * instance-specific wiring. Derived from the type so the instance contract can
 * never drift from the definition: WIRES = engines.chapters + Setup.
 * @type {string[]}
 */
export const wiresChapters = [...(chaptersFor("engines") ?? []), "Setup"];

/**
 * Normalize an engine manifest into a flat list of typed members arranged on a
 * composition tree. Each member is { file, type, parent } where `parent` is the
 * file of the member it hangs beneath (null at the root). Two manifest shapes
 * desugar to the same model, so the canon reads one thing:
 *
 *   - explicit:  manifest.members = [{ file, type, parent? }, ...]
 *   - shorthand: manifest.{type, anchor, expressions} -- the anchor is the root,
 *     every expression hangs beneath it, all of the engine's single type.
 *
 * khai-arch owns this shape (it owns the WIRE type); the kit and engine loaders
 * consume the normalized members instead of re-deriving the tree, so the
 * "deeper carries shallower upward" rule lives in exactly one place. Throws on a
 * member with no file, a duplicate file, an unknown type, a dangling parent, no
 * root, more than one root, or a cycle.
 *
 * @param {object} manifest  the package.json `khai` block
 * @returns {{ file: string, type: string, parent: string|null }[]}
 */
export function engineMembers(manifest) {
  if (!manifest || typeof manifest !== "object")
    throw new Error("engineMembers: an engine manifest is required");
  const id = manifest.engine ?? "engine";

  let members;
  if (Array.isArray(manifest.members)) {
    members = manifest.members.map((m) => ({
      file: m?.file,
      type: m?.type,
      parent: m?.parent ?? null,
    }));
  } else {
    const { type, anchor, expressions = {} } = manifest;
    if (typeof anchor !== "string" || !anchor.trim())
      throw new Error(`engineMembers(${id}): manifest needs "members" or an "anchor"`);
    members = [
      { file: anchor, type, parent: null },
      ...Object.values(expressions).map((file) => ({ file, type, parent: anchor })),
    ];
  }

  const byFile = new Map();
  for (const m of members) {
    if (typeof m.file !== "string" || !m.file.trim())
      throw new Error(`engineMembers(${id}): every member needs a "file"`);
    if (byFile.has(m.file))
      throw new Error(`engineMembers(${id}): duplicate member file "${m.file}"`);
    if (typeof m.type !== "string" || !types[m.type])
      throw new Error(`engineMembers(${id}): member "${m.file}" has unknown type "${m.type}"`);
    byFile.set(m.file, m);
  }

  const roots = members.filter((m) => m.parent === null);
  if (roots.length !== 1)
    throw new Error(
      `engineMembers(${id}): exactly one root (parent: null) is required, found ${roots.length}`,
    );
  for (const m of members)
    if (m.parent !== null && !byFile.has(m.parent))
      throw new Error(
        `engineMembers(${id}): member "${m.file}" names parent "${m.parent}", which is not a member`,
      );
  // every member must reach the root within N hops (catches cycles)
  for (const m of members) {
    let cur = m;
    for (let hops = 0; cur.parent !== null; hops++) {
      cur = byFile.get(cur.parent);
      if (hops > members.length)
        throw new Error(`engineMembers(${id}): cycle detected reaching the root from "${m.file}"`);
    }
  }
  return members;
}

/**
 * The composition chains of an engine: for every leaf member (one no other
 * member hangs beneath), the ordered list of files from the root down to that
 * leaf. This is the canon's "carry upward" rule made concrete -- composing a
 * leaf emits its whole chain, root first, so the deeper member carries the
 * shallower ones upward. gender's depth-1 tree yields [anchor, expression]; a
 * process ladder yields [root, channel, width].
 *
 * @param {object} manifest
 * @returns {Record<string, string[]>}  leaf file -> [root, ..., leaf]
 */
export function compositionOrder(manifest) {
  const members = engineMembers(manifest);
  const byFile = new Map(members.map((m) => [m.file, m]));
  const parents = new Set(members.map((m) => m.parent).filter((p) => p !== null));
  const chainOf = (file) => {
    const chain = [];
    for (let cur = byFile.get(file); cur; cur = cur.parent ? byFile.get(cur.parent) : null)
      chain.unshift(cur.file);
    return chain;
  };
  return Object.fromEntries(
    members.filter((m) => !parents.has(m.file)).map((m) => [m.file, chainOf(m.file)]),
  );
}

/**
 * Build a render-ready WIRES card from an engine's `khai` manifest block (the
 * `khai` field of its package.json). The card prose is authored under
 * `manifest.card`, keyed by the lowercased WIRES chapter names (wire, issue,
 * require, enforce, setup). Returns the normalized card; throws if the engine
 * slug or any chapter is missing/empty, or an unknown card key appears.
 *
 * khai-arch owns this shape (it owns the WIRE type); consumers render the
 * returned card and khai-tests enforces it on every installed engine.
 *
 * @param {{ engine?: string, type?: string, anchor?: string, card?: Record<string,string> }} manifest
 * @returns {{ id: string, type: string|null, anchor: string|null, mnemonic: "WIRES", chapters: string[], sections: Record<string,string> }}
 */
export function engineCard(manifest) {
  if (!manifest || typeof manifest !== "object")
    throw new Error("engineCard: an engine manifest (package.json `khai` block) is required");
  const id = manifest.engine;
  if (typeof id !== "string" || !id.trim())
    throw new Error("engineCard: manifest.engine (the engine slug) is required");
  const card = manifest.card;
  if (!card || typeof card !== "object")
    throw new Error(`engineCard(${id}): manifest.card is required -- the WIRES chapters as prose`);

  const allowed = new Set(wiresChapters.map((c) => c.toLowerCase()));
  for (const k of Object.keys(card))
    if (!allowed.has(k)) throw new Error(`engineCard(${id}): unknown card key "${k}"`);

  const sections = {};
  for (const chapter of wiresChapters) {
    const prose = card[chapter.toLowerCase()];
    if (typeof prose !== "string" || !prose.trim())
      throw new Error(`engineCard(${id}): card.${chapter.toLowerCase()} must be non-empty prose`);
    sections[chapter] = prose.trim();
  }

  // type/anchor default to the explicit fields (legacy shorthand); when an
  // engine declares `members` instead, derive them from the root member so the
  // rendered card still names the engine's seam and kind.
  let type = manifest.type ?? null;
  let anchor = manifest.anchor ?? null;
  if ((type === null || anchor === null) && Array.isArray(manifest.members)) {
    const root = engineMembers(manifest).find((m) => m.parent === null);
    type = type ?? root.type;
    anchor = anchor ?? root.file;
  }

  return {
    id,
    type,
    anchor,
    mnemonic: "WIRES",
    chapters: wiresChapters,
    sections,
  };
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
// Linear, not /\s*[–—]\s*/g: that backtracks O(n) per position on long space
// runs (CodeQL polynomial-regex). Replace the dash, then collapse the seam.
const normalizeDashes = (s) => s.replace(/[–—]/g, " - ").replace(/ {2,}/g, " ");

/**
 * A natural-language label for a member file, for use as link *text* -- never
 * the technical filename. A link's text is read literally by an LLM, so
 * `[gender](position_gender.md)` injects "gender" (meaning) while
 * `[position_gender.md](...)` injects a noisy token. Strip the type prefix and
 * extension, underscores to spaces: position_gender.md -> "gender".
 */
const memberLabel = (file) =>
  file
    .replace(/\.md$/, "")
    .replace(/^(position|process|piece|place|play|plot|persona)_/, "")
    .replace(/_/g, " ");

/**
 * Render an engine's README from its package.json -- the single, generated shape
 * every engine shares. The README is a pointer, never a second copy of the card:
 * it names the engine, its one-line tagline (`khai.tagline`, else the package
 * `description`), its member files (from the
 * composition tree, root marked as the anchor), and where the real sources of
 * truth live (the manifest / WIRES card, and REFERENCES.md). The kit regenerates
 * and diffs this, so a hand-edited or drifted README fails -- the README can
 * never disagree with the manifest. Output is newline-terminated; em/en-dashes
 * in the tagline are normalized to the sanctioned " - " so the result is
 * encoding-clean.
 *
 * @param {{ name?: string, description?: string, license?: string, khai: object }} pkg
 * @returns {string} the README markdown
 */
export function renderEngineReadme(pkg) {
  if (!pkg || typeof pkg !== "object" || !pkg.khai)
    throw new Error("renderEngineReadme: a package.json object with a `khai` block is required");
  const manifest = pkg.khai;
  const members = engineMembers(manifest);
  const rootFile = members.find((m) => m.parent === null).file;

  const title =
    typeof manifest.title === "string" && manifest.title.trim()
      ? manifest.title.trim()
      : capitalize(manifest.engine ?? "engine");
  const taglineSource =
    typeof manifest.tagline === "string" && manifest.tagline.trim()
      ? manifest.tagline
      : (pkg.description ?? "");
  const tagline = normalizeDashes(taglineSource.trim());
  const license = pkg.license ?? "UNLICENSED";
  const files = members
    .map(
      (m) =>
        `- [${memberLabel(m.file)}](${m.file}) - ${m.type}${m.file === rootFile ? " (anchor)" : ""}`,
    )
    .join("\n");

  return (
    `# ${title}\n\n` +
    (tagline ? `${tagline}\n\n` : "") +
    "This engine is defined by its [manifest](package.json), which the canon renders as the WIRES " +
    "card. The manifest is the single source of truth; this README is generated - do not edit it " +
    "by hand.\n\n" +
    `## Files\n\n${files}\n\n` +
    "See [sources and attribution](REFERENCES.md).\n\n" +
    `License: ${license}\n`
  );
}

export default {
  types,
  chaptersFor,
  playbook,
  wiresChapters,
  engineMembers,
  compositionOrder,
  engineCard,
  renderEngineReadme,
};
