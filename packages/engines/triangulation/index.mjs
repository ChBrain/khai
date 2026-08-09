// Entry point for the triangulation engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and composes the
// markdown members into a ready-to-use instruction set.
//
// Triangulation is a depth-1 plot engine on the plot type: a root (the three-party bind a
// two-person tension recruits a third to stabilize) over four forms (detour, coalition,
// crossfire, and the stabilizer reading). It is the family-systems sibling of the
// double-bind engine -- a named relational structure cast as plot, not a persona trait.
// The canon owns the tree shape, so this loader pulls the composition chains from
// @chbrain/khai-arch rather than re-deriving them here. It wires on: plot/Tension.

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
 * the shallower one upward, so composing a form emits the triangulation root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "plot_detour.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-triangulation: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so triangulation reads system-wide and no
 * three-party bind is mistaken for a simple conflict. Links are member names, never paths.
 */
export const law =
  "Triangulation ([the root triangle](plot_triangulation.md)): a two-person tension can recruit or displace onto " +
  "a third to stabilize itself; each Plot shows only the form its Tension links -- detour, coalition, crossfire, or " +
  "stabilizer -- the pair held by a third, not a simple conflict between two.";

export default { manifest, chains, raw, compose, law };
