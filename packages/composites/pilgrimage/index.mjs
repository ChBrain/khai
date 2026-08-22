// Entry point for the pilgrimage composite. Reads the declarative `khai` manifest
// from package.json (the single source of truth for how this composite wires) and
// composes the markdown ladder into a ready-to-use instruction set. The canon owns
// the tree shape, so this loader pulls the composition chains from @chbrain/khai-arch;
// each member validates against its own khai type.
//
// Pilgrimage reads what happens to a death when strangers start coming to the place
// of it: it wires the marking and the account carried home (tourism) and the leased
// plot whose whole relationship is maintenance (grave). Its three bridges are the
// arrival, the custody, and the claim twist -- the better a death is looked after,
// the less of it belongs to the people it happened to.
//
// Both atoms are wired here for the first time in the canon. An engine can be in
// 0..n composites: an atom carries a phenomenon, and a composite carries a question
// asked of it. The pairing is structural rather than convenient, because the two
// atoms meet on one object -- tourism supplies visitors whose relationship to a place
// is an hour, and grave supplies an object whose relationship to anybody is a chore.

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
 * composing a bridge emits the pilgrimage root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-pilgrimage: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The two atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from either without a second import. The dependency graph is the
// citation graph: both are declared in package.json, and every hard link in the members
// resolves through them. The two are shaped differently -- tourism is a process tree of a
// root, four movement heads and twelve forms, while grave is a piece engine of an anchor
// with one position and three processes hanging flat beneath it -- so a consumer walking
// them should read each on its own shape rather than assume one.
import grave from "@chbrain/khai-engine-grave";
import tourism from "@chbrain/khai-engine-tourism";

export const atoms = { grave, tourism };
