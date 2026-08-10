// Entry point for the gossip engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and composes
// the markdown members into a ready-to-use instruction set.
//
// Gossip is a depth-1 process engine on the process type: a root (evaluative talk about
// absent third parties) over four facets (ledger, grooming, policing, and the venom
// twist). The canon owns the tree shape, so this loader pulls the composition chains
// from @chbrain/khai-arch rather than re-deriving them here. It wires on:
// persona/Projection -- how a persona speaks, and is spoken of, in the group's talk --
// the same altitude as its social-control sibling, the ostracism engine; gossip is the
// talk, ostracism the exclusion it may bring.

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
 * Assemble the ready-to-use instruction set for one leaf: the whole chain from
 * the root down to that leaf, root first, bodies only. The deeper member carries
 * the shallower one upward, so composing a facet emits the gossip root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_ledger.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-gossip: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so gossip reads system-wide and no
 * reputation is taken as simply given rather than made in talk. Links are member names,
 * never paths.
 */
export const law =
  "Gossip ([the root talk](process_gossip.md)): evaluative talk about absent third parties circulates through a group as " +
  "its reputational memory, its bond, and its enforcement; each persona shows only the facet its Projection links -- ledger, " +
  "grooming, policing, or venom -- a reputation made in talk, not simply given.";

export default { manifest, chains, raw, compose, law };
