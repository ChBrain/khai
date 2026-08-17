// Entry point for the combustion engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and composes
// the markdown members into a ready-to-use instruction set.
//
// Combustion is a catalog engine: a root over a flat set of named fire phenomena, each
// a process member with its own fuel, dynamics, sensory signature, and extinguishment
// paradox. Where the fire engine reads a place's burn regime (its abstract modes), this
// engine reads the specific phenomenon. The canon owns the tree shape, so this loader
// pulls the composition chains from @chbrain/khai-arch. It wires on: place/Shown, the
// specific fire a place shows.

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
 * Assemble the instruction set for one leaf: the whole chain from the root down to
 * that leaf, root first, bodies only. The leaf carries the root upward, so composing
 * a phenomenon emits the combustion root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_crown.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-combustion: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract carries:
 * declared once, linking the root, so combustion reads system-wide and a fire a place shows
 * is read as the specific phenomenon it is. Links are member names, never paths.
 */
export const law =
  "Combustion ([the root catalog](process_combustion.md)): a fire a place shows is a specific named phenomenon -- " +
  "with its own fuel, chemistry, dynamics, sensory signature, and the paradox by which the obvious way to fight it " +
  "fails or feeds it; each Place links under Shown the one it shows. Fire reads the regime; combustion reads the type.";

export default { manifest, chains, raw, compose, law };
