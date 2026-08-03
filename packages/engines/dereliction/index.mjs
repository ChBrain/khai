// Entry point for the dereliction engine. Reads the declarative `khai` manifest
// from package.json (the single source of truth for how this engine wires) and
// composes the markdown members into a ready-to-use instruction set.
//
// Dereliction is a depth-1 process engine on the place type: a root (the
// withdrawal of care by an authority) over four forms (disrepair, abandonment,
// disinvestment, ruin). The canon owns the tree shape, so this loader pulls the
// composition chains from @chbrain/khai-arch rather than re-deriving them here.
// Dereliction is the decline phase of the neighborhood-cycle family; it wires
// on: place/Offers, and it is the social withdrawal that unleashes decay.

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
 * the shallower one upward, so composing a form emits the dereliction root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_ruin.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-dereliction: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so dereliction reads system-wide and
 * no neglected place escapes it. Links are member names, never paths.
 */
export const law =
  "Dereliction ([the root withdrawal](process_dereliction.md)): a Place declines when the " +
  "authority responsible for it stops maintaining it; each Place shows only the form its " +
  "Offers links -- disrepair, abandonment, disinvestment, or ruin -- a choice, and reversible by a choice.";

export default { manifest, chains, raw, compose, law };
