// Entry point for the wildland composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Wildland is the closer of the land's-forces family (F-place): it wires the five
// active land-forces (geomorphology, erosion, hydrology, fire, succession) and reads
// the setting as a living, self-shaping agent -- the land that makes, wears, burns,
// and reclaims itself under the climatic regime (the referenced frame, not a wired
// atom). Its three bridges are the shapes that life takes: upheaval, wearing, and the
// wild's reclaiming.

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
 * Assemble the instruction set for one leaf: the whole chain from the anchor down to
 * that leaf, anchor first, bodies only. The leaf carries the anchor upward, so
 * composing a bridge emits the wildland root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-wildland: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The five atoms this composite wires over, re-exported so a consumer that installs
// the composite can compose from any of the land's forces without a second import.
// The dependency graph is the citation graph: these five are declared in package.json,
// and every hard link in the members resolves through them. The climate engine is the
// referenced governing frame, not an atom, and is not re-exported here.
import geomorphology from "@chbrain/khai-engine-geomorphology";
import erosion from "@chbrain/khai-engine-erosion";
import hydrology from "@chbrain/khai-engine-hydrology";
import fire from "@chbrain/khai-engine-fire";
import succession from "@chbrain/khai-engine-succession";

export const atoms = { geomorphology, erosion, hydrology, fire, succession };
