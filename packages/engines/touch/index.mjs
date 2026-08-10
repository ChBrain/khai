// Entry point for the touch engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and composes
// the markdown members into a ready-to-use instruction set.
//
// Touch is a depth-1 process engine on the place type: a root (the place's haptic
// field) over four facets (texture, thermal, press, and the untouchable twist). The
// canon owns the tree shape, so this loader pulls the composition chains from
// @chbrain/khai-arch rather than re-deriving them here. Touch is the third sensory
// sibling of the soundscape and smellscape engines -- the place felt as much as heard
// or smelled; it wires on: place/Shown, the place felt as much as seen.

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
 * the shallower one upward, so composing a facet emits the touch root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_texture.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-touch: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so touch reads system-wide and no place
 * is felt as untouched scenery. Links are member names, never paths.
 */
export const law =
  "Touch ([the root field](process_touch.md)): every Place has a haptic field it is felt through, " +
  "not only a look; each Place shows only the facet its Shown links -- texture, thermal, press, or untouchable -- " +
  "the place composed as much by what it feels like as by what it looks like.";

export default { manifest, chains, raw, compose, law };
