// Entry point for the spectating composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Spectating reads what a story does to the one receiving it (F-persona) -- the one
// persona a play does not cast. It wires the gap of discrepant awareness
// (dramatic-irony), the moral bond to the figures (allegiance), and the carrying-in
// (transportation), and stages the dependency the allegiance atom already declares when
// it anchors Smith: allegiance rests on alignment, so the verdict follows the access.
// Its three bridges run in the order the teller sets them: the access, the siding, and
// the carry twist, which suspends the faculty that would notice either.
//
// The transportation engine is wired here for the second time in the canon: the elsewhere
// composite reads it as one of the ways a mind leaves the room. Here it is what a made
// story does once the audience is inside. Neither owns it.

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
 * composing a bridge emits the spectating root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-spectating: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The three atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from any of them without a second import. The dependency graph is
// the citation graph: these three are declared in package.json, and every hard link in
// the members resolves through them.
import dramaticIrony from "@chbrain/khai-engine-dramatic-irony";
import allegiance from "@chbrain/khai-engine-allegiance";
import transportation from "@chbrain/khai-engine-transportation";

export const atoms = { "dramatic-irony": dramaticIrony, allegiance, transportation };
