// Entry point for the anomaly composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Anomaly reads what a persona does with a thing that will not sort (F-persona): it wires
// the scheme of kinds (categorization), what an undecidable sort feels like from inside
// (uncanny), and the charged rejection that arrives in place of a verdict (disgust). Its
// three bridges are the scheme, the misfit, and the recoil twist -- a feeling that reports
// on a boundary and presents itself as a report on a thing.
//
// The disgust engine is wired here for the third time in the canon. Condemnation runs it as
// one of the three other-condemning moral emotions and hate as an ingredient of durable
// hostility; both need somebody who has done something. Here it runs on a thing that has
// done nothing, which is what makes the mechanism visible without a moral reading on top of
// it. No composite owns it.

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
 * composing a bridge emits the anomaly root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-anomaly: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
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
import categorization from "@chbrain/khai-engine-categorization";
import disgust from "@chbrain/khai-engine-disgust";
import uncanny from "@chbrain/khai-engine-uncanny";

export const atoms = { categorization, disgust, uncanny };
