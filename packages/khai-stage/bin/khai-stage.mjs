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
  // --anchor was in the usage line and in this file's own header, and was never
  // in this map. It therefore fell through to the positional list, so
  // `khai-stage buechner --anchor process_` stamped the house into a directory
  // named `--anchor` and called the Theatre Manager "process_", and reported
  // success. A documented flag that silently corrupts the thing it configures is
  // worse than an undocumented one.
  "--anchor": (v) => (anchor = v),
};

const USAGE =
  `usage: khai-stage <source> [targetDir] [manager] [playwright] [roadie]\n` +
  `       [--kind <${KINDS.join("|")}>] [--collection <name>] [--anchor <prefix_>]\n` +
  `       [--repertoire <pkg,pkg,...>]\n\n` +
  `  e.g. khai-stage buechner\n` +
  `       khai-stage cultures --kind canon\n\n` +
  `Stamps a house on disk and never reaches the network.`;

// Asking for help must not build anything. `--help` was unhandled, so it landed
// in the positional list as the source name and raised a 54-file house called
// `khai-plays---help` in the working directory. A generator whose help flag
// generates is the one flag a stranger is guaranteed to try first.
if (rawArgs.some((a) => a === "--help" || a === "-h")) {
  console.log(USAGE);
  process.exit(0);
}

const args = [];
for (let i = 0; i < rawArgs.length; i++) {
  const a = rawArgs[i];
  const eq = a.indexOf("=");
  const name = eq === -1 ? a : a.slice(0, eq);
  if (flags[name]) {
    flags[name](eq === -1 ? rawArgs[++i] : a.slice(eq + 1));
  } else if (a.startsWith("-")) {
    // An unknown flag is a mistake, not a source name. Left as a positional it
    // became the target directory, so a typo stamped a house into a folder
    // named after the typo.
    console.error(`khai-stage: unknown option ${JSON.stringify(a)}\n\n${USAGE}`);
    process.exit(1);
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
  console.error(USAGE);
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
