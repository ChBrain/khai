#!/usr/bin/env node
// Pre-commit / local CLI. Given content file paths, validates each affected
// engine package against the canon and prints any conformance failures.
// Uses the same validateEnginePackage() as the suite — one rule-set, two callers.

import { validateEnginePackage, findEnginePackageFor } from "./validate.mjs";
import { resolve } from "node:path";

const files = process.argv.slice(2).filter((f) => f.endsWith(".md"));
const pkgDirs = [...new Set(files.map((f) => findEnginePackageFor(resolve(f))).filter(Boolean))];

let failed = false;
for (const dir of pkgDirs) {
  const results = await validateEnginePackage(dir);
  for (const { file, errors } of results) {
    failed = true;
    for (const err of errors) console.error(`✖ ${file}: ${err}`);
  }
}

if (failed) {
  console.error("\nkhai-tests: conformance check failed.");
  process.exit(1);
}
console.log(`khai-tests: ${pkgDirs.length} package(s) conform.`);
