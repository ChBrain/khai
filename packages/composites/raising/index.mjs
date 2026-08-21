// Entry point for the raising composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Raising reads what happens to somebody who says a harm is coming and can be doubted
// (F-persona): it wires the signal (warning, whose success leaves no record) and the
// account (credibility, whose only evidence is the one making it). Its three bridges
// are the standing, the substitution, and the proportion twist -- the more expensive a
// warning would be to act on, the more thoroughly the warner is examined instead.
//
// Both atoms are wired here for the first time in the canon, and both are very new.
// The pairing is structural rather than convenient: a warning is a first-person claim
// about an event that has not happened, so it carries both atoms' difficulties at once
// -- it cannot be corroborated, and it will be evaluated on its speaker.

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
 * composing a bridge emits the raising root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-raising: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The two atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from either without a second import. The dependency graph is the
// citation graph: both are declared in package.json, and every hard link in the members
// resolves through them. Both carry full member trees of the same shape -- a root, four
// movement heads, and twelve forms -- so a consumer can walk either the same way.
import credibility from "@chbrain/khai-engine-credibility";
import warning from "@chbrain/khai-engine-warning";

export const atoms = { credibility, warning };
