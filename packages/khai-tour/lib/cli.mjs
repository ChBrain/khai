/**
 * khai-tour CLI core: argument parsing and presentation, kept here (not in bin/)
 * so it is unit-testable without spawning a process. bin/khai-tour.mjs is the
 * thin wrapper that wires these to stdout.
 */

import { tour } from "./index.mjs";
import { venues } from "./profiles.mjs";

/**
 * Parse `stage` arguments into a tour() config.
 *
 *   stage --venue <slug> --out <dir> [--artifact <dir>]
 *         [--collection <name>=<glob> ...] [--engine <text> ...] [--format <fmt>]
 *
 * @param {string[]} args - argv after the `stage` command
 * @returns {object} a tour() config
 */
export function parseStageArgs(args) {
  const cfg = { collections: {}, engines: [] };
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    const value = () => {
      const v = args[++i];
      if (v === undefined) throw new Error(`${flag} expects a value`);
      return v;
    };
    switch (flag) {
      case "--venue":
        cfg.venue = value();
        break;
      case "--out":
      case "--output":
        cfg.outputDir = value();
        break;
      case "--artifact":
      case "--artifact-dir":
        cfg.artifactDir = value();
        break;
      case "--format":
        cfg.format = value();
        break;
      case "--engine":
        cfg.engines.push(value());
        break;
      case "--collection": {
        const pair = value();
        const eq = pair.indexOf("=");
        if (eq < 1) throw new Error(`--collection expects <name>=<glob>, got "${pair}"`);
        cfg.collections[pair.slice(0, eq)] = pair.slice(eq + 1);
        break;
      }
      default:
        throw new Error(`Unknown option: ${flag}`);
    }
  }
  return cfg;
}

/** Run the `stage` command: parse, validate the required flags, stage. */
export async function runStage(args) {
  const cfg = parseStageArgs(args);
  if (!cfg.venue || !cfg.outputDir) {
    throw new Error("stage requires --venue <slug> and --out <dir>");
  }
  return tour(cfg);
}

/** One venue's two display lines: a heading and a kind-aware detail line (no
 * `undefined` for interactive venues, which have no format/packaging). */
export function describeVenue(name, venue) {
  const head = `${name}: ${venue.description}`;
  const detail =
    venue.kind === "interactive"
      ? `kind: interactive, source: ${venue.source}`
      : `kind: ${venue.kind ?? "publication"}, format: ${venue.defaultFormat}, packaging: ${venue.packaging}`;
  return { head, detail };
}

/** The full `venues` listing as text. */
export function venuesText() {
  const lines = ["Available venues:"];
  for (const [name, venue] of Object.entries(venues)) {
    const { head, detail } = describeVenue(name, venue);
    lines.push(`  ${head}`, `    ${detail}`);
  }
  return lines.join("\n");
}
