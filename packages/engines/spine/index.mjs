// Entry point for the spine engine. Reads the declarative `khai` manifest from
// package.json (the single source of truth for how this engine wires) and
// exposes the collaboration contract alongside the world architecture (the
// extension point).
//
// The spine ships a single, provider-neutral instructions contract (the basis).
// Host-specific setup is not an instructions flavor: it lives in the per-host
// folders the setup plan (plan_setup.md) routes to, and is assembled by
// khai-tour, which renders spine + engines + content into a target deployment.
//
// The spine is `class: meta`: it ships the architecture's meta layer
// (instructions, architecture), not the five khai content types, so it is
// certified through the shared conformance kit's meta branch
// (@chbrain/khai-tests `validateEnginePackage`) rather than the content-engine
// checklist. The loader stays the same shape as the other engines so the
// surface feels identical.
//
// Zero runtime dependencies, plain Node ESM.

import { readFileSync, readdirSync, existsSync } from "node:fs";
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

const instructionsMember = manifest.members.find((m) => m.type === "instructions");
const architectureMember = manifest.members.find((m) => m.type === "architecture");

/** Original files, frontmatter intact, for provenance and stamping, keyed by
 * filename. */
export const raw = Object.fromEntries(manifest.members.map((m) => [m.file, read(m.file)]));

/** The collaboration contract (the basis), body only. */
export const instructions = body(raw[instructionsMember.file]);

/** The world architecture (the extension point), body only. */
export const architecture = body(raw[architectureMember.file]);

/** The shared House Rules fragment (runtime-output discipline merged into every
 * deployed System), body only. Markdown, not a khai instance: the Roadie parses
 * and merges it; spine only ships it. */
export const houseRules = existsSync(join(here, "house-rules.md"))
  ? body(read("house-rules.md"))
  : "";

/** Per-Venue adaption fragments, keyed by folder name (e.g. `perplexity`), body
 * only. Each `<venue>/adaption.md` is the model-specific delta the Roadie merges
 * into the Standard's System for that Venue. */
export const adaptions = Object.fromEntries(
  readdirSync(here, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(here, d.name, "adaption.md")))
    .map((d) => [d.name, body(read(join(d.name, "adaption.md")))]),
);

/**
 * Assemble the collaboration contract, ready to drop into an LLM context. There
 * is a single, provider-neutral contract; host-specific setup is layered by
 * khai-tour from the per-host folders, not chosen here.
 *
 * @returns {string} markdown ready to drop into an LLM context
 */
export function compose() {
  return `${instructions}\n`;
}

export default { manifest, instructions, architecture, houseRules, adaptions, raw, compose };
