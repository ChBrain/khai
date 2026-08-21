// Entry point for the forgoing composite. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this composite wires) and composes
// the markdown ladder into a ready-to-use instruction set. The canon owns the tree
// shape, so this loader pulls the composition chains from @chbrain/khai-arch; each
// member validates against its own khai type.
//
// Forgoing reads what it costs to ask for help that only somebody marked would need
// (F-persona): it wires the mark (stigma, and the discounting it draws) and the request
// (asking, whose reluctance is priced on imposition and never on identity). Its three
// bridges are the price, the avoidance, and the undercount twist -- the forgoing is what
// keeps the mark worth avoiding.
//
// This is the third composite to wire the stigma engine: membership reads the mark from
// the group's side, carrying reads what concealing it costs, and forgoing reads what it
// does at the moment a request would disclose it. An atom carries a phenomenon, and a
// composite carries a question asked of it. The asking engine is wired here for the first
// time, and the pairing is not convenient: asking's largest term is the request that was
// never made and leaves no record, which is precisely the population stigma is then
// described without.

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
 * composing a bridge emits the forgoing root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-composite-forgoing: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

export default { manifest, chains, raw, compose };

// The two atoms this composite wires over, re-exported so a consumer that installs the
// composite can compose from either without a second import. The dependency graph is the
// citation graph: both are declared in package.json, and every hard link in the members
// resolves through them. The two are shaped differently -- asking is a process tree with
// movement heads and forms, stigma is a piece engine hanging a bearer and two processes
// flat beneath the mark -- so a consumer walks them differently.
import asking from "@chbrain/khai-engine-asking";
import stigma from "@chbrain/khai-engine-stigma";

export const atoms = { asking, stigma };
