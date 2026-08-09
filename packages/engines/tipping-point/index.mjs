// Entry point for the tipping-point engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and composes the
// markdown members into a ready-to-use instruction set.
//
// Tipping-point is a depth-1 process engine on the process type: a root (the nonlinear
// critical transition) over four phases (loading, criticality, snap, and the ratchet
// twist). It is the dramatic complement of the drift engine -- drift is the invisible
// slide "seen only after it breaks", tipping-point is the break. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch rather than
// re-deriving them here. It wires on: process/Direction, the shape a dynamic's course takes
// when it snaps rather than slides; the dynamic is type-generic, cast here on a process.

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
 * the shallower one upward, so composing a phase emits the tipping-point root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_loading.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-tipping-point: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so the tipping-point dynamic reads system-wide
 * and no accumulating process is taken as safe merely because it still stands. Links are
 * member names, never paths.
 */
export const law =
  "Tipping-point ([the root transition](process_tipping-point.md)): a process can absorb accumulating load while looking " +
  "stable, then cross a critical threshold and shift discontinuously and irreversibly; each process shows only the phase its " +
  "Direction links -- loading, criticality, snap, or ratchet -- the trigger the last increment, never the cause.";

export default { manifest, chains, raw, compose, law };
