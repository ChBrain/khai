// Entry point for the inconsistency composite. Reads the declarative `khai` manifest
// from package.json (the single source of truth for how this composite wires) and
// composes the markdown ladder into a ready-to-use instruction set. The canon owns
// the tree shape, so this loader pulls the composition chains from @chbrain/khai-arch;
// each member validates against its own khai type.
//
// Inconsistency reads an account that must be believed and cannot be delivered by the
// person giving it: it wires the conversation conducted through a third person
// (interpreting) and the credit extended to a first-person account (credibility). Its
// three bridges are the transit, the record, and the verdict twist -- the channel makes
// the discrepancy and the teller is charged with it, because the only witness to the
// difference is the one nobody thinks was in the room.
//
// An engine can be in 0..n composites: an atom carries a phenomenon, and a composite
// carries a question asked of it. Interpreting is wired here for the first time.
// Credibility is wired for the second: the raising composite reads the standing of
// somebody who says a harm is coming, where the account is doubted for what it claims;
// here the account is doubted for having changed, and the change was made in transit.
// The pairing is structural rather than convenient, because what one engine says the
// channel drops is exactly what the other says the hearer reads.
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
 * composing a bridge emits the inconsistency root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-inconsistency: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The two atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from either without a second import. The dependency graph is the
// citation graph: both are declared in package.json, and every hard link in the members
// resolves through them. Both are process trees of a root, four movement heads and twelve
// forms, so a consumer can walk them the same way -- but they are asymmetric in what they
// supply here, since interpreting contributes the mechanism that makes the discrepancy and
// credibility contributes the reading that charges it to somebody.
import interpreting from "@chbrain/khai-engine-interpreting";
import credibility from "@chbrain/khai-engine-credibility";

export const atoms = { interpreting, credibility };
