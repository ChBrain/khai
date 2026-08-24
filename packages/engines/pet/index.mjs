// Entry point for the pet engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and
// composes the markdown tree into a ready-to-use instruction set.
//
// Pet is a piece tree, flat and one deep: an anchor (the animal) with a position
// (the keeper) and three processes (the acquiring, the arranging, the ending)
// hanging beneath it. The canon owns the tree shape, so this loader pulls the
// composition chains from @chbrain/khai-arch rather than re-deriving them here.
//
// The piece grammar is an object grammar -- Place, Load Bearing, Apparent,
// Yearbook -- and running a living participant through it is the engine's
// argument rather than an oversight. A pet is described in the vocabulary of
// kinship and kept in the conditions of a ward; the shape says the second half
// out loud. REFERENCES.md states this plainly, because a reader who takes the
// form for an endorsement has read it backwards.
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
 * Assemble the instruction set for one leaf: the whole chain from the anchor
 * down to that leaf, anchor first, bodies only. The leaf carries the anchor
 * upward, so composing a leaf emits the anchor with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-pet: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };
