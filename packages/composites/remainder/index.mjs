// Entry point for the remainder composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Remainder reads what a persona's sense of the time they have left does to what they did
// with the time they had (F-persona): it wires the term (time-horizon, expansive or
// limited, tracking perceived time rather than age) and what it prices (regret, in its
// commission, inaction, and anticipation forms). Its three bridges are the horizon, the
// tally, and the closing twist -- what makes a regret bearable is the impossibility of
// acting on it.
//
// The regret engine is wired here for the second time in the canon. Longing runs it with
// nostalgia and loneliness, as one of the ways a persona reaches backward toward what is
// gone; here it is run forward, against the time left, and the subject is the price rather
// than the reaching. Neither composite owns it.

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
 * composing a bridge emits the remainder root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-remainder: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The two atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from either without a second import. The dependency graph is the
// citation graph: these two are declared in package.json, and every hard link in the members
// resolves through them. Note that time-horizon is a shorthand-root engine -- it declares an
// `anchor` and named `expressions` rather than a `members` list -- while regret carries a
// full member tree, so consumers reading these trees must handle both shapes.
import regret from "@chbrain/khai-engine-regret";
import timeHorizon from "@chbrain/khai-engine-time-horizon";

export const atoms = { regret, "time-horizon": timeHorizon };
