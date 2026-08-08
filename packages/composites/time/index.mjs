// Entry point for the time composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and
// composes the markdown ladder into a ready-to-use instruction set. The canon owns
// the tree shape, so this loader pulls the composition chains from @chbrain/khai-arch;
// each member validates against its own khai type.
//
// Time is the closer of the time family and the repo's first multi-cargo composite:
// it wires the two time-engines (chronos, kairos) and reads time whole -- the
// measured passage on an object at Yearbook, the opportune moment on an unfolding at
// its own chapter -- its three bridges being how the two clocks meet (timeliness,
// untimeliness, fullness).

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
 * Assemble the instruction set for one leaf: the whole chain from the anchor
 * down to that leaf, anchor first, bodies only. The leaf carries the anchor
 * upward, so composing a bridge emits the time root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-time: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The two atoms this composite wires over, re-exported so a consumer that installs
// the composite can compose from either face of time without a second import. The
// dependency graph is the citation graph: these two are declared in package.json,
// and every hard link in the members resolves through them.
import chronos from "@chbrain/khai-engine-chronos";
import kairos from "@chbrain/khai-engine-kairos";

export const atoms = { chronos, kairos };
