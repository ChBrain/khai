#!/usr/bin/env node
// KHAI-Guard CLI. Resolves a diff range, classifies the changed paths,
// and exits non-zero if a PR mixes source with tests.
//
//   CI:     khai-guard --base <sha> --head <sha>
//   local:  khai-guard            (diffs HEAD against origin/<default>)
//
// Config: ./khai-guard.config.json in the repo root, override-only;
// falls back to the package defaults.
//
// Subcommand: `khai-guard doctor` self-checks a repo's adoption (resolved
// config, bucket overlap on the tracked tree, CI + hook wiring) instead of
// judging a diff.
//
// Exit 0 = clean, 1 = source/test mixed, 2 = config/usage error.

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import {
  classify,
  resolveConfig,
  parseNameStatus,
  DEFAULT_CONFIG,
  ConfigError,
} from "../index.mjs";

// Return the value following `name`, but only if it looks like a value
// (not the next flag and not missing). `--base --head x` must NOT treat
// "--head" as the base SHA.
function flag(name) {
  const i = process.argv.indexOf(name);
  if (i < 0) return undefined;
  const value = process.argv[i + 1];
  if (value === undefined || value.startsWith("--")) {
    console.error(`KHAI-Guard: ${name} requires a value.`);
    process.exit(2);
  }
  return value;
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function loadConfig() {
  const path = resolve(process.cwd(), "khai-guard.config.json");
  if (!existsSync(path)) return DEFAULT_CONFIG;
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    console.error(`KHAI-Guard: cannot parse khai-guard.config.json — ${err.message}`);
    process.exit(2);
  }
  try {
    return resolveConfig(parsed);
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(`KHAI-Guard: invalid khai-guard.config.json — ${err.message}`);
      process.exit(2);
    }
    throw err;
  }
}

function changedPaths(config) {
  let base = flag("--base");
  const head = flag("--head") ?? "HEAD";
  if (!base) {
    // Local mode: compare the branch against its merge-base with the
    // default branch (the PR range). If that can't be resolved (no
    // origin, first push, shallow clone), skip rather than block.
    const defaultRef = config.defaultRef ?? "origin/main";
    try {
      base = git(["merge-base", defaultRef, "HEAD"]).trim();
    } catch {
      return null;
    }
  }
  let raw;
  try {
    // Three-dot range: merge-base(base, head)..head — exactly what THIS
    // branch changed. Two-dot (base..head) would also surface files the
    // base branch advanced past since the PR branched off, misfiring the
    // gate on any branch that has fallen behind. (In local mode `base` is
    // already the merge-base, so three-dot is a harmless no-op there.)
    raw = git(["diff", "--name-status", "-M", `${base}...${head}`]);
  } catch (err) {
    console.error(`KHAI-Guard: git diff failed — ${err.message}`);
    process.exit(2);
  }
  return parseNameStatus(raw.split("\n"), { exemptRenames: config.exemptRenames !== false });
}

// The gate: classify the PR's diff range and exit non-zero on a mix.
function runGate() {
  const config = loadConfig();
  const changed = changedPaths(config);

  if (changed === null) {
    console.log("KHAI-Guard: no comparison base found; skipping (local).");
    process.exit(0);
  }

  const { source, test, both, mixed } = classify(changed, config);

  if (both.length > 0) {
    // A path matched BOTH buckets: the config's globs overlap, so any
    // verdict here is ambiguous. Fail as a config error, not a violation.
    console.error(
      "::error::KHAI-Guard: config buckets overlap — these paths match both source and test:",
    );
    console.error(`  ${both.join("\n  ")}`);
    console.error("");
    console.error("  Fix khai-guard.config.json so source and test don't intersect.");
    process.exit(2);
  }

  if (mixed) {
    // `::error::` is a GitHub Actions annotation; harmless locally.
    console.error("::error::KHAI-Guard / source-test-split: this PR mixes source with tests.");
    console.error("");
    console.error(`  Source (the product):   ${source.join(", ")}`);
    console.error(`  Test (the verifiers):   ${test.join(", ")}`);
    console.error("");
    console.error("  Fix: split into separate PRs — tests first, source second.");
    console.error("       Rare coupled change: admin 'Merge without waiting for requirements'.");
    process.exit(1);
  }

  console.log(
    `KHAI-Guard OK: ${source.length} source / ${test.length} test path(s) changed, no mix.`,
  );
  process.exit(0);
}

