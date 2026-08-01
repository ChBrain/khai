#!/usr/bin/env node
// khai-stage <source> [targetDir] [manager] [playwright] [roadie] [--repertoire <pkg,pkg,...>]
// Stamp a khai production house. The impresario judges the source; this stamps.

import { stageHouse } from "../index.mjs";

// Pull --repertoire out of argv first so it never shifts the positional
// arguments below; it is optional and order-independent.
const rawArgs = process.argv.slice(2);
let repertoire;
const args = [];
for (let i = 0; i < rawArgs.length; i++) {
  const a = rawArgs[i];
  if (a === "--repertoire") {
    repertoire = rawArgs[++i];
  } else if (a.startsWith("--repertoire=")) {
    repertoire = a.slice("--repertoire=".length);
  } else {
    args.push(a);
  }
}

const source = args[0];
if (!source) {
  console.error(
    "usage: khai-stage <source> [targetDir] [manager] [playwright] [roadie] [--repertoire <pkg,pkg,...>]   e.g. khai-stage buechner",
  );
  process.exit(1);
}

const result = await stageHouse({
  source,
  targetDir: args[1] || `khai-plays-${source}`,
  manager: args[2],
  playwright: args[3],
  roadie: args[4],
  repertoire,
});

console.log(`raised ${result.repo} (${result.written.length} files):`);
for (const f of result.written) console.log(`  ${f}`);
console.log("\nnext, by hand (this never reaches the network):");
for (const h of result.handoffs) console.log(`  - ${h}`);
