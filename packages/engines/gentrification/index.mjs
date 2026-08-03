// Entry point for the gentrification engine. Reads the declarative `khai`
// manifest from package.json (the single source of truth for how this engine
// wires) and composes the markdown members into a ready-to-use instruction set.
//
// Gentrification is a depth-1 process engine on the place type: a root (capital's
// re-entry through the rent-gap) over four facets (rent-gap, upgrading, eviction,
// commodification). The canon owns the tree shape, so this loader pulls the
// composition chains from @chbrain/khai-arch rather than re-deriving them here.
// Gentrification is the re-entry phase of the neighborhood-cycle family; it wires
// on: place/Withheld, and it closes the rent-gap dereliction's disinvestment opened.

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
 * the shallower one upward, so composing a facet emits the gentrification root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_eviction.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-gentrification: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so gentrification reads system-wide
 * and no reinvested place escapes it. Links are member names, never paths.
 */
export const law =
  "Gentrification ([the root re-entry](process_gentrification.md)): capital returns to a Place " +
  "when the rent-gap grows wide enough to profit; each Place shows only the facet its Withheld links -- " +
  "rent-gap, upgrading, eviction, or commodification -- what it once offered, now withheld behind a price.";

export default { manifest, chains, raw, compose, law };
