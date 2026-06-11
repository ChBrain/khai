/**
 * khai-tour bundle: assemble the interactive deployment bundle (the tree that
 * becomes the ZIP). Kept separate from the ZIP/I-O so the assembly is pure and
 * testable: sources in, an ordered list of entries + warnings out.
 *
 * Layout (see docs/TOUR.md): the root carries the human/legal wrapper, the
 * `khai/` folder carries the content fed to the model.
 *
 *   README.md  REFERENCES.md  LICENSE  LICENSE-CODE   (root)
 *   khai/instructions.md  khai/<collection>.md          (content)
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";
import { getVenue } from "./profiles.mjs";
import { composeVenue } from "./compose.mjs";
import { aggregateCollections } from "./aggregator.mjs";
import { adaptions } from "@chbrain/khai-engine-spine";

const require = createRequire(import.meta.url);
const spineDir = dirname(require.resolve("@chbrain/khai-engine-spine"));

const readIfPresent = (path) => (path && existsSync(path) ? readFileSync(path, "utf8") : null);

/**
 * Assemble the interactive deployment bundle for a Venue.
 *
 * @param {string} venue - interactive venue slug (e.g. "perplexity_space")
 * @param {object} [opts]
 * @param {string} [opts.artifactDir="."] - root the collection globs resolve against
 * @param {Object} [opts.collections={}] - { name: glob | globs } knowledge to bundle
 * @param {string[]} [opts.engines=[]] - engine bullets injected at Knowledge
 * @param {object} [opts.meta={}] - root file source overrides: { readme, references, license, licenseCode }
 * @param {boolean} [opts.stripFrontmatter=true]
 * @returns {Promise<{ venue: string, kind: string, entries: {path,role,content}[], warnings: string[] }>}
 */
export async function buildInteractiveBundle(
  venue,
  { artifactDir = ".", collections = {}, engines = [], meta = {}, stripFrontmatter = true } = {},
) {
  const profile = getVenue(venue); // throws on unknown venue
  if (profile.kind !== "interactive") {
    throw new Error(`Venue "${venue}" is "${profile.kind}", not interactive`);
  }

  const entries = [];
  const warnings = [];

  // Root wrapper: sourced from known locations, overridable via `meta`. A
  // missing file is a warning, never a silent drop (attribution and licence
  // must not vanish quietly).
  const root = [
    { name: "README.md", role: "readme", path: meta.readme ?? join(spineDir, venue, "README.md") },
    { name: "REFERENCES.md", role: "references", path: meta.references ?? null },
    { name: "LICENSE", role: "license", path: meta.license ?? join(artifactDir, "LICENSE") },
    {
      name: "LICENSE-CODE",
      role: "license",
      path: meta.licenseCode ?? join(artifactDir, "LICENSE-CODE"),
    },
  ];
  for (const { name, role, path } of root) {
    const content = readIfPresent(path);
    if (content === null) {
      warnings.push(`${name}: not found${path ? ` at ${path}` : ""}; omitted from the bundle`);
      continue;
    }
    entries.push({ path: name, role, content });
  }

  // khai/ content: the composed instructions (always) + exactly the collections
  // the caller named (no implicit engine content).
  entries.push({
    path: "khai/instructions.md",
    role: "instructions",
    content: composeVenue(venue, { engines }),
  });
  if (!adaptions[venue]) {
    warnings.push(
      `no venue adaption for "${venue}" in spine; instructions are Standard + House Rules only`,
    );
  }

  const knowledge = await aggregateCollections(artifactDir, collections, stripFrontmatter);
  const names = Object.keys(knowledge).sort();
  for (const name of names) {
    entries.push({ path: `khai/${name}.md`, role: "knowledge", content: knowledge[name] });
  }

  // Hard knowledge-file limit (e.g. a Gemini Gem accepts at most 10). The fix is
  // to consolidate collections — one file per category — so fail loudly rather
  // than ship a bundle the venue will reject. Instructions do not count (they go
  // in the host's instruction field, not as a knowledge file).
  const maxFiles = profile.constraints?.maxFiles;
  if (maxFiles != null && names.length > maxFiles) {
    throw new Error(
      `Venue "${venue}" accepts at most ${maxFiles} knowledge files but ${names.length} were produced; consolidate collections (e.g. merge into "personas", "positions") to fit`,
    );
  }

  return { venue, kind: "interactive", entries, warnings };
}
