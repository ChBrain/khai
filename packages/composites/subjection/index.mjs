// Entry point for the subjection composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Subjection reads the person made by institutional power (F-persona): it wires the four
// formative engines (socialization, the world internalized; discipline, the conduct
// trained; obedience and total-institution, the self handed over) and reads them as one
// making -- power that produces a person rather than merely restraining one. Its three
// bridges are the ways that making works: the forming, the training, and the surrender
// twist.

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
 * composing a bridge emits the subjection root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-subjection: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The four atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from any of the formative engines without a second import. The
// dependency graph is the citation graph: these four are declared in package.json, and
// every hard link in the members resolves through them.
import socialization from "@chbrain/khai-engine-socialization";
import discipline from "@chbrain/khai-engine-discipline";
import obedience from "@chbrain/khai-engine-obedience";
import totalInstitution from "@chbrain/khai-engine-total-institution";

export const atoms = {
  socialization,
  discipline,
  obedience,
  "total-institution": totalInstitution,
};
