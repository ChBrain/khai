// Entry point for the reprisal composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Reprisal reads what a persona expects getting even to do and what it does (F-persona):
// it wires the stance (forgiveness, vengeful rather than avoidant or benevolent), the
// forecast (bias, through the impact bias), and the loop the episode runs in
// (rumination). Its three bridges are the score, the stroke, and the keeping twist --
// retaliation is the one response that guarantees the matter will not be finished with.
//
// The forgiveness engine is wired here for the second time in the canon. Moral-account
// runs it with guilt, repair, and betrayal, reading one wrong across three ledgers that
// refuse to agree; here it is run forward from the wronged party alone, and the subject
// is what their own answer costs them. Same engine, different question, and neither
// composite owns it. The bias engine is wired here for the second time as well --
// intergroup runs it for the tilts that serve a group -- and this composite takes a
// single member from it, the impact bias, rather than the tree.

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
 * composing a bridge emits the reprisal root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-reprisal: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The three atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from either without a second import. The dependency graph is the
// citation graph: these three are declared in package.json, and every hard link in the
// members resolves through them. Note the shapes differ -- forgiveness and bias carry
// full member trees while rumination does too, but bias's is very large and this
// composite links exactly one member of it, so consumers should not assume a composite
// uses the whole of an atom it declares.
import bias from "@chbrain/khai-engine-bias";
import forgiveness from "@chbrain/khai-engine-forgiveness";
import rumination from "@chbrain/khai-engine-rumination";

export const atoms = { bias, forgiveness, rumination };
