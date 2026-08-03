// Entry point for the drift engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and
// composes the markdown members into a ready-to-use instruction set.
//
// Drift is a depth-1 process engine: a root (the slide) over three mechanisms
// (normalization, uncoupling, gradient). The canon owns the tree shape, so this
// loader pulls the composition chains from @chbrain/khai-arch rather than
// re-deriving them here. Drift wires on: process, bending the vector a running
// dynamic already has.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { compositionOrder } from "@chbrain/khai-arch";

const here = dirname(fileURLToPath(import.meta.url));
const read = (file) => readFileSync(join(here, file), "utf8");

/** Strip a leading YAML frontmatter block, leaving the prose body. Tolerates
 * CRLF: content authored on Windows must not leak its YAML into the composed
 * LLM context just because the delimiters are \r\n rather than \n. */
const body = (md) => md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();

/** The declarative wiring contract, authored in package.json. */
export const manifest = JSON.parse(read("package.json")).khai;

/** Leaf file -> [root, ..., leaf] composition chain. The canon owns the tree. */
export const chains = compositionOrder(manifest);

/** Original files, frontmatter intact, keyed by member file (for provenance). */
export const raw = Object.fromEntries(manifest.members.map((m) => [m.file, read(m.file)]));

/**
 * Assemble the ready-to-use instruction set for one leaf: the whole chain from
 * the root down to that leaf, root first, bodies only. The deeper member
 * carries the shallower one upward, so composing a mechanism emits the drift
 * root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_gradient.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-drift: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions
 * contract carries: declared once, linking the root, so drift reads system-wide
 * and no running process escapes it. Links are member names, never paths.
 */
export const law =
  "Drift ([the root slide](process_drift.md)): a running process's baseline can " +
  "slide unremarked, by one of its mechanisms, until the process is somewhere no " +
  "one chose; the moved yardstick makes the distance invisible from inside.";

export default { manifest, chains, raw, compose, law };
