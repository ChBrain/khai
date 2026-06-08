#!/usr/bin/env node
// khai-tests CLI. Two modes, one rule-set:
//
//   khai-tests <file.md> ...        engine mode (pre-commit): validate each
//                                   affected engine *package* against the canon.
//   khai-tests --project [dir]      project mode (downstream): validate every
//                                   instance file in a consuming repo against
//                                   the canon AND the wiring requirements of the
//                                   engines it has installed.
//   khai-tests pack <engine-dir>    package a conforming engine as a portable
//                                   zip (the engine kind of the serve engine).
//
// Both share the same validators as the test suite — the CLI is just a caller.

import {
  validateEnginePackage,
  findEnginePackageFor,
  validateProject,
  wiringRequirements,
  readJsonOr,
} from "./validate.mjs";
import { packEngine } from "./pack.mjs";
import { buildRegistry, verifyRegistry } from "./registry.mjs";
import { resolve, relative } from "node:path";
import { existsSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const argv = process.argv.slice(2);

function printResults(results, cwd) {
  let failed = false;
  for (const { file, errors = [], warnings = [], audit = [] } of results) {
    const where = typeof file === "string" ? relative(cwd, file) || file : file;
    for (const err of errors) {
      failed = true;
      console.error(`✖ ${where}: ${err}`);
    }
    // Advisory: reported, never fatal. `warn` nudges; `audit` just notes.
    for (const warn of warnings) console.error(`⚠ ${where}: ${warn}`);
    for (const note of audit) console.error(`· ${where}: ${note}`);
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
  return (
    readdirSync(scopeDir)
      .map((name) => join(scopeDir, name, "package.json"))
      .filter((p) => existsSync(p))
      // A malformed installed package.json is skipped, not fatal to the banner.
      .map((p) => readJsonOr(p)?.khai)
      .filter((khai) => khai && khai.engine)
  );
}

function projectMode(args) {
  const idx = args.indexOf("--project");
  const dirArg = args[idx + 1] && !args[idx + 1].startsWith("--") ? args[idx + 1] : ".";
  const root = resolve(dirArg);
  if (!existsSync(root)) {
    console.error(`khai-tests: --project path not found: ${root}`);
    process.exit(2);
  }

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

// `pack <engine-dir> [--out <dir>]`: package a conforming engine into a zip.
async function packMode(args) {
  const dir = args[1] && !args[1].startsWith("--") ? resolve(args[1]) : null;
  if (!dir) {
    console.error("khai-tests pack <engine-dir> [--out <dir>]");
    process.exit(2);
  }
  const r = await packEngine(dir);
  if (!r.ok) {
    for (const e of r.errors) console.error(`✖ ${r.name}: ${e}`);
    console.error("\nkhai-tests pack: engine does not conform; not packaged.");
    process.exit(1);
  }
  for (const w of r.warnings) console.error(`⚠ ${r.name}: ${w}`);
  const outIdx = args.indexOf("--out");
  if (outIdx !== -1 && (!args[outIdx + 1] || args[outIdx + 1].startsWith("--"))) {
    console.error("khai-tests pack: --out needs a directory value.");
    process.exit(2);
  }
  const outDir = outIdx !== -1 ? resolve(args[outIdx + 1]) : join(dir, "dist");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, `${r.name}.zip`), r.zip);
  console.log(
    `khai-tests pack: ${r.name}.zip (${r.files.length} files) -> ${relative(process.cwd(), join(outDir, `${r.name}.zip`))}, sha256 ${r.zipSha256.slice(0, 12)}`,
  );
}

// `registry [build|verify] [dir]`: build or verify playhouse registry.json
async function registryMode(args) {
  const sub = args[1];
  const dirArg = args[2] && !args[2].startsWith("--") ? args[2] : ".";
  const root = resolve(dirArg);

  if (sub === "build") {
    try {
      buildRegistry(root);
      console.log(`khai-tests registry build: successfully updated registry.json at ${root}`);
    } catch (err) {
      console.error(`✖ registry build failed: ${err.message}`);
      process.exit(1);
    }
  } else if (sub === "verify") {
    const res = verifyRegistry(root);
    if (!res.ok) {
      for (const err of res.errors) {
        console.error(`✖ registry.json: ${err}`);
      }
      console.error(`\nkhai-tests registry verify failed.`);
      process.exit(1);
    }
    console.log(`khai-tests registry verify: registry.json at ${root} conforms.`);
  } else {
    console.error("khai-tests registry [build|verify] [dir]");
    process.exit(2);
  }
}

if (argv[0] === "pack") await packMode(argv);
else if (argv[0] === "registry") await registryMode(argv);
else if (argv.includes("--project")) projectMode(argv);
else await engineMode(argv);
