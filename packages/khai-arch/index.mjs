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

  return {
    id,
    type: manifest.type ?? null,
    anchor: manifest.anchor ?? null,
    mnemonic: "WIRES",
    chapters: wiresChapters,
    sections,
  };
}

export default { types, chaptersFor, playbook, wiresChapters, engineCard };
