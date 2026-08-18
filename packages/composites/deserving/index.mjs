// Entry point for the deserving composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Deserving reads what a persona holds another to have coming (F-persona): it wires the
// three engines that carry it (moral-judgment, the foundation that fires first and names
// the conduct; altruistic-punishment, the price paid to make a breaker answer;
// schadenfreude, the lift felt when the fall lands) and reads them as one shape -- one
// deservingness judgment showing up as a lens, a price, and a lift. Its three bridges are
// ordered by what the persona will avow: the lens, the price, and the lift twist.

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
 * composing a bridge emits the deserving root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-deserving: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The three atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from any of the desert engines without a second import. The
// dependency graph is the citation graph: these three are declared in package.json, and
// every hard link in the members resolves through them.
import moralJudgment from "@chbrain/khai-engine-moral-judgment";
import altruisticPunishment from "@chbrain/khai-engine-altruistic-punishment";
import schadenfreude from "@chbrain/khai-engine-schadenfreude";

export const atoms = {
  "moral-judgment": moralJudgment,
  "altruistic-punishment": altruisticPunishment,
  schadenfreude,
};
