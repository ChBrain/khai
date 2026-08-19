// Entry point for the meridian composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Meridian reads what a place gave up when it stopped taking its time from its own sky
// (F-place): it wires the first clock (celestial, the sky's bodies as the place's own
// Shown) and the second (social-time, the collective structuring of time the place keeps).
// Its three bridges are the ceiling, the beat, and the offset twist -- the reference had to
// be surrendered to buy the coordination, so the better a place keeps time the less it can
// tell what time it is.
//
// Unlike most composites in this canon, this one attaches at Place rather than at Persona:
// both atoms declare place/Shown, and the composite's own cargo link follows them there.
//
// The social-time engine is wired here for the second time. Peopling runs it on who is
// about -- the errand, the round, the loitering -- reading a place by the presence in it;
// here it is run against the sun. Neither composite owns it.

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
 * Assemble the instruction set for one leaf: the whole chain from the anchor down to
 * that leaf, anchor first, bodies only. The leaf carries the anchor upward, so
 * composing a bridge emits the meridian root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-meridian: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The two atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from either without a second import. The dependency graph is the
// citation graph: these two are declared in package.json, and every hard link in the members
// resolves through them. Both carry full member trees and both attach at place/Shown, which
// is what lets this composite read a place rather than a persona.
import celestial from "@chbrain/khai-engine-celestial";
import socialTime from "@chbrain/khai-engine-social-time";

export const atoms = { celestial, "social-time": socialTime };
