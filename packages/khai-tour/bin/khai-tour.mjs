#!/usr/bin/env node

/**
 * khai-tour CLI: stage artifacts to venues
 * Usage: khai-tour <command> [options]
 */

import { argv, exit } from "process";
import * as tour from "../lib/index.mjs";

const command = argv[2];

async function main() {
  switch (command) {
    case "venues":
      console.log("Available venues:");
      Object.entries(tour.venues).forEach(([name, venue]) => {
        console.log(`  ${name}: ${venue.description}`);
        console.log(`    Format: ${venue.defaultFormat}, Packaging: ${venue.packaging}`);
      });
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
  venues    List available venues and their constraints
  formats   List available output formats
  help      Show this help message

Note: Full tour orchestration coming soon.
For now, use the library directly: import('@chbrain/khai-tour')
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
