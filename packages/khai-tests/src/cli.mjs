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
  validateProductionPackage,
  PRODUCTION_CLASS,
  findEnginePackageFor,
  validateProject,
  wiringRequirements,
  readJsonOr,
} from "./validate.mjs";
import { packEngine } from "./pack.mjs";
import { buildRegistry, verifyRegistry } from "./registry.mjs";
import { buildScienceIndex, verifyScienceIndex, SCIENCE_INDEX_PATH } from "./science.mjs";
import {
  findOverlaps,
  pairsOf,
  checkCandidate,
  scanSurname,
  findUnresolvedNamesakes,
} from "./overlap.mjs";
import { checkManagement } from "./management.mjs";
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
    // Which validator a package gets is the manifest's call, not the caller's:
    // a production (khai.class "house") is one play published on its own and has
    // no WIRES card, no members tree and no compose(), so routing it through the
    // engine validator would report four findings that are all the same finding,
    // "this is not an engine". Computed from the class, so the same pre-commit
    // hook serves an engine repo and a house that publishes its productions.
    const khai = readJsonOr(join(dir, "package.json"))?.khai;
    const results =
      khai?.class === PRODUCTION_CLASS
        ? validateProductionPackage(dir)
        : await validateEnginePackage(dir);
    failed = printResults(results, process.cwd()) || failed;
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

// `science [build|verify|overlap|check|surname|namesakes] [...] [dir]`:
// build or drift-check the science index, and run the cross-unit keying
// instruments (src/overlap.mjs) that answer off the same collector.
async function scienceMode(args) {
  const sub = args[1];
  // `check` and `surname` take a positional argument before the optional dir.
  const positional = sub === "check" || sub === "surname" ? args[2] : undefined;
  const dirIdx = positional === undefined ? 2 : 3;
  const dirArg = args[dirIdx] && !args[dirIdx].startsWith("--") ? args[dirIdx] : ".";
  const root = resolve(dirArg);

  if (sub === "overlap") {
    let overlaps;
    try {
      overlaps = findOverlaps(root);
    } catch (err) {
      console.error(`✖ science overlap failed: ${err.message}`);
      process.exit(1);
    }
    if (args.includes("--json")) {
      console.log(JSON.stringify({ overlaps, pairs: pairsOf(overlaps) }, null, 2));
    } else {
      console.log(`science overlap: ${overlaps.length} work(s) shared across units`);
      for (const p of pairsOf(overlaps)) {
        console.log(`  [${p.stems.length}] ${p.pair}`);
        for (const s of p.stems) console.log(`        ${s}`);
      }
    }
    process.exit(overlaps.length ? 1 : 0);
  } else if (sub === "check") {
    if (!positional) {
      console.error('khai-tests science check "<Scholar> :: <Key Work>" [dir]');
      process.exit(2);
    }
    const hits = checkCandidate(root, positional);
    if (!hits.length) console.log("clear: no unit cites this work.");
    for (const h of hits)
      console.log(
        `${h.canon ? "canon   " : h.role === "spine" ? "SPINE   " : h.role.padEnd(8)}  ${h.unit}  <- ${h.scholar}: ${h.work}` +
          (h.match === "prefix" ? "\n            (loose match: read the cell and judge it)" : ""),
      );
    process.exit(0);
  } else if (sub === "surname") {
    if (!positional) {
      console.error("khai-tests science surname <Surname> [dir]");
      process.exit(2);
    }
    const keys = scanSurname(root, positional);
    if (!keys.length) {
      console.log(`clear: no index key is the surname "${positional}", bare or resolved.`);
      process.exit(0);
    }
    console.log(
      `taken: ${keys.length} index key(s) carry the surname "${positional}". ` +
        `A hit is a cell to read, not a verdict: same person on another work is expected.`,
    );
    for (const k of keys) {
      console.log(`  ${k.key}${k.resolved ? "" : "  (bare)"}`);
      for (const r of k.rows) console.log(`      ${r.unit}  <- ${r.source}: ${r.work}`);
    }
    process.exit(0);
  } else if (sub === "namesakes") {
    let loose;
    try {
      loose = findUnresolvedNamesakes(root);
    } catch (err) {
      console.error(`✖ science namesakes failed: ${err.message}`);
      process.exit(1);
    }
    console.log(`science namesakes: ${loose.length} declared surname occurrence(s) unresolved.`);
    for (const r of loose)
      console.log(
        `  ${r.scholar}  <- ${r.unit}\n     declared: ${r.forms.join(", ")}\n     cited as: ${r.source}`,
      );
    process.exit(loose.length ? 1 : 0);
  } else if (sub === "build") {
    try {
      buildScienceIndex(root);
      console.log(
        `khai-tests science build: successfully updated ${SCIENCE_INDEX_PATH} at ${root}`,
      );
    } catch (err) {
      console.error(`✖ science build failed: ${err.message}`);
      process.exit(1);
    }
  } else if (sub === "verify") {
    let errors;
    try {
      errors = verifyScienceIndex(root);
    } catch (err) {
      console.error(`✖ science verify failed: ${err.message}`);
      process.exit(1);
    }
    if (errors.length) {
      for (const err of errors) console.error(`✖ ${SCIENCE_INDEX_PATH}: ${err}`);
      console.error(`\nkhai-tests science verify failed.`);
      process.exit(1);
    }
    console.log(`khai-tests science verify: ${SCIENCE_INDEX_PATH} at ${root} conforms.`);
  } else {
    console.error(
      "khai-tests science [build|verify|overlap|namesakes] [dir]\n" +
        'khai-tests science check "<Scholar> :: <Key Work>" [dir]\n' +
        "khai-tests science surname <Surname> [dir]",
    );
    process.exit(2);
  }
}

// `management check [dir]` holds a house's management to the live blueprint core
// (read from the installed @chbrain/khai-stage).
function managementMode(args) {
  if (args[1] !== "check") {
    console.error("khai-tests management check [dir]");
    process.exit(2);
  }
  const dirArg = args[2] && !args[2].startsWith("--") ? args[2] : ".";
  const errors = checkManagement(resolve(dirArg));
  if (errors.length) {
    for (const e of errors) console.error(`✖ ${e}`);
    console.error(
      "\nkhai-tests management check: management has drifted from the shared blueprint core.",
    );
    process.exit(1);
  }
  console.log(
    "khai-tests management check: management conforms to the shared blueprint core (overlay-only).",
  );
}

if (argv[0] === "pack") await packMode(argv);
else if (argv[0] === "registry") await registryMode(argv);
else if (argv[0] === "science") await scienceMode(argv);
else if (argv[0] === "management") managementMode(argv);
else if (argv.includes("--project")) projectMode(argv);
else await engineMode(argv);
