#!/usr/bin/env node
// KHAI-Guard CLI. Resolves a diff range, classifies the changed paths,
// and exits non-zero if a PR mixes source with tests.
//
//   CI:     khai-guard --base <sha> --head <sha>
//   local:  khai-guard            (diffs HEAD against origin/<default>)
//
// Config: ./khai-guard.config.json in the repo root, override-only;
// falls back to the package defaults.

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { classify, resolveConfig, parseNameStatus, DEFAULT_CONFIG } from "../index.mjs";

function flag(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function loadConfig() {
  const path = resolve(process.cwd(), "khai-guard.config.json");
  if (!existsSync(path)) return DEFAULT_CONFIG;
  try {
    return resolveConfig(JSON.parse(readFileSync(path, "utf8")));
  } catch (err) {
    console.error(`KHAI-Guard: cannot read khai-guard.config.json — ${err.message}`);
    process.exit(2);
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
    raw = git(["diff", "--name-status", "-M", base, head]);
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

const { source, test, mixed } = classify(changed, config);

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
