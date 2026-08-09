// Entry point for the imagination engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and composes the
// markdown members into a ready-to-use instruction set.
//
// Imagination is a depth-1 process engine on the persona type: a root (the deliberate
// forming of non-present mental representations) over the three modes of the imaginative
// act (conjuring the sensory image, supposition of the as-if premise, simulation of a
// novel scenario). Like the insight engine (three mechanisms, no twist), it carries no
// forced twist. The canon owns the tree shape, so this loader pulls the composition chains
// from @chbrain/khai-arch rather than re-deriving them here. Imagination is an adjacent
// engine of the creativity cluster; it wires on: persona/Projection, the persona shown by
// what it imagines.

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
 * the shallower one upward, so composing a mode emits the imagination root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_conjuring.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-imagination: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so imagination reads system-wide and no
 * persona's inner constructing is taken as merely perceiving or recalling. Links are
 * member names, never paths.
 */
export const law =
  "Imagination ([the root faculty](process_imagination.md)): a Persona can deliberately form and manipulate " +
  "representations of what is not present; each Persona shows only the mode its Projection links -- conjuring, " +
  "supposition, or simulation -- the making-present of the not-present, apart from the drift, the future self, and the recollection.";

export default { manifest, chains, raw, compose, law };
