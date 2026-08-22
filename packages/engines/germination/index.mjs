// Entry point for the germination engine. The engine is content: seventeen
// process members over one root, and this module is the programmatic view of
// them -- the manifest as declared, the parent chains that reach each form,
// and a compose() that assembles a leaf's full read from root to form.
//
// The tree is two deep. The root is the held life; four movements hang off it
// in the order a seed runs (the pack, the hold, the cue, the commit); three
// forms hang off each movement. chains is keyed by true leaf only, so the root
// and the four movement heads are not composable on their own -- they are
// carried upward by whatever hangs below them.

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

/** Leaf file -> [root, movement, leaf] composition chain. The canon owns the tree. */
export const chains = compositionOrder(manifest);

/** Original files, frontmatter intact, keyed by member file (for provenance). */
export const raw = Object.fromEntries(manifest.members.map((m) => [m.file, read(m.file)]));

/**
 * Assemble the ready-to-use instruction set for one member of the tree: the
 * whole chain from the root down to that member, root first, bodies only. The
 * deeper member carries the shallower ones upward, so composing a form emits
 * its movement and the root with it.
 *
 * @param {{ leaf: string }} opts  a member file, e.g. "process_the_refusal.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-germination: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };
