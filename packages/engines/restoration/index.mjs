// Entry point for the restoration engine. Reads the declarative `khai` manifest
// from package.json (the single source of truth for how this engine wires) and
// composes the markdown members into a ready-to-use instruction set.
//
// Restoration is a depth-1 process engine on the piece type: a root (the mending
// of an object, and the constitution question underneath it) over five stances
// (reversion, testimony, stabilization, continuation, fidelity). The canon owns
// the tree shape, so this loader pulls the composition chains from
// @chbrain/khai-arch rather than re-deriving them here. Restoration is the object
// parallel to reclamation (a process on a place); it wires on: piece/Apparent,
// and it mends the thing rather than the place or the bond.

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
 * the shallower one upward, so composing a stance emits the restoration root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_testimony.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-restoration: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so restoration reads system-wide and
 * no mended object escapes it. Links are member names, never paths.
 */
export const law =
  "Restoration ([the root mending](process_restoration.md)): a broken or worn object is mended by a hand " +
  "that must weigh how much to renew and whether the mend should show; each Piece shows only the stance its " +
  "Apparent links -- reversion, testimony, stabilization, continuation, or fidelity.";

export default { manifest, chains, raw, compose, law };
