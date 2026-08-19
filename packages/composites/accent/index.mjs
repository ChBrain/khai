// Entry point for the accent composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Accent reads what it costs a persona to be understood in a room and who the room charges
// for it (F-persona): it wires the first gate (language, five channels each held at one of
// four widths) and the second (register, a specialist code layered on the base tongue). Its
// three bridges are the width, the code, and the discount twist -- difficulty felt in the
// hearer and charged to the speaker.
//
// The register engine is wired here for the second time in the canon. Utterance runs it with
// implicature, speech act, and tone, as one of the ways a persona talks; here it runs as a
// gate somebody is standing outside. Neither composite owns it.
//
// This is the third composite to run on a misattributed processing experience. The bias
// engine owns the tilt itself as a standing position; glide reads a persona steering their
// own study by it; anomaly reads a rejection standing in for a failed sorting. Accent reads
// the case where the effort belongs to a listener and the cost lands on a speaker.

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
 * composing a bridge emits the accent root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-accent: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The two atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from either without a second import. The dependency graph is the
// citation graph: these two are declared in package.json, and every hard link in the members
// resolves through them. Both carry full member trees; the language atom's is the largest in
// the canon this composite touches, running five channels across four widths.
import language from "@chbrain/khai-engine-language";
import register from "@chbrain/khai-engine-register";

export const atoms = { language, register };
