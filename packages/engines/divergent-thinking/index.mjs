// Entry point for the divergent-thinking engine. Reads the declarative `khai` manifest
// from package.json (the single source of truth for how this engine wires) and composes
// the markdown members into a ready-to-use instruction set.
//
// Divergent-thinking is a depth-1 process engine on the persona type: a root (the
// generative act -- many varied novel ideas from one open prompt) over Guilford's four
// dimensions of divergent production (fluency, flexibility, originality, elaboration).
// Like the insight engine (three mechanisms, no twist), it carries no forced twist -- the
// four dimensions are equal reads of one ideational pool. The canon owns the tree shape,
// so this loader pulls the composition chains from @chbrain/khai-arch rather than
// re-deriving them here. Divergent-thinking is the generative core of the creativity
// cluster; it wires on: persona/Projection, the persona shown by what it generates.

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
 * the shallower one upward, so composing a dimension emits the divergent-thinking
 * root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_fluency.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-divergent-thinking: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so divergent thinking reads system-wide and
 * no creative persona is played as merely having ideas arrive. Links are member names,
 * never paths.
 */
export const law =
  "Divergent thinking ([the root generation](process_divergent-thinking.md)): a creative Persona generates a pool of many " +
  "varied novel ideas from one open prompt, not a single answer; each Persona shows only the dimension its Projection links " +
  "-- fluency, flexibility, originality, or elaboration -- the many from the one, the choosing among them left to decision.";

export default { manifest, chains, raw, compose, law };
