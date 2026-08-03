// Entry point for the ergonomics engine. Reads the declarative `khai` manifest
// from package.json (the single source of truth for how this engine wires) and
// composes the markdown members into a ready-to-use instruction set.
//
// Ergonomics is a depth-1 piece engine: a root (physical fit to the body) over
// four facets (anthropometry, reach, clearance, exertion). The canon owns the
// tree shape, so this loader pulls the composition chains from @chbrain/khai-arch
// rather than re-deriving them here. Ergonomics is the physical pole of the
// design family, sibling to usability (cognitive) and agency (political); all
// wire on: piece.

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
 * the shallower one upward, so composing a facet emits the ergonomics root with
 * it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "piece_reach.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-ergonomics: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so ergonomics reads system-wide and
 * no fitted piece escapes it. Links are member names, never paths.
 */
export const law =
  "Ergonomics ([the root fit](piece_ergonomics.md)): a designed object fits the human " +
  "body or fails it; each Piece bears only the facets of fit its Load Bearing links -- " +
  "sizing, reach, clearance, or the force it demands -- read in the body's ease or strain.";

export default { manifest, chains, raw, compose, law };
