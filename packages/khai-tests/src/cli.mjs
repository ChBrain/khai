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
import {
  buildScienceIndex,
  verifyScienceIndex,
  SCIENCE_INDEX_PATH,
  scholarPolicy,
} from "./science.mjs";
import {
  findOverlaps,
  pairsOf,
  checkCandidate,
  scanSurname,
  findUnresolvedNamesakes,
  collectUnits,
  loadWorkPolicy,
} from "./overlap.mjs";
import {
  findShadowedForms,
  findSuffixKeys,
  axesOf,
  findMalformedAxes,
  findOpposed,
  undeclaredNamesakes,
  mixedCells,
  compoundWorks,
} from "./science-walls.mjs";
import { checkManagement } from "./management.mjs";
import { collectInstructions, renderInstructions } from "./instructions.mjs";
import { loadGates, runGates, renderGates, gateLine } from "./gates.mjs";
import { verifyGatesAgainstCi, renderCiCheck } from "./ci.mjs";
import { verifyRelease, renderRelease } from "./release.mjs";
import { packedFilesAny, checkRegistryPacking, renderRegistryPacking } from "./packing.mjs";

import {
  resolveHouse,
  touchedUnits,
  isolationErrors,
  loadIsolationPolicy,
  filenameErrors,
} from "./house.mjs";
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

