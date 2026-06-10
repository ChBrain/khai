#!/usr/bin/env node

/**
 * khai-tour CLI: stage artifacts to venues
 * Usage: khai-tour <command> [options]
 */

import { argv, exit } from "process";
import * as tour from "../lib/index.mjs";
import { runStage, venuesText } from "../lib/cli.mjs";

const command = argv[2];

async function main() {
  switch (command) {
    case "stage": {
      const result = await runStage(argv.slice(3));
      console.log(`Staged ${result.venue} (${result.kind}) -> ${result.outputPath}`);
      for (const entry of result.entries) {
        console.log(`  ${entry.role.padEnd(12)} ${entry.path}`);
      }
      for (const warning of result.warnings) {
        console.warn(`  ! ${warning}`);
      }
      break;
    }

    case "venues":
      console.log(venuesText());
      break;

    case "formats":
      console.log("Available formats:");
      Object.entries(tour.formats).forEach(([name, fmt]) => {
        console.log(`  ${name}: ${fmt.name}`);
        console.log(`    Engine: ${fmt.engine}`);
      });
      break;

    case "help":
    case "--help":
    case "-h":
    case undefined:
      console.log(`khai-tour: stage khai artifacts to venues

Usage: khai-tour <command> [options]

Commands:
  stage     Stage a venue's deployment to an output directory
            --venue <slug> --out <dir> [--artifact <dir>]
            [--collection <name>=<glob> ...] [--engine <text> ...] [--format <fmt>]
  venues    List available venues and their kind/source/constraints
  formats   List available output formats
  help      Show this help message
      `);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  exit(1);
});
