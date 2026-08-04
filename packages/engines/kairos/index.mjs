// Entry point for the kairos engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and
// composes the markdown members into a ready-to-use instruction set.
//
// Kairos is a depth-1 process engine on the opportune moment: a root (the fitting
// time cut from the flow) over four facets (window, juncture, timing, and the
// ripeness twist). The canon owns the tree shape, so this loader pulls the
// composition chains from @chbrain/khai-arch rather than re-deriving them here.
// Kairos is the family's multi-cargo engine, wiring on three unfolding types at
// once -- a plot at Cue, a plan at Implementation, a process at Initiated by --
// because the fittingness of a moment is one phenomenon whatever unfolds. It is
// chronos's complement: chronos reads the measured passage, kairos the one moment
// on it that counts.

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
 * the shallower one upward, so composing a facet emits the kairos root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_window.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-kairos: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so kairos reads system-wide across
 * every unfolding. Links are member names, never paths.
 */
export const law =
  "Kairos ([the root moment](process_kairos.md)): every unfolding -- a plot's beat, a plan's execution, a " +
  "process's threshold -- turns on the moment it fits; each links, under its Cue, Implementation, or Initiated by, " +
  "only the facet its moment shows -- window, juncture, timing, or ripeness -- the fitting time seized, or lost.";

export default { manifest, chains, raw, compose, law };