// `science [build|verify|overlap|check|surname|namesakes|forms|suffixes|opposed|probe] [...] [dir]`:
// build or drift-check the science index, run the cross-unit keying
// instruments (src/overlap.mjs) that answer off the same collector, and run
// the walls/probes on the index's OWN key computation (src/science-walls.mjs):
// forms and suffixes are walls over the keying itself; opposed is the
// axis/opposition wall; probe runs the three read-only instruments (an
// undeclared namesake, a mixed-cell reading list, a hidden compound work) and
// always exits 0.
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
  } else if (sub === "forms") {
    const policy = scholarPolicy(root);
    const shadowed = findShadowedForms(policy);
    console.log(
      `science forms: ${Object.keys(policy.homonyms ?? {}).length} declared surname(s); ` +
        `${shadowed.length} shadowed form(s).`,
    );
    for (const s of shadowed)
      console.log(
        `  ${s.surname} (${s.form}) is listed after "${s.shadowedBy}", which reads as ` +
          `first-match order.\n     move "${s.form}" before "${s.shadowedBy}" (longest form first).`,
      );
    process.exit(shadowed.length ? 1 : 0);
  } else if (sub === "suffixes") {
    const { records } = collectUnits(root);
    const bad = findSuffixKeys(records);
    console.log(`science suffixes: ${bad.length} index key(s) are a generational suffix.`);
    for (const b of bad)
      console.log(
        `  "${b.key}"  <- ${b.unit}: ${b.work}\n` +
          "     the Source cell names a suffix and no person; drop the suffix and add the name.",
      );
    process.exit(bad.length ? 1 : 0);
  } else if (sub === "opposed") {
    const axes = axesOf(root);
    const malformed = findMalformedAxes(axes);
    const opposed = findOpposed(axes);
    console.log(
      `science opposed: ${axes.length} unit(s) declare an axis; ${malformed.length} malformed, ` +
        `${opposed.length} opposed pair(s) not naming each other.`,
    );
    for (const m of malformed) console.log(`  MALFORMED  ${m}`);
    for (const o of opposed) {
      const missing = [
        !o.aNamesB ? `${o.a} does not name ${o.b}` : null,
        !o.bNamesA ? `${o.b} does not name ${o.a}` : null,
      ]
        .filter(Boolean)
        .join("; ");
      console.log(`  [${o.axis}]  ${o.a} vs ${o.b}  (${missing})`);
    }
    process.exit(malformed.length || opposed.length ? 1 : 0);
  } else if (sub === "probe") {
    const policy = scholarPolicy(root);
    const workPolicy = loadWorkPolicy(root);
    const { records } = collectUnits(root);

    const undeclared = undeclaredNamesakes(records, policy);
    console.log(
      `science probe: ${undeclared.length} undeclared surname(s) whose own cells name ` +
        "more than one person.",
    );
    for (const f of undeclared) {
      console.log(`  UNDECLARED  ${f.surname} names ${f.people.length} people.`);
      for (const p of f.people)
        console.log(
          `     ${p.given} ${f.surname}: ${[...new Set(p.rows.map((r) => r.unit))].join(", ")}`,
        );
    }

    const mixed = mixedCells(records, policy);
    console.log(
      `\nscience probe: ${mixed.length} undeclared surname(s) mixing a named cell with a bare one.`,
    );
    for (const f of mixed)
      console.log(
        `  MIXED  ${f.surname}: named [${f.named.join(" / ")}]  bare in ${f.bare.join(", ")}`,
      );

    const compound = compoundWorks(root, workPolicy);
    const open = compound.filter((f) => !f.canon && !f.contrast && !f.supporting);
    console.log(
      `\nscience probe: ${compound.length} hidden work(s) behind a semicolon collide with ` +
        `an indexed work; ${open.length} carry no exemption.`,
    );
    for (const f of compound) {
      const why = f.canon
        ? " [canon: exempt]"
        : f.contrast
          ? " [contrast: exempt]"
          : f.supporting
            ? " [background: exempt]"
            : "";
      console.log(
        `  COMPOUND  ${f.unit}${why}\n     hidden after the semicolon: ${f.hidden}\n` +
          `     already indexed to: ${f.holders.join(", ")}`,
      );
    }
    process.exit(0);
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
      // The errors name the index themselves (and now run to several lines),
      // so re-prefixing the path here printed it twice on one line.
      for (const err of errors) console.error(`✖ ${err}`);
      console.error(`\nkhai-tests science verify failed.`);
      process.exit(1);
    }
    console.log(`khai-tests science verify: ${SCIENCE_INDEX_PATH} at ${root} conforms.`);
  } else {
    console.error(
      "khai-tests science [build|verify|overlap|namesakes|forms|suffixes|opposed|probe] [dir]\n" +
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

// `house check [dir] [--base <sha> --head <sha>] [--name <package>]`:
// isolation and filenames over a house resolved by resolveHouse, in either
// layout.
//
// Isolation runs only when the house declares `isolationPolicy` in its
// khai-guard.config.json (loadIsolationPolicy) -- a house with a real cross-unit
// idiom (one unit's position cited by name from another) is red on every such
// link until it writes down what `allow` means, and a wall red on content a
// house wrote on purpose is not yet a wall. Filenames carry no such idiom (an
// accented filename is never deliberate) and always run.
//
// `--base`/`--head` scope both walls to what the diff range AUTHORED
// (touchedUnits), so a pull request pays for the unit it wrote in and not for
// the rest of the house; omit them to check the whole house. `--name` picks
// one declaring package when a workspace holds more than one (resolveHouse's
// `{ name }`).
async function houseMode(args) {
  if (args[1] !== "check") {
    console.error("khai-tests house check [dir] [--base <sha> --head <sha>] [--name <package>]");
    process.exit(2);
  }
  const dirArg = args[2] && !args[2].startsWith("--") ? args[2] : ".";
  const root = resolve(dirArg);
  const baseIdx = args.indexOf("--base");
  const headIdx = args.indexOf("--head");
  const nameIdx = args.indexOf("--name");
  const base = baseIdx !== -1 ? args[baseIdx + 1] : null;
  const head = headIdx !== -1 ? args[headIdx + 1] : null;
  const name = nameIdx !== -1 ? args[nameIdx + 1] : undefined;

  let house;
  try {
    house = resolveHouse(root, { name });
  } catch (err) {
    console.error(`✖ ${err.message}`);
    process.exit(1);
  }
  console.log(
    `khai-tests house: ${house.name ?? "(unnamed)"} at ${relative(process.cwd(), house.packageDir) || "."}\n` +
      `  collection: ${house.collection.key} (${relative(process.cwd(), house.contentDir) || house.collection.dir})\n` +
      `  productions: ${house.productions.length}`,
  );

  let scope = null;
  if (base && head) {
    const authored = touchedUnits(house, { base, head })
      .filter((u) => u.authored)
      .map((u) => u.id);
    scope = new Set(authored);
    console.log(`  authored by ${base}..${head}: ${authored.length} unit(s)`);
  }
  const inScope = (findings, unitOf) =>
    scope ? findings.filter((f) => scope.has(unitOf(f))) : findings;

  let failed = false;

  const policy = loadIsolationPolicy(root);
  if (!policy.declared) {
    console.log("  isolation: not declared (isolationPolicy absent), skipped");
  } else {
    const isolation = inScope(isolationErrors(house, { allow: policy.allow }), (f) => f.unit);
    if (isolation.length) {
      failed = true;
      console.error(`✖ isolation: ${isolation.length} link(s) escape their unit`);
      for (const f of isolation) console.error(`    ${f.message}`);
    } else {
      console.log(`  isolation: clean (allow: ${policy.allow.length})`);
    }
  }

  const filenames = inScope(filenameErrors(house), (f) => f.unit);
  if (filenames.length) {
    failed = true;
    console.error(`✖ filenames: ${filenames.length} non-ASCII path component(s)`);
    for (const f of filenames) console.error(`    ${f.file}`);
  } else {
    console.log(`  filenames: clean`);
  }

  if (failed) process.exit(1);
}

// `instructions [--root .]` collects the Playwright guide of every khai content
// package the root DECLARES, deepest dependency first. The closure is the point:
// a repository gets the packages it installs, never a global list.
//
// Two layers, because five chapters times a large closure is a context bomb: the
// default carries each package's one-line law, and the chapters come only for the
// packages asked for (`--package <name>`, repeatable) or for all of them
// (`--full`). `--law` executes each entry point to read its exported `law`, so
// running dependency code stays the caller's choice.
async function instructionsMode(args) {
  const flagOf = (name) => {
    const i = args.indexOf(name);
    return i !== -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : null;
  };
  const only = args.reduce((acc, a, i) => {
    if (a === "--package" && args[i + 1] && !args[i + 1].startsWith("--")) acc.push(args[i + 1]);
    return acc;
  }, []);
  const root = resolve(flagOf("--root") ?? ".");
  if (!existsSync(root)) {
    console.error(`khai-tests instructions: path not found: ${root}`);
    process.exit(2);
  }
  const records = await collectInstructions(root, {
    full: args.includes("--full"),
    only: only.length ? only : null,
    withLaw: args.includes("--law") || args.includes("--full"),
  });
  if (args.includes("--json")) console.log(JSON.stringify(records, null, 2));
  else console.log(renderInstructions(records));
}

// `gates [dir] [--content-root <path>] [--quiet]` runs every wall the house
// declares in the `gates` key of its khai-guard.config.json, in one pass with one
// exit code and a block built to be pasted into a pull request. The manifest is
// the house's, so the kit ships no list of walls and no house hand-maintains a
// runner: two implementations of one rule is two things to get wrong.
//
// `--content-root` is where this house keeps its content, repeatable, and it is
// what the visibility check reads: the default is this workspace's `packages/`,
// and a house that keeps its productions elsewhere (khai-misfits keeps them in
// `misfits/`) must say so or the check goes green on it forever.
// `gates verify-ci [dir]` holds the declared `gates` array against the CI
// workflow's own job ids -- see ci.mjs for why this is a separate wall from
// running the gates themselves: a manifest that quietly falls behind ci.yml
// passes every run of `npm run gates` right up until the day CI runs a job
// nothing local ever checked.
function gatesVerifyCiMode(args) {
  const dirArg = args[2] && !args[2].startsWith("--") ? args[2] : ".";
  const root = resolve(dirArg);
  if (!existsSync(root)) {
    console.error(`khai-tests gates verify-ci: path not found: ${root}`);
    process.exit(2);
  }
  const findings = verifyGatesAgainstCi(root);
  console.log(renderCiCheck(findings));
  process.exit(findings.length ? 1 : 0);
}

function gatesMode(args) {
  if (args[1] === "verify-ci") return gatesVerifyCiMode(args);
  const dirArg = args[1] && !args[1].startsWith("--") ? args[1] : ".";
  const root = resolve(dirArg);
  if (!existsSync(root)) {
    console.error(`khai-tests gates: path not found: ${root}`);
    process.exit(2);
  }
  const contentRoots = args.reduce((acc, a, i) => {
    if (a === "--content-root" && args[i + 1] && !args[i + 1].startsWith("--"))
      acc.push(args[i + 1]);
    return acc;
  }, []);
  // Progress, not a second summary: a pass runs for minutes and a reader with no
  // line until the end cannot tell a slow wall from a hung one. The line is the
  // module's own, so the ticker and the block can never say different things.
  const quiet = args.includes("--quiet");
  const run = runGates(root, {
    gates: loadGates(root),
    ...(contentRoots.length ? { contentRoots } : {}),
    onRecord: quiet ? undefined : (r) => console.log(gateLine(r)),
  });
  console.log(`\n${renderGates(run.results)}`);
  process.exit(run.ok ? 0 : 1);
}

// `release verify [dir]` pins the release workflow to the inputs
// changesets/action v2 actually reads. See release.mjs for the outage this
// wall stands against: the visible steps of the job all pass under the wrong
// input names, and the only symptom is that a release never appears.
function releaseMode(args) {
  const sub = args[1];
  const dirArg = args[2] && !args[2].startsWith("--") ? args[2] : ".";
  const root = resolve(dirArg);
  if (sub !== "verify") {
    console.error("khai-tests release verify [dir]");
    process.exit(2);
  }
  if (!existsSync(root)) {
    console.error(`khai-tests release verify: path not found: ${root}`);
    process.exit(2);
  }
  const findings = verifyRelease(root);
  console.log(renderRelease(findings));
  process.exit(findings.length ? 1 : 0);
}

// `packing verify [dir]` holds registry.json's promise against the tarball and
// checks governance never ships -- distinct from `pack`, which packages one
// conforming engine into a zip and is unaffected by this.
async function packingMode(args) {
  const sub = args[1];
  const dirArg = args[2] && !args[2].startsWith("--") ? args[2] : ".";
  const root = resolve(dirArg);
  if (sub !== "verify") {
    console.error("khai-tests packing verify [dir]");
    process.exit(2);
  }
  if (!existsSync(root)) {
    console.error(`khai-tests packing verify: path not found: ${root}`);
    process.exit(2);
  }
  let packed;
  try {
    packed = packedFilesAny(root);
  } catch (err) {
    console.error(`✖ packing verify failed: ${err.message}`);
    process.exit(1);
  }
  const findings = checkRegistryPacking(root, packed);
  console.log(renderRegistryPacking(findings));
  process.exit(findings.length ? 1 : 0);
}

if (argv[0] === "instructions") await instructionsMode(argv);
else if (argv[0] === "house") await houseMode(argv);
else if (argv[0] === "gates") gatesMode(argv);
else if (argv[0] === "pack") await packMode(argv);
else if (argv[0] === "packing") await packingMode(argv);
else if (argv[0] === "registry") await registryMode(argv);
else if (argv[0] === "science") await scienceMode(argv);
else if (argv[0] === "management") managementMode(argv);
else if (argv[0] === "release") releaseMode(argv);
else if (argv.includes("--project")) projectMode(argv);
else await engineMode(argv);
