// Entry point for the heeding composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Heeding reads what a persona gives a rule they did not agree with (F-persona): it wires
// what is reaching them (law, met at the gap rather than as a text), the encounter that
// answers their claim and returns a standing (recognition), and whether the question at
// issue is a preference or a mandate (moral-conviction). Its three bridges are the
// hearing, the deference, and the mandate twist -- a fair hearing buys compliance only on
// the questions a persona does not already consider settled.
//
// The law engine is wired here for the first time in the canon; it is the persona-facing
// counterpart to the board-level trio of regime, politics, and law, and it deliberately
// carries the procedural-justice account that the law engine itself delegates rather than
// owns. The recognition and moral-conviction engines are each wired elsewhere too, and no
// composite owns either: an atom carries a phenomenon, and a composite carries a question
// asked of it.

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
 * composing a bridge emits the heeding root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-heeding: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The three atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from either without a second import. The dependency graph is the
// citation graph: these three are declared in package.json, and every hard link in the
// members resolves through them. Note the shapes differ -- law and recognition carry full
// member trees, while moral-conviction is a shorthand-root engine declaring an `anchor`
// and named `expressions` rather than a `members` list, so consumers reading these trees
// must handle both.
import law from "@chbrain/khai-engine-law";
import moralConviction from "@chbrain/khai-engine-moral-conviction";
import recognition from "@chbrain/khai-engine-recognition";

export const atoms = { law, "moral-conviction": moralConviction, recognition };
