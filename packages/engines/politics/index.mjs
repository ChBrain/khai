// Entry point for the politics engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and composes the
// markdown ladder into a ready-to-use instruction set. The canon owns the tree shape, so
// this loader pulls the composition chains from @chbrain/khai-arch; each member validates
// against its own khai type.
//
// Politics reads what a persona does where the decision is not theirs and the rule for
// deciding is itself movable (F-persona). Three altitudes hang off one root: three faces
// (where the contest sits), seven levers (moves that work on the situation rather than on
// anybody's mind), and five footings (what makes a lever bite). The member tree therefore
// mixes position and process types under a process root, so a consumer reading it should
// not assume a single member type.

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
 * Assemble the instruction set for one leaf: the whole chain from the root down to that
 * leaf, root first, bodies only. The leaf carries the root upward, so composing any face,
 * lever, or footing emits the politics root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-politics: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };
