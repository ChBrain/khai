/**
 * khai-tour: stage plays and khai artifacts to their venues
 *
 * Core exports: profiles, aggregator, compose, the bundle assembler, the ZIP
 * writer, and the tour() orchestrator.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getVenue } from "./profiles.mjs";
import { buildInteractiveBundle } from "./bundle.mjs";
import { renderPublication } from "./publication.mjs";
import { zip } from "./zip.mjs";

export * from "./profiles.mjs";
export * as aggregator from "./aggregator.mjs";
export { composeInstructions, composeVenue } from "./compose.mjs";
export { buildInteractiveBundle } from "./bundle.mjs";
export { renderPublication } from "./publication.mjs";
export { zip } from "./zip.mjs";

/**
 * Stage khai work to one Venue. Dispatches on the venue's `kind` (see
 * docs/TOUR.md): `interactive` composes the deployment and writes it as a ZIP;
 * `publication` renders an artifact (not implemented yet).
 *
 * @param {object} config
 * @param {string} config.venue - target venue slug (from profiles)
 * @param {string} config.outputDir - directory the staged result is written to
 * @param {string} [config.artifactDir="."] - root the collection globs resolve against
 * @param {Object} [config.collections={}] - { name: glob | globs } knowledge to bundle
 * @param {string[]} [config.engines=[]] - engine bullets injected at Knowledge (interactive)
 * @param {string} [config.format] - publication output format (defaults to venue.defaultFormat)
 * @param {object} [config.meta={}] - root file source overrides for the bundle
 * @param {boolean} [config.stripFrontmatter=true]
 * @returns {Promise<{venue,kind,outputPath,entries,warnings}>} a manifest of what was written
 */
export async function tour({
  venue,
  outputDir,
  artifactDir = ".",
  collections = {},
  engines = [],
  format,
  meta = {},
  stripFrontmatter = true,
}) {
  if (!venue) throw new Error("tour: `venue` is required");
  if (!outputDir) throw new Error("tour: `outputDir` is required");
  const profile = getVenue(venue); // throws on unknown venue

  if (profile.kind === "interactive") {
    const bundle = await buildInteractiveBundle(venue, {
      artifactDir,
      collections,
      engines,
      meta,
      stripFrontmatter,
    });
    mkdirSync(outputDir, { recursive: true });
    const outputPath = join(outputDir, `${venue}.zip`);
    writeFileSync(outputPath, zip(bundle.entries.map((e) => ({ name: e.path, data: e.content }))));
    return {
      venue,
      kind: profile.kind,
      outputPath,
      entries: bundle.entries.map(({ path, role }) => ({ path, role })),
      warnings: bundle.warnings,
    };
  }

  // Publication path: aggregate -> render -> (package). Native markdown now; the
  // pdf/html renderers land in a later PR (renderPublication throws for them).
  const pub = await renderPublication(venue, {
    artifactDir,
    collections,
    format,
    stripFrontmatter,
  });
  mkdirSync(outputDir, { recursive: true });

  let outputPath;
  if (pub.packaging === "zip") {
    outputPath = join(outputDir, `${venue}.zip`);
    writeFileSync(outputPath, zip(pub.entries.map((e) => ({ name: e.path, data: e.content }))));
  } else {
    for (const entry of pub.entries) writeFileSync(join(outputDir, entry.path), entry.content);
    outputPath = pub.entries.length === 1 ? join(outputDir, pub.entries[0].path) : outputDir;
  }

  return {
    venue,
    kind: pub.kind,
    format: pub.format,
    outputPath,
    entries: pub.entries.map(({ path, role }) => ({ path, role })),
    warnings: pub.warnings,
  };
}
