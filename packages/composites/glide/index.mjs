// Entry point for the glide composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Glide reads a persona learning something while judging how the learning is going
// (F-persona): it wires the loop (metacognition, a meta-level monitoring and steering the
// object-level), what is actually being built (memory), and the felt state of the
// conditions that build it best (confusion). Its three bridges are the monitor, the trace,
// and the ease twist -- the reading deciding where the next hour goes.
//
// The composite deliberately does NOT own the misjudgement itself. A persona trusting what
// processes smoothly -- the fluency heuristic, the misinterpreted-effort case -- is the bias
// engine's, catalogued there as a standing position. This begins after that and reads what
// the misreading governs.
//
// Two of the three atoms are wired again here. Elsewhere runs memory as one of the ways a
// mind leaves the room; here it is the thing being built while somebody watches the wrong
// dial. Knowing runs confusion as one of the epistemic emotions; here it is the felt cost of
// the study regime that works. No composite owns either engine.

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
 * composing a bridge emits the glide root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-glide: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The three atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from any of them without a second import. The dependency graph is
// the citation graph: these three are declared in package.json, and every hard link in the
// members resolves through them. All three carry full member trees, so a consumer reading
// these manifests can rely on `members` in each case.
import confusion from "@chbrain/khai-engine-confusion";
import memory from "@chbrain/khai-engine-memory";
import metacognition from "@chbrain/khai-engine-metacognition";

export const atoms = { confusion, memory, metacognition };
