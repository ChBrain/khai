// Entry point for the weather engine. Reads the declarative `khai` manifest
// from package.json (the single source of truth for how this engine wires) and
// composes the markdown tree into a ready-to-use instruction set.
//
// Like language, weather is a process tree rather than a depth-1 anchor +
// expressions: a root (weather), its channels (wind, water, heat, cold, sky,
// season), and each transient channel's intensity bands. The canon owns the
// tree shape, so this loader pulls the composition chains from
// @chbrain/khai-arch rather than re-deriving them here. Weather is the first
// engine to wire on: place, moving what the setting already shows.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { compositionOrder } from "@chbrain/khai-arch";

const here = dirname(fileURLToPath(import.meta.url));
const read = (file) => readFileSync(join(here, file), "utf8");

/** Strip a leading YAML frontmatter block, leaving the prose body. Tolerates
 * CRLF: content authored on Windows must not leak its YAML into the composed
 * LLM context just because the delimiters are \r\n rather than \n. */
const body = (md) => md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();

/** The declarative wiring contract, authored in package.json. */
export const manifest = JSON.parse(read("package.json")).khai;

/** Leaf file -> [root, ..., leaf] composition chain. The canon owns the tree. */
export const chains = compositionOrder(manifest);

/** Original files, frontmatter intact, keyed by member file (for provenance). */
export const raw = Object.fromEntries(manifest.members.map((m) => [m.file, read(m.file)]));

/**
 * Assemble the ready-to-use instruction set for one leaf of the tree: the whole
 * chain from the root down to that leaf, root first, bodies only. The deeper
 * member carries the shallower ones upward, so composing a band emits its
 * channel and the root with it.
 *
 * @param {{ leaf: string }} opts  leaf is a member file, e.g. "process_wind_gale.md"
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose({ leaf } = {}) {
  const chain = chains[leaf];
  if (!chain) {
    const valid = Object.keys(chains).join(", ");
    throw new Error(
      `khai-engine-weather: compose() needs { leaf } to be one of [${valid}]; got ${JSON.stringify(leaf)}`,
    );
  }
  return `${chain.map((file) => body(raw[file])).join("\n\n")}\n`;
}

/**
 * The engine's law, as the one Knowledge bullet a deployed instructions
 * contract carries: declared once, linking the root, so the weather-world reads
 * system-wide and no place escapes it. Links are member names, never paths.
 */
export const law =
  "Weather ([the root loop](process_weather.md)): every Place runs it when its sky turns; " +
  "each Place shows only the channels and bands its Shown links, and under a rising front " +
  "slides up the bands toward the load it cannot temper.";

export default { manifest, chains, raw, compose, law };
