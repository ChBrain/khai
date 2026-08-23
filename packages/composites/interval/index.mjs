// Entry point for the interval composite. Reads the declarative `khai` manifest
// from package.json (the single source of truth for how this composite wires) and
// composes the markdown ladder into a ready-to-use instruction set. The canon owns
// the tree shape, so this loader pulls the composition chains from @chbrain/khai-arch;
// each member validates against its own khai type.
//
// Interval reads the daily stretch that belongs to no part of a persona's life: it
// wires the unpaid, unchosen hour (commute) and the room that asks nothing once you
// are inside it (non-place). Its three bridges are the vacancy, the furnishing, and
// the defence twist -- the hour a persona never chose becomes the only one nobody can
// claim, and defending it is what keeps them making the journey.
//
// Both atoms are wired here for the first time. An engine can be in 0..n composites:
// an atom carries a phenomenon, and a composite carries a question asked of it. The
// pairing is structural rather than convenient, because the two engines supply the
// same hour from opposite ends -- one a duration with no owner, the other a room with
// no memory.

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
 * composing a bridge emits the interval root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-interval: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The two atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from either without a second import. The dependency graph is the
// citation graph: both are declared in package.json, and every hard link in the members
// resolves through them. The two are shaped differently -- commute is a process tree of a
// root, four movement heads and twelve forms, while non-place is a place engine of an
// anchor and three expressions with its own compose({ expression }) signature -- so a
// consumer walking them should read each on its own shape rather than assume one.
import commute from "@chbrain/khai-engine-commute";
import nonPlace from "@chbrain/khai-engine-non-place";

export const atoms = { commute, nonPlace };
