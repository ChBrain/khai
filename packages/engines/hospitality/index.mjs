// Entry point for the hospitality engine. Reads the declarative `khai` manifest
// from package.json (the single source of truth for how this engine wires) and
// composes the markdown tree into a ready-to-use instruction set.
//
// Hospitality is a process tree: a root (hospitality) declares the conversion of
// a stranger into a guest, four movement heads carry the arrangement (the taking
// in, the terms, the clock, the breach), and each leaf is one form. The canon
// owns the tree shape, so this loader pulls the composition chains from
// @chbrain/khai-arch rather than re-deriving them here.
//
// The taking in comes first and the rest follow from it, but only the clock is
// ordered internally -- the terms hold throughout and a breach can occur at any
// point -- so a play composes the members it needs rather than walking the tree.

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
 * @param {{ leaf: string }} opts  a member file, e.g. "process_the_overstay.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-hospitality: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };
