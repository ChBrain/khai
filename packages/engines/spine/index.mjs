// Entry point for the spine engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and
// assembles the collaboration instructions, by flavor, alongside the world
// architecture (the extension point).
//
// The spine is `class: meta`: it ships the architecture's meta layer
// (instructions, architecture), not the five khai content types. So it is
// certified through the shared conformance kit's meta branch
// (@chbrain/khai-tests `validateEnginePackage`) rather than the content-engine
// checklist. The loader stays the same shape as the other engines so the
// surface feels identical.
//
// Zero runtime dependencies — plain Node ESM.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const read = (file) => readFileSync(join(here, file), "utf8");

/** Strip a leading YAML frontmatter block, leaving the prose body. Tolerates
 * CRLF: content authored on Windows must not leak its YAML into the composed
 * LLM context just because the delimiters are \r\n rather than \n. */
const body = (md) => md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();

/** The declarative wiring contract, authored in package.json. */
export const manifest = JSON.parse(read("package.json")).khai;

const instructionMembers = manifest.members.filter((m) => m.type === "instructions");
const architectureMember = manifest.members.find((m) => m.type === "architecture");

/** Flavor name -> source file, derived from the instructions members
 * (`instructions_<flavor>.md`), so the member list stays the single source. */
export const flavorFiles = Object.fromEntries(
  instructionMembers.map((m) => [m.file.replace(/^instructions_(.+)\.md$/, "$1"), m.file]),
);

/** Original files, frontmatter intact — for provenance and stamping, keyed by
 * filename. */
export const raw = Object.fromEntries(manifest.members.map((m) => [m.file, read(m.file)]));

/** The world architecture (the extension point), body only. */
export const architecture = body(raw[architectureMember.file]);

/** Each instructions flavor, body only, keyed by name (e.g. raw). */
export const flavors = Object.fromEntries(
  Object.entries(flavorFiles).map(([name, file]) => [name, body(raw[file])]),
);

/**
 * Assemble the collaboration instructions for one flavor. `raw` is the base
 * flavor; vendor-specific adaptations and other flavors slot in as sibling
 * `instructions_<flavor>.md` files without moving the architecture.
 *
 * @param {{ flavor?: string }} [opts]  defaults to the `raw` flavor
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ flavor = "raw" } = {}) {
  if (!(flavor in flavors)) {
    const valid = Object.keys(flavors).join(", ");
    throw new Error(
      `khai-engine-spine: compose() needs { flavor } to be one of [${valid}]; got ${JSON.stringify(flavor)}`,
    );
  }
  return `${flavors[flavor]}\n`;
}

export default { manifest, architecture, flavors, flavorFiles, raw, compose };
