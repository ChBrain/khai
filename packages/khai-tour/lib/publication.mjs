/**
 * khai-tour publication: render a publication Venue's artifact (the aggregate ->
 * combine -> render beats). Pure assembly (sources in, entries + warnings out),
 * like bundle.mjs; tour() handles the writing/packaging.
 *
 * PR-3 ships the native markdown renderer. The pdf/html renderers (which is where
 * any external tooling enters) land in a later PR and currently throw a clear
 * "not implemented yet" — see docs/TOUR.md.
 */

import { getVenue, validateVenueFormat } from "./profiles.mjs";
import { aggregateCollections, combineCollections, injectMetadata } from "./aggregator.mjs";

const EXT = { markdown: "md", html: "html", pdf: "pdf" };

/**
 * Render the artifact entries for a publication Venue.
 *
 * @param {string} venue - publication venue slug (e.g. "markdown", "github_pages")
 * @param {object} [opts]
 * @param {string} [opts.artifactDir="."]
 * @param {Object} [opts.collections={}]
 * @param {string} [opts.format] - defaults to the venue's defaultFormat
 * @param {boolean} [opts.stripFrontmatter=true]
 * @param {boolean} [opts.injectMeta=true] - prepend the generated-by metadata block
 * @returns {Promise<{venue,kind,format,packaging,entries:{path,role,content}[],warnings:string[]}>}
 */
export async function renderPublication(
  venue,
  { artifactDir = ".", collections = {}, format, stripFrontmatter = true, injectMeta = true } = {},
) {
  const profile = getVenue(venue); // throws on unknown venue
  if (profile.kind !== "publication") {
    throw new Error(`Venue "${venue}" is "${profile.kind}", not publication`);
  }

  const fmt = format ?? profile.defaultFormat;
  validateVenueFormat(venue, fmt); // throws if the venue does not support fmt

  if (fmt !== "markdown") {
    throw new Error(
      `tour: the "${fmt}" renderer is not implemented yet (only markdown); see docs/TOUR.md`,
    );
  }
  const ext = EXT[fmt];

  const aggregated = await aggregateCollections(artifactDir, collections, stripFrontmatter);
  const render = (content) => (injectMeta ? injectMetadata(content, { profile: venue }) : content);
  const entries = [];
  const warnings = [];

  if (profile.optimization === "expanded") {
    // One artifact per collection (e.g. GitHub Pages serves files separately).
    for (const name of Object.keys(aggregated)) {
      entries.push({ path: `${name}.${ext}`, role: "artifact", content: render(aggregated[name]) });
    }
  } else {
    // bundled / curated / compact / portable -> a single combined artifact, in
    // the caller's collection order (curated = caller-controlled ordering).
    const combined = combineCollections(aggregated, Object.keys(collections));
    entries.push({ path: `${venue}.${ext}`, role: "artifact", content: render(combined) });
  }

  const maxFiles = profile.constraints?.maxFiles;
  if (maxFiles != null && entries.length > maxFiles) {
    warnings.push(
      `venue "${venue}" allows ${maxFiles} file(s) but ${entries.length} were produced`,
    );
  }

  return {
    venue,
    kind: "publication",
    format: fmt,
    packaging: profile.packaging,
    entries,
    warnings,
  };
}
