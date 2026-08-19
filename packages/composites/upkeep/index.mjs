// Entry point for the upkeep composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Upkeep reads what a shared thing costs the people who keep it (F-persona): it wires the
// resource and its crafted institutions (commons), the bet each persona places on the
// others (trust), and the enforcement somebody funds personally (altruistic-punishment).
// Its three bridges are the pool, the read, and the sword twist -- because the cost of
// enforcing is private and its benefit general, a commons that is working looks like one
// that needs no keeping.
//
// Two of the three atoms are wired again here. Dealing runs trust on a bargain between two
// parties and vigil on a bond with a rival near it; here it runs on a group, where the bet
// is placed on people in general. Deserving runs altruistic punishment as moral desert;
// here it runs as the fee for a shared thing, paid by whoever is willing. No composite owns
// either engine.

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
 * composing a bridge emits the upkeep root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-upkeep: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The three atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from any of them without a second import. The dependency graph is
// the citation graph: these three are declared in package.json, and every hard link in the
// members resolves through them. Note that commons is a shorthand-root engine -- it declares
// an `anchor` and named `expressions` rather than a `members` list -- while trust and
// altruistic-punishment carry full member trees, so consumers reading these trees must
// handle both shapes.
import altruisticPunishment from "@chbrain/khai-engine-altruistic-punishment";
import commons from "@chbrain/khai-engine-commons";
import trust from "@chbrain/khai-engine-trust";

export const atoms = { "altruistic-punishment": altruisticPunishment, commons, trust };
