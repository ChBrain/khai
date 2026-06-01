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
// Exit 0 = clean, 1 = source/test mixed, 2 = config/usage error.

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
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
