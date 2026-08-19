// Entry point for the vigil composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Vigil reads what a persona does to a bond once a third party is in the room
// (F-persona): it wires the threat and what is done about it (jealousy), the working
// model that decides how much of a threat it takes (attachment), and the bet the whole
// episode is trying to settle (trust). Its three bridges are the threshold, the guard,
// and the proof twist -- the reassurance the guarding is looking for, which the looking
// is the one thing that cannot produce.
//
// Two of the three atoms are wired again here. Dealing runs trust on a bargain, where the
// vulnerability is contractual; here it runs on a bond, where the vulnerability is the
// whole relationship. Cptsd runs attachment as damage laid down early and freud as a
// drive-level structure; here it runs on tonight. No composite owns either engine.

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
 * composing a bridge emits the vigil root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-vigil: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The three atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from any of them without a second import. The dependency graph is
// the citation graph: these three are declared in package.json, and every hard link in the
// members resolves through them. All three carry full member trees, so a consumer reading
// these manifests can rely on `members` in each case.
import attachment from "@chbrain/khai-engine-attachment";
import jealousy from "@chbrain/khai-engine-jealousy";
import trust from "@chbrain/khai-engine-trust";

export const atoms = { attachment, jealousy, trust };
