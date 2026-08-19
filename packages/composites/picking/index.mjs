// Entry point for the picking composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Picking reads what a genuinely two-sided evaluation does when a choice is required of
// it (F-persona): it wires the starting state (ambivalence, two full charges toward one
// object), the fork (decision, which will take only one answer), and the tidying that
// follows a commitment (dissonance). Its three bridges are the fence, the call, and the
// spread twist -- the alternatives moving apart until the persona holds a conviction more
// one-sided than any they arrived with.
//
// Two of the three atoms are wired here for the second time in the canon. The squaring
// composite runs dissonance on a persona's own conduct, where an act was wrong and the
// account is repaired; here the act is a choice between two goods and nothing is being
// excused. The slack composite runs decision under scarcity, asking how much room a
// persona has to decide with; here the room is granted and the division is the question.
// No composite owns either engine.

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
 * composing a bridge emits the picking root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-picking: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The three atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from any of them without a second import. The dependency graph is
// the citation graph: these three are declared in package.json, and every hard link in the
// members resolves through them. Note that the ambivalence atom is a shorthand-root engine
// -- it declares an `anchor` and named `expressions` rather than a `members` list -- so
// consumers reading its tree must take that shape into account.
import ambivalence from "@chbrain/khai-engine-ambivalence";
import decision from "@chbrain/khai-engine-decision";
import dissonance from "@chbrain/khai-engine-dissonance";

export const atoms = { ambivalence, decision, dissonance };
