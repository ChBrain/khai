#!/usr/bin/env node
// khai-tests CLI. Two modes, one rule-set:
//
//   khai-tests <file.md> ...        engine mode (pre-commit): validate each
//                                   affected engine *package* against the canon.
//   khai-tests --project [dir]      project mode (downstream): validate every
//                                   instance file in a consuming repo against
//                                   the canon AND the wiring requirements of the
//                                   engines it has installed.
//
// Both share the same validators as the test suite — the CLI is just a caller.

import {
  validateEnginePackage,
  findEnginePackageFor,
  validateProject,
  wiringRequirements,
} from "./validate.mjs";
import { resolve, relative } from "node:path";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const argv = process.argv.slice(2);

function printResults(results, cwd) {
  let failed = false;
  for (const { file, errors = [], warnings = [] } of results) {
    const where = typeof file === "string" ? relative(cwd, file) || file : file;
    for (const err of errors) {
      failed = true;
      console.error(`✖ ${where}: ${err}`);
    }
    // Advisory docs-standard findings: reported, never fatal.
    for (const warn of warnings) console.error(`⚠ ${where}: ${warn}`);
  }
  return failed;
}

async function engineMode(args) {
  const files = args.filter((f) => f.endsWith(".md"));
  const pkgDirs = [...new Set(files.map((f) => findEnginePackageFor(resolve(f))).filter(Boolean))];

  let failed = false;
  for (const dir of pkgDirs) {
    failed = printResults(await validateEnginePackage(dir), process.cwd()) || failed;
  }
  if (failed) {
    console.error("\nkhai-tests: conformance check failed.");
    process.exit(1);
  }
  console.log(`khai-tests: ${pkgDirs.length} package(s) conform.`);
}

/** Read installed engine manifests for the banner (mirrors validateProject's discovery). */
function installedEngines(root) {
  const scopeDir = join(root, "node_modules", "@chbrain");
  if (!existsSync(scopeDir)) return [];
  return readdirSync(scopeDir)
    .map((name) => join(scopeDir, name, "package.json"))
    .filter((p) => existsSync(p))
    .map((p) => JSON.parse(readFileSync(p, "utf8")).khai)
    .filter((khai) => khai && khai.engine);
}

function projectMode(args) {
  const idx = args.indexOf("--project");
  const dirArg = args[idx + 1] && !args[idx + 1].startsWith("--") ? args[idx + 1] : ".";
  const root = resolve(dirArg);

  const engines = installedEngines(root);
  const reqs = wiringRequirements(engines);
  if (engines.length)
    console.log(
      `khai-tests: ${engines.length} engine(s) installed: ${engines.map((e) => e.engine).join(", ")}` +
        (reqs.length ? ` (${reqs.length} wiring requirement(s))` : ""),
    );
  else console.log("khai-tests: no @chbrain engines installed; checking canon conformance only.");

  const results = validateProject({ root });
  if (printResults(results, root)) {
    console.error(`\nkhai-tests: ${results.length} instance file(s) failed.`);
    process.exit(1);
  }
  console.log("khai-tests: all instance files conform.");
}

if (argv.includes("--project")) projectMode(argv);
else await engineMode(argv);
