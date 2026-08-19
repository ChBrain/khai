// Entry point for the smarting composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Smarting reads what a favourable self-view does when the room declines to confirm it
// (F-persona): it wires the resting regard and how it is held (self-esteem), the inflated
// case and the routes that defend it (narcissism), and what the mobilised force becomes
// (aggression). Its three bridges are the claim, the puncture, and the return twist --
// the force sent back to whoever is nearest rather than to whoever caused it.
//
// Two of the three atoms are wired again here. Self-relation runs self-esteem inward, as
// one mode of a persona's stance toward their own self, and cptsd runs it as damage laid
// down early; here it is read outward, as a claim a room can refuse. Intergroup runs
// aggression on the us/them line, where the target is chosen by category; here the target
// is chosen by proximity. No composite owns either engine.

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
 * composing a bridge emits the smarting root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-smarting: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The three atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from any of them without a second import. The dependency graph is
// the citation graph: these three are declared in package.json, and every hard link in the
// members resolves through them. Note that self-esteem is a shorthand-root engine -- it
// declares an `anchor` and named `expressions` rather than a `members` list -- while
// narcissism and aggression carry full member trees, so consumers reading these trees must
// handle both shapes.
import aggression from "@chbrain/khai-engine-aggression";
import narcissism from "@chbrain/khai-engine-narcissism";
import selfEsteem from "@chbrain/khai-engine-self-esteem";

export const atoms = { aggression, narcissism, "self-esteem": selfEsteem };
