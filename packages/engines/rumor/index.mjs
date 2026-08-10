// Entry point for the rumor engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and composes
// the markdown members into a ready-to-use instruction set.
//
// Rumor is a depth-1 process engine on the process type: a root (unverified news as
// improvised collective sensemaking) over four facets (vacuum, improvisation, mutation,
// and the hearsay twist). The canon owns the tree shape, so this loader pulls the
// composition chains from @chbrain/khai-arch rather than re-deriving them here. It wires
// on: persona/Projection -- how a persona carries and passes the unverified news -- the
// sibling of the gossip engine: gossip is evaluative talk about absent persons, rumor is
// unverified news about ambiguous situations.

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
 * the shallower one upward, so composing a facet emits the rumor root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_vacuum.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-rumor: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so rumor reads system-wide and no account is
 * taken as confirmed merely because it circulates. Links are member names, never paths.
 */
export const law =
  "Rumor ([the root news](process_rumor.md)): unverified news about an ambiguous situation circulates as a community's " +
  "improvised collective sensemaking when the demand for news outruns the official supply; each persona shows only the facet " +
  "its Projection links -- vacuum, improvisation, mutation, or hearsay -- an account unconfirmed, not confirmed by its spread.";

export default { manifest, chains, raw, compose, law };
