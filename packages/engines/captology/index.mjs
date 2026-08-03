// Entry point for the captology engine. Reads the declarative `khai` manifest
// from package.json (the single source of truth for how this engine wires) and
// composes the markdown members into a ready-to-use instruction set.
//
// Captology is a depth-1 piece engine: a root (the engineered hook) over four
// facets (trigger, ability, jackpot, investment) after Fogg's behavior model and
// Eyal's hook. The canon owns the tree shape, so this loader pulls the composition
// chains from @chbrain/khai-arch rather than re-deriving them here. Captology is
// the behavioral pole of the design family; it wires on: piece, and it conditions
// the user over time rather than deceiving them once.

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

/** Leaf file -> [root, ..., leaf] composition chain. The canon owns the tree. */
export const chains = compositionOrder(manifest);

/** Original files, frontmatter intact, keyed by member file (for provenance). */
export const raw = Object.fromEntries(manifest.members.map((m) => [m.file, read(m.file)]));

/**
 * Assemble the ready-to-use instruction set for one leaf: the whole chain from
 * the root down to that leaf, root first, bodies only. The deeper member carries
 * the shallower one upward, so composing a facet emits the captology root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "piece_jackpot.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-captology: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so captology reads system-wide and no
 * hooking piece escapes it. Links are member names, never paths.
 */
export const law =
  "Captology ([the root hook](piece_captology.md)): a designed object can be built to " +
  "condition its user to return; each Piece bears only the facets of the loop its Load " +
  "Bearing links -- trigger, ability, jackpot, or investment -- conditioning over time, not deceiving once.";

export default { manifest, chains, raw, compose, law };
