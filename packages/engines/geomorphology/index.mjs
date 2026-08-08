// Entry point for the geomorphology engine. Reads the declarative `khai` manifest
// from package.json (the single source of truth for how this engine wires) and
// composes the markdown members into a ready-to-use instruction set.
//
// Geomorphology is a depth-1 process engine on the place type: a root (the ground's
// own violence) over four modes (uplift, quake, eruption, subsidence). The canon
// owns the tree shape, so this loader pulls the composition chains from
// @chbrain/khai-arch rather than re-deriving them here. Geomorphology is the first
// engine of the land's-forces family; it wires on: place/Shown, the sudden endogenic
// force behind erosion's slow exogenic wearing.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { compositionOrder } from "@chbrain/khai-arch";

const here = dirname(fileURLToPath(import.meta.url));
const read = (file) => readFileSync(join(here, file), "utf8");

/** Strip a leading YAML frontmatter block, leaving the prose body. Tolerates CRLF. */
const body = (md) => md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();

/** The declarative wiring contract, authored in package.json. */
export const manifest = JSON.parse(read("package.json")).khai;

/** Leaf file -> [root, ..., leaf] composition chain. The canon owns the tree. */
export const chains = compositionOrder(manifest);

/** Original files, frontmatter intact, keyed by member file (for provenance). */
export const raw = Object.fromEntries(manifest.members.map((m) => [m.file, read(m.file)]));

/**
 * Assemble the ready-to-use instruction set for one leaf: the whole chain from
 * the root down to that leaf, root first, bodies only. The deeper member carries
 * the shallower one upward, so composing a mode emits the geomorphology root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_quake.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-geomorphology: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so geomorphology reads system-wide and
 * no ground is mere backdrop. Links are member names, never paths.
 */
export const law =
  "Geomorphology ([the root ground](process_geomorphology.md)): every Place stands on ground that is its own " +
  "maker and breaker, raised, ruptured, poured, or dropped; each Place shows only the mode its Shown links -- " +
  "uplift, quake, eruption, or subsidence -- the land built, or levelled.";

export default { manifest, chains, raw, compose, law };
