// Entry point for the legibility engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and composes
// the markdown members into a ready-to-use instruction set.
//
// Legibility is a depth-1 process engine on the place type: a root (the place read as a
// navigable image) over five elements (path, edge, district, node, landmark). Like the
// geomorphology and climate engines, it carries no forced twist -- Lynch's five elements
// are equal peers with no loss among them, and the readable-vs-illegible ambivalence
// lives in the root. The canon owns the tree shape, so this loader pulls the composition
// chains from @chbrain/khai-arch rather than re-deriving them here. Legibility is the
// wayfinding sibling of the space and street-life engines; it wires on: place/Shown, the
// place read as a map one can or cannot hold.

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
 * the shallower one upward, so composing an element emits the legibility root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_path.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-legibility: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so legibility reads system-wide and no
 * place is taken as an undifferentiated blur. Links are member names, never paths.
 */
export const law =
  "Legibility ([the root image](process_legibility.md)): every Place can be read as a navigable image, " +
  "not only a look; each Place shows only the element its Shown links -- path, edge, district, node, or landmark -- " +
  "the place held as a clear mental map or lost as an unreadable blur.";

export default { manifest, chains, raw, compose, law };
