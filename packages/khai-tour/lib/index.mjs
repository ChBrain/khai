/**
 * khai-tour: stage plays and khai artifacts to their venues
 *
 * Core exports: profiles, aggregator, renderer (when implemented)
 */

export * from "./profiles.mjs";
export * as aggregator from "./aggregator.mjs";
export { composeInstructions, composeVenue } from "./compose.mjs";

/**
 * Main tour orchestrator: takes artifact, applies profile, renders output
 * @param {Object} config - Tour configuration
 * @param {string} config.artifactDir - Directory containing artifact files
 * @param {Object} config.collections - Map of collection name to glob pattern(s)
 * @param {string} config.venue - Target venue name (from profiles)
 * @param {string} config.outputDir - Where to write output
 * @param {boolean} config.stripFrontmatter - Strip YAML frontmatter (default: true)
 * @returns {Promise<Object>} Tour results with output file paths
 */
export async function tour(config) {
  const { artifactDir, collections, venue, outputDir, stripFrontmatter = true } = config;

  // TODO: Implement full tour pipeline:
  // 1. Validate venue and format
  // 2. Aggregate collections
  // 3. Select renderer based on format
  // 4. Render to temporary file
  // 5. Package if needed (ZIP)
  // 6. Write to outputDir
  // 7. Return metadata

  throw new Error("tour() orchestrator not yet implemented. Use aggregator + renderers directly.");
}
