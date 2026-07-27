// Entry point for the space engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires). A place
// engine has one anchor and a flat set of named expressions, so this loader
// composes the anchor with a chosen expression rather than walking a tree.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const read = (file) => readFileSync(join(here, file), "utf8");
const body = (md) => md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();

export const manifest = JSON.parse(read("package.json")).khai;
export const raw = {
  anchor: read(manifest.anchor),
  ...Object.fromEntries(
    Object.entries(manifest.expressions).map(([name, file]) => [name, read(file)]),
  ),
};
export const anchor = body(raw.anchor);
export const expressions = Object.fromEntries(
  Object.keys(manifest.expressions).map((name) => [name, body(raw[name])]),
);
export function compose({ expression } = {}) {
  if (!expression || !(expression in expressions)) {
    const valid = Object.keys(expressions).join(", ");
    throw new Error(
      `khai-engine-space: compose() needs { expression } to be one of [${valid}]; got ${JSON.stringify(expression)}`,
    );
  }
  return `${anchor}\n\n${expressions[expression]}\n`;
}
export default { manifest, anchor, expressions, raw, compose };
