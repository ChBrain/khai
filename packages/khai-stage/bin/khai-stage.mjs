#!/usr/bin/env node
// khai-stage <source> [targetDir] [manager] [playwright] [roadie]
//            [--kind <stage|work|canon>] [--collection <name>] [--anchor <prefix_>]
//            [--repertoire <pkg,pkg,...>]
// Stamp a khai house. The impresario judges the source; this stamps.

import { stageHouse, KINDS } from "../index.mjs";

// Pull --repertoire out of argv first so it never shifts the positional
// arguments below; it is optional and order-independent.
const rawArgs = process.argv.slice(2);
let repertoire;
let kind;
let collection;
let anchor;
const flags = {
  "--repertoire": (v) => (repertoire = v),
  "--kind": (v) => (kind = v),
  "--collection": (v) => (collection = v),
};
const args = [];
for (let i = 0; i < rawArgs.length; i++) {
  const a = rawArgs[i];
  const eq = a.indexOf("=");
  const name = eq === -1 ? a : a.slice(0, eq);
  if (flags[name]) {
    flags[name](eq === -1 ? rawArgs[++i] : a.slice(eq + 1));
  } else {
    args.push(a);
  }
}

if (kind !== undefined && !KINDS.includes(kind)) {
  console.error(
    `khai-stage: --kind must be one of ${KINDS.join("|")}, got ${JSON.stringify(kind)}`,
  );
  process.exit(1);
}

const source = args[0];
if (!source) {
  console.error(
    `usage: khai-stage <source> [targetDir] [manager] [playwright] [roadie] [--kind <${KINDS.join("|")}>] [--collection <name>] [--anchor <prefix_>] [--repertoire <pkg,pkg,...>]   e.g. khai-stage buechner, khai-stage cultures --kind canon`,
  );
  process.exit(1);
}

// The default target dir follows the kind, the same way the house's own name
// does: only a stage house is khai-plays-<source>.
const defaultDir = kind && kind !== "stage" ? `khai-${source}` : `khai-plays-${source}`;

const result = await stageHouse({
  source,
  targetDir: args[1] || defaultDir,
  kind,
  collection,
  anchor,
  manager: args[2],
  playwright: args[3],
  roadie: args[4],
  repertoire,
});

console.log(`raised ${result.repo} (${result.written.length} files):`);
for (const f of result.written) console.log(`  ${f}`);
console.log("\nnext, by hand (this never reaches the network):");
for (const h of result.handoffs) console.log(`  - ${h}`);
