// Entry point for the stack engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and
// assembles the collaboration instructions, by flavor, alongside the world
// stack.
//
// Unlike the domain engines (gender, language, stress), the stack engine does
// not ship khai-type content, so it is not certified through the shared
// conformance kit (@chbrain/khai-tests `validateEnginePackage`). It carries the
// HACKS spine instead: the instructions a world runs on (flavored, starting
// with `raw`) and its stack (the extension point). The loader stays the same
// shape as the other engines so the surface feels identical.
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

/** Original files, frontmatter intact — for provenance and stamping. */
export const raw = {
  stack: read(manifest.stack),
  ...Object.fromEntries(Object.entries(manifest.flavors).map(([name, file]) => [name, read(file)])),
};

/** The world stack (the extension point), body only. */
export const stack = body(raw.stack);

/** Each instructions flavor, body only, keyed by name (e.g. raw). */
export const flavors = Object.fromEntries(
  Object.keys(manifest.flavors).map((name) => [name, body(raw[name])]),
);

/**
 * Assemble the collaboration instructions for one flavor. `raw` is the base
 * flavor; vendor-specific adaptations and other flavors slot in as sibling
 * `instructions_<flavor>.md` files without moving the stack.
 *
 * @param {{ flavor?: string }} [opts]  defaults to the `raw` flavor
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ flavor = "raw" } = {}) {
  if (!(flavor in flavors)) {
    const valid = Object.keys(flavors).join(", ");
    throw new Error(
      `khai-engine-stack: compose() needs { flavor } to be one of [${valid}]; got ${JSON.stringify(flavor)}`,
    );
  }
  return `${flavors[flavor]}\n`;
}

export default { manifest, stack, flavors, raw, compose };
