// Entry point for the spacing composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Spacing reads what a room's arrangement does to the distances its people can hold
// (F-persona): it wires the setting as a party to what happens in it (space) and the
// portable bubble that must be satisfied on some channel (proxemics). Its three bridges are
// the fixture, the reach, and the verdict twist -- the arrangement sets the ceiling on
// contact and takes none of the credit, so a room is praised or written off through the
// people in it.
//
// Both atoms are fresh here. Note that space is a shorthand-root engine -- it declares an
// `anchor` and named `expressions` rather than a `members` list -- while proxemics carries a
// full member tree, so consumers reading these trees must handle both shapes.

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
 * composing a bridge emits the spacing root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-spacing: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The two atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from either without a second import. The dependency graph is the
// citation graph: these two are declared in package.json, and every hard link in the members
// resolves through them. The pairing is a place engine with a process engine, which is the
// composite's subject: a setting that cannot move and a body that must.
import proxemics from "@chbrain/khai-engine-proxemics";
import space from "@chbrain/khai-engine-space";

export const atoms = { proxemics, space };
