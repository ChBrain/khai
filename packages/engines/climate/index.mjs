// Entry point for the climate engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and composes
// the markdown members into a ready-to-use instruction set.
//
// Climate is a depth-1 process engine on the place type: a root (the standing
// long-run atmospheric regime) over four modes (regime, seasonality, extremity, and
// shift). The canon owns the tree shape, so this loader pulls the composition chains
// from @chbrain/khai-arch rather than re-deriving them here. Climate is the fifth
// engine of the land's-forces family and weather's long-run sibling; it wires on:
// place/Shown, and it governs the odds the other place-forces play out within.

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
 * the shallower one upward, so composing a mode emits the climate root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_regime.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-climate: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so climate reads system-wide and no
 * place's regime is mere scenery. Links are member names, never paths.
 */
export const law =
  "Climate ([the root regime](process_climate.md)): every Place is set in a standing atmospheric regime that " +
  "governs what it expects, not what it gets on the day; each Place shows only the mode its Shown links -- " +
  "regime, seasonality, extremity, or shift -- the odds every other force plays out within.";

export default { manifest, chains, raw, compose, law };
