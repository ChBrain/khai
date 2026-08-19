// Entry point for the fire engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and composes
// the markdown members into a ready-to-use instruction set.
//
// Fire is a depth-1 process engine on the place type: a root (the burn regime of a
// place) over six modes (ignition, creep, conflagration, smoulder, exclusion, and the
// renewal twist). The canon owns the tree shape, so this loader pulls the composition
// chains from @chbrain/khai-arch rather than re-deriving them here. Fire is the fourth
// engine of the land's-forces family; it wires on: place/Shown, the burn regime itself
// -- typed by combustion, primed by weather and hydrology, answered by succession's
// regrowth.

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
 * the shallower one upward, so composing a mode emits the fire root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_ignition.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-fire: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so fire reads system-wide and no place's
 * combustibility is mere scenery. Links are member names, never paths.
 */
export const law =
  "Fire ([the root burn](process_fire.md)): every Place carries a fire regime it is shaped by, sparked, run, " +
  "fought, or renewed; each Place shows only the mode its Shown links -- ignition, creep, conflagration, " +
  "smoulder, exclusion, or renewal -- the burn that ruins the place being the burn a fire-adapted place is made by.";

export default { manifest, chains, raw, compose, law };
