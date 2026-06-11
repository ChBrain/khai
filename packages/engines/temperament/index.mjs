// Entry point for the temperament engine. Reads the declarative `khai` manifest
// from package.json (the single source of truth for how this engine wires) and
// assembles the markdown positions into a ready-to-use instruction set.
//
// Zero runtime dependencies -- plain Node ESM. The same loader works for any
// position-type engine; only the package.json `khai` manifest differs.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const read = (file) => readFileSync(join(here, file), "utf8");

/** Strip a leading YAML frontmatter block, leaving the prose body. Tolerates CRLF. */
const body = (md) => md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();

/** The declarative wiring contract, authored in package.json. */
export const manifest = JSON.parse(read("package.json")).khai;

/** Original files, frontmatter intact -- for provenance and stamping. */
export const raw = {
  anchor: read(manifest.anchor),
  ...Object.fromEntries(
    Object.entries(manifest.expressions).map(([name, file]) => [name, read(file)]),
  ),
};

/** The anchor position, body only. */
export const anchor = body(raw.anchor);

/** Each expression, body only, keyed by name (e.g. extraverted, steady). */
export const expressions = Object.fromEntries(
  Object.keys(manifest.expressions).map((name) => [name, body(raw[name])]),
);

/**
 * Assemble the instruction set for a persona holding one expression: the anchor
 * followed by the chosen pole. The expression carries the anchor upward, per the
 * engine's wiring.
 *
 * @param {{ expression: string }} opts
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ expression } = {}) {
  if (!expression || !(expression in expressions)) {
    const valid = Object.keys(expressions).join(", ");
    throw new Error(
      `khai-engine-temperament: compose() needs { expression } to be one of [${valid}]; got ${JSON.stringify(expression)}`,
    );
  }
  return `${anchor}\n\n${expressions[expression]}\n`;
}

export default { manifest, anchor, expressions, raw, compose };
