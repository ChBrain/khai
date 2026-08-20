// Entry point for the law engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and
// composes the markdown tree into a ready-to-use instruction set.
//
// Law is a position tree: a root (law) declares the legality a persona's conduct
// is judged under, four axis heads ask different questions of it -- the making,
// the failing, the standing, the gap -- and each leaf is one named form. The
// canon owns the tree shape, so this loader pulls the composition chains from
// @chbrain/khai-arch rather than re-deriving them here.
//
// The axes are not alternatives. A legal order has a reading on all four at once,
// and the fourth -- the gap between the rule declared and the rule as it operates
// -- is ordinarily the one a persona meets first.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { compositionOrder } from "@chbrain/khai-arch";

const here = dirname(fileURLToPath(import.meta.url));
const read = (file) => readFileSync(join(here, file), "utf8");

/** Strip a leading YAML frontmatter block, leaving the prose body. Tolerates
 * CRLF: content authored on Windows must not leak its YAML into the composed
 * LLM context just because the delimiters are \r\n rather than \n. */
const body = (md) => md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();

/** The declarative wiring contract, authored in package.json. */
export const manifest = JSON.parse(read("package.json")).khai;

/** Leaf file -> [root, axis, leaf] composition chain. The canon owns the tree. */
export const chains = compositionOrder(manifest);

/** Original files, frontmatter intact, keyed by member file (for provenance). */
export const raw = Object.fromEntries(manifest.members.map((m) => [m.file, read(m.file)]));

/**
 * Assemble the ready-to-use instruction set for one member of the tree: the
 * whole chain from the root down to that member, root first, bodies only. The
 * deeper member carries the shallower ones upward, so composing a named form
 * emits its axis and the root with it.
 *
 * @param {{ leaf: string }} opts  a member file, e.g. "position_dead_letter.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-law: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };
