#!/usr/bin/env node
// khai-stage <source> [targetDir] [manager] [playwright]
// Stamp a khai production house. The impresario judges the source; this stamps.

import { stageHouse } from "../index.mjs";

const source = process.argv[2];
if (!source) {
  console.error(
    "usage: khai-stage <source> [targetDir] [manager] [playwright]   e.g. khai-stage buechner",
  );
  process.exit(1);
}

const result = stageHouse({
  source,
  targetDir: process.argv[3] || `khai-plays-${source}`,
  manager: process.argv[4],
  playwright: process.argv[5],
});

console.log(`raised ${result.repo} (${result.written.length} files):`);
for (const f of result.written) console.log(`  ${f}`);
console.log("\nnext, by hand (this never reaches the network):");
for (const h of result.handoffs) console.log(`  - ${h}`);
