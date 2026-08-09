// Entry point for the social-time engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and composes the
// markdown members into a ready-to-use instruction set.
//
// Social-time is a depth-1 process engine on the place type: a root (the collective
// structuring of time a place keeps) over four facets (calendar, schedule, tempo, and the
// synchrony twist). The canon owns the tree shape, so this loader pulls the composition
// chains from @chbrain/khai-arch rather than re-deriving them here. Social-time is the
// collective-time member of the F-place family and the collective-side branch of the time
// family; it wires on: place/Shown, the place read by the shared time it keeps.

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
 * the shallower one upward, so composing a facet emits the social-time root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_calendar.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-social-time: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions contract
 * carries: declared once, linking the root, so social-time reads system-wide and no place
 * is taken as standing outside collective time. Links are member names, never paths.
 */
export const law =
  "Social-time ([the root order](process_social-time.md)): every Place keeps a collective, socially-made structuring of time, " +
  "not only the clock's measure; each Place shows only the facet its Shown links -- calendar, schedule, tempo, or synchrony -- " +
  "the place ordered and known by the shared time it keeps.";

export default { manifest, chains, raw, compose, law };
