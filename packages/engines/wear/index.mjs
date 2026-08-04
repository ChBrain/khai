// Entry point for the wear engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and
// composes the markdown members into a ready-to-use instruction set.
//
// Wear is a depth-1 process engine on the piece type: a root (the degradation an
// object takes from use) over four modes (abrasion, flexure, depletion, and the
// seasoning twist). The canon owns the tree shape, so this loader pulls the
// composition chains from @chbrain/khai-arch rather than re-deriving them here.
// Wear is decay's complement and the second element of the object-lifecycle
// family; it wires on: piece/Load Bearing, degradation by use rather than by time.

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
 * the shallower one upward, so composing a mode emits the wear root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_abrasion.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-wear: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so wear reads system-wide and no used
 * object escapes it. Links are member names, never paths.
 */
export const law =
  "Wear ([the root use](process_wear.md)): every Piece in use is spent by it, not only aged by time; " +
  "each Piece shows only the mode its Load Bearing links -- abrasion, flexure, depletion, or seasoning -- " +
  "worn out, or worn in.";

export default { manifest, chains, raw, compose, law };