// `doctor`: diagnose a repo's adoption rather than a diff. We repeatedly hit
// "the config is right but the required check is stale or the job drifted,"
// which the gate can't see — it only runs once it's wired. doctor reports what
// IS wired so a human can spot what isn't. Definite misconfigurations
// (malformed config, overlapping buckets) exit 2; everything advisory is a
// warning that prints but doesn't fail.
function runDoctor() {
  const report = [];
  const warnings = [];
  const problems = [];

  // 1. Resolved config + buckets. loadConfig already exits 2 on a malformed
  // file — a malformed config IS a definite misconfiguration.
  const usingFile = existsSync(resolve(process.cwd(), "khai-guard.config.json"));
  const config = loadConfig();
  report.push(`config source: ${usingFile ? "khai-guard.config.json" : "package defaults"}`);
  report.push(`  source: ${config.source.join(", ")}`);
  report.push(`  test:   ${config.test.join(", ")}`);
  report.push(`  exemptRenames: ${config.exemptRenames !== false}`);

  // 2. Overlap on the REAL tracked tree — reuse classify().both on the files
  // that actually exist, so we flag overlaps that bite real paths rather than
  // chasing abstract glob intersection.
  let tracked = [];
  try {
    tracked = git(["ls-files"])
      .split("\n")
      .filter((f) => f.trim());
  } catch {
    warnings.push("not a git repo (or git unavailable) — skipped the tracked-tree overlap check");
  }
  if (tracked.length > 0) {
    const { source, test, both } = classify(tracked, config);
    report.push(`tracked tree: ${source.length} source / ${test.length} test path(s)`);
    if (both.length > 0) {
      problems.push(
        `config buckets overlap — ${both.length} tracked path(s) match BOTH source and test:\n    ` +
          both.slice(0, 10).join("\n    "),
      );
    }
  }

  // 3. A CI workflow must reference khai-guard, or the gate never runs.
  const workflowsDir = resolve(process.cwd(), ".github/workflows");
  if (existsSync(workflowsDir)) {
    const ymls = readdirSync(workflowsDir).filter((f) => /\.ya?ml$/.test(f));
    let referenced = false;
    let staleGate = false;
    for (const f of ymls) {
      const text = readFileSync(join(workflowsDir, f), "utf8");
      if (text.includes("khai-guard")) referenced = true;
      if (/meta-2|META-2/.test(text)) staleGate = true;
    }
    if (referenced) report.push("ci: a workflow references khai-guard ✓");
    else
      warnings.push(
        "no .github/workflows/*.yml references khai-guard — the gate may not run in CI",
      );
    if (staleGate)
      warnings.push(
        "a workflow still mentions a META-2 / inline gate — retire it now that khai-guard is the gate",
      );
  } else {
    warnings.push("no .github/workflows directory — can't confirm the CI gate is wired");
  }

  // 4. The local pre-push hook should invoke it.
  const hook = resolve(process.cwd(), ".husky/pre-push");
  if (existsSync(hook)) {
    if (readFileSync(hook, "utf8").includes("khai-guard"))
      report.push("hook: .husky/pre-push invokes khai-guard ✓");
    else warnings.push(".husky/pre-push exists but doesn't invoke khai-guard");
  } else {
    warnings.push("no .husky/pre-push hook — contributors won't get the local pre-push check");
  }

  // 5. Branch protection is out of reach (no API/token from here). Remind a
  // human to confirm the required check still points at this job — a renamed
  // job silently stops gating while every PR shows green.
  report.push("");
  report.push("reminder: khai-guard can't read branch protection. Verify the *required*");
  report.push("  status check is named 'khai-guard' — a renamed-away job stops gating silently.");

  console.log("KHAI-Guard doctor");
  for (const line of report) console.log(line);
  if (warnings.length > 0) {
    console.warn("");
    for (const w of warnings) console.warn(`⚠ ${w}`);
  }
  if (problems.length > 0) {
    console.error("");
    for (const p of problems) console.error(`::error::KHAI-Guard doctor: ${p}`);
    process.exit(2);
  }
  console.log("");
  console.log(`healthy${warnings.length > 0 ? ` (with ${warnings.length} warning(s))` : ""}.`);
  process.exit(0);
}

// argv[2] is the first positional. `khai-guard --base …` leaves it as a flag,
// which falls through to the gate; only an explicit `doctor` diverts.
if (process.argv[2] === "doctor") runDoctor();
else runGate();
