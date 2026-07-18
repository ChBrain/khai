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
// Subcommand: `khai-guard branch-check` enforces the branch-scope rule — the
// current branch's NAME must classify into a lane, and its diff-range paths
// must all be in that lane. Advisory-first: pass `--warn` (or set
// KHAI_GUARD_BRANCH_ADVISORY=1) to print violations but still exit 0 while the
// live branches are renamed.
//
// Subcommand: `khai-guard advise --files <paths...>` prints the correct
// branch(es) for a set of changed paths, including the ordered split when the
// set spans lanes.
//
// Subcommand: `khai-guard branch <topic>` reads the working-tree changes,
// resolves their lane, and CREATES the correctly-named branch (or refuses a
// multi-lane change with the split). The lane is computed, never chosen — run
// this instead of picking a branch name by hand.
// Flags:
//   --staged-only, -s   only read staged changes
//   --tracked-only, -t  only read tracked changes (ignore untracked files)
//
// Subcommand: `khai-guard bump-check` flags a non-patch release. It reads the
// .changeset/ dir and, if any changeset declares minor/major (beyond the
// configured freeLevel), prints a LOUD banner and emits the level so CI can
// stamp a label. Advisory by default (exit 0); pass `--enforce` to exit 1.
//
// Subcommand: `khai-guard lockfile-check` enforces the lockfile-scope rule — in
// an npm-workspaces monorepo the root package-lock.json is the only
// authoritative lock, so a lockfile committed inside a package (a fossil that
// desyncs Dependabot and CI) is rejected. Scans the tracked tree, exits 1 on a
// nested lockfile.
//
// Exit 0 = clean, 1 = source/test mixed (or branch-scope violation in
// enforce mode), 2 = config/usage error.

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync, appendFileSync } from "node:fs";
import { resolve, join } from "node:path";
import {
  classify,
  classifyBranch,
  checkBranchScope,
  advise,
  parseChangeset,
  bumpScope,
  changesetCheck,
  checkLicenses,
  checkLockfiles,
  checkMembers,
  deadExemptions,
  resolveConfig,
  parseNameStatus,
  parseChanges,
  DEFAULT_CONFIG,
  ConfigError,
} from "../index.mjs";
import picomatch from "picomatch";

// 0. Pre-commit hook compliance check.
// If the template pre-commit hook is defined but active hooks are not installed
// (meaning 'npm install' wasn't run), fail immediately with a non-zero exit code.
const projectRoot = process.cwd();
const templateHook = resolve(projectRoot, ".husky/pre-commit");
const activeHook = resolve(projectRoot, ".husky/_/pre-commit");

if (existsSync(templateHook) && !existsSync(activeHook)) {
  console.error("::error::KHAI-Guard: pre-commit hooks are not installed.");
  console.error("");
  console.error("  Error: The active hook file (.husky/_/pre-commit) is missing.");
  console.error(
    "  Fix: Please run 'npm install' to configure and activate the required repository hooks.",
  );
  console.error("");
  process.exit(1);
}

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

// Collect every token after `name` up to the next `--flag` (or end of argv).
// `advise --files a b c` -> ["a", "b", "c"]. Empty list if the flag is absent.
function flagList(name) {
  const i = process.argv.indexOf(name);
  if (i < 0) return [];
  const out = [];
  for (let j = i + 1; j < process.argv.length; j++) {
    if (process.argv[j].startsWith("--")) break;
    out.push(process.argv[j]);
  }
  return out;
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

// List every tracked path for a whole-tree gate. `-z` (NUL-separated) is
// load-bearing: without it, core.quotePath C-quotes any path with non-ASCII or
// special characters (`"packages/caf\303\251/x"`), and the surrounding quotes
// make the basename miss every name match — a lockfile in such a directory
// would silently evade the gate. NUL separation delivers every path verbatim.
function listTrackedFiles(gate) {
  try {
    return git(["ls-files", "-z"]).split("\0").filter(Boolean);
  } catch (err) {
    console.error(`KHAI-Guard ${gate}: could not list tracked files — ${err.message}`);
    process.exit(2);
  }
}

// Anchor a whole-tree gate at the repo toplevel. Root position is load-bearing
// for lockfile-check (a nested lock listed from its own directory reads as the
// allowed root lock, and khai-guard.config.json only resolves from the root),
// so run from wherever the user is and re-anchor instead of silently no-oping.
function chdirRepoToplevel(gate) {
  try {
    process.chdir(git(["rev-parse", "--show-toplevel"]).trim());
  } catch (err) {
    console.error(`KHAI-Guard ${gate}: not inside a git repository — ${err.message}`);
    process.exit(2);
  }
}

// The PR/working branch name. CI must pass `--branch` (on a PR, actions/checkout
// leaves a detached HEAD, so rev-parse can't name it); the `GITHUB_HEAD_REF`
// default GitHub sets on pull_request events is the next-best source; locally we
// read the current branch. Returns undefined when the branch can't be named
// (detached HEAD with nothing to fall back on).
function resolveBranch() {
  const explicit = flag("--branch");
  if (explicit) return explicit;
  if (process.env.GITHUB_HEAD_REF) return process.env.GITHUB_HEAD_REF;
  try {
    const b = git(["rev-parse", "--abbrev-ref", "HEAD"]).trim();
    return b === "HEAD" || b.length === 0 ? undefined : b;
  } catch {
    return undefined;
  }
}

// The changesets release branch (the bot's "Version Packages" PR): its whole job
// is to CONSUME changesets and bump the version, so by construction it carries
// no changeset and adds no play. It is the release mechanism, not a shipped
// change, so the changeset-presence gate must not fire on it. The branch name is
// the changesets convention `changeset-release/<baseBranch>`, the same lane the
// branchScope config recognizes.
function isReleaseBranch(branch) {
  return typeof branch === "string" && branch.startsWith("changeset-release/");
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
    // `-z`: NUL-delimited, paths verbatim. Without it git C-quotes paths with
    // non-ASCII bytes, quotes, or tabs (and tab-splits the line), so such a
    // path would match no lane/bucket and silently pass a gate it should fail.
    raw = git(["diff", "--name-status", "-M", "-z", `${base}...${head}`]);
  } catch (err) {
    console.error(`KHAI-Guard: git diff failed — ${err.message}`);
    process.exit(2);
  }
  return parseNameStatus(raw, { exemptRenames: config.exemptRenames !== false });
}

// Like changedPaths, but keeps the status letter (A/M/D) the changeset gate
// needs to tell a new-play ADDITION from an edit. Returns null in local mode
// when no comparison base resolves (skip rather than block).
function changedRecords(config) {
  let base = flag("--base");
  const head = flag("--head") ?? "HEAD";
  if (!base) {
    const defaultRef = config.defaultRef ?? "origin/main";
    try {
      base = git(["merge-base", defaultRef, "HEAD"]).trim();
    } catch {
      return null;
    }
  }
  let raw;
  try {
    raw = git(["diff", "--name-status", "-M", "-z", `${base}...${head}`]);
  } catch (err) {
    console.error(`KHAI-Guard: git diff failed — ${err.message}`);
    process.exit(2);
  }
  return parseChanges(raw);
}

// The package's published path set: its package.json `files`, normalized to
// globs (a bare directory entry publishes recursively, so it gains a `/**`), plus
// package.json itself (always published). Empty when there is no `files` field —
// the shipped set is then unknown and the "ships nothing" rule stays off rather
// than firing falsely. Pure read; a malformed manifest resolves to empty.
function readShippedGlobs() {
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));
  } catch {
    return [];
  }
  const files = Array.isArray(pkg.files) ? pkg.files : [];
  if (files.length === 0) return [];
  const globs = ["package.json"];
  for (const f of files) {
    const e = String(f)
      .replace(/^\.?\//, "")
      .replace(/\/+$/, "");
    if (!e) continue;
    globs.push(e);
    if (!e.includes("*")) globs.push(`${e}/**`);
  }
  return globs;
}

// `changeset-check`: the changeset-presence gate. A play-count-driven house
// requires a `minor` changeset when a PR adds a new play (the Version PR is the
// deploy gate; the reconcile clamps the minor to the count and resets the patch,
// so a `patch`/empty add would drift to 0.<count>.1). Any other shipped change
// needs a changeset too, or it merges and publishes nothing. It also flags a
// releasing changeset on a PR that ships nothing (use `--empty`). Hard-fails
// (exit 1) by default; `--advisory` softens it to a warning that still exits 0.
function runChangesetCheck() {
  const config = loadConfig();

  // The bot's release branch consumes changesets, so it carries none by design;
  // exempt it rather than red every "Version Packages" PR. (Belt-and-suspenders
  // with any workflow-level `if:` skip — this makes the guard itself correct, so
  // every house is covered without each one wiring the skip into its CI.)
  const branch = resolveBranch();
  if (isReleaseBranch(branch)) {
    console.log(
      `KHAI-Guard changeset-check: "${branch}" is the changesets release branch ` +
        `(it consumes changesets); skipping.`,
    );
    process.exit(0);
  }

  const changed = changedRecords(config);
  if (changed === null) {
    console.log("KHAI-Guard changeset-check: no comparison base found; skipping (local).");
    process.exit(0);
  }
  // Evaluate only the changesets THIS PR introduces or edits, not every file on
  // disk. `main` legitimately accumulates unconsumed releasing changesets between
  // a release-carrying merge and the "Version Packages" PR that consumes them;
  // those belong to earlier PRs, not this one. Without this scoping, a leftover
  // releasing changeset on the base makes `releasing` true and blocks any
  // docs/governance PR that ships no `files` content (a false positive). Match the
  // added/modified changeset files in the diff (a rename-into parses as an add; a
  // delete is excluded — the PR is removing it, not carrying it).
  const prChangesets = new Set(
    changed.filter((c) => c.status === "A" || c.status === "M").map((c) => c.path),
  );
  const { ok, violations, addsCountDriven } = changesetCheck({
    changed,
    changesets: readChangesets().filter((c) => prChangesets.has(c.file)),
    shipped: readShippedGlobs(),
    config,
  });
  if (ok) {
    const why = addsCountDriven
      ? "PR adds new content and carries a minor changeset (the reconcile clamps the minor and resets the patch)"
      : "PR carries a changeset";
    console.log(`KHAI-Guard changeset-check OK: ${why}.`);
    process.exit(0);
  }
  const advisory = process.argv.includes("--advisory");
  const tag = advisory ? "::warning::" : "::error::";
  console.error(`${tag}KHAI-Guard changeset-check: ${violations.length} finding(s):`);
  for (const v of violations) console.error(`  - ${v}`);
  console.error("");
  process.exit(advisory ? 0 : 1);
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

// `branch-check`: the branch-scope gate. Classify the CURRENT branch by name,
// diff its range against origin/main (the same three-dot range the source/test
// gate uses), and require every changed path to be in the branch's lane.
//
// Advisory-first. While the live claude/* branches are still being renamed to
// the lane scheme, a violation must NOT block. Advisory mode is on when either
// `--warn` is passed or KHAI_GUARD_BRANCH_ADVISORY=1 is set; it prints the
// violations and exits 0. Once the branches are renamed, FLIP TO HARD-FAIL by
// removing the advisory wiring (drop --warn from .husky/pre-push and the CI
// step, unset KHAI_GUARD_BRANCH_ADVISORY) and making the CI job a *required*
// status check. Nothing in this file needs to change to enforce — enforce is
// simply "advisory off"; the exit-1 path below is already wired.
function runBranchCheck() {
  const config = loadConfig();
  const advisory =
    process.argv.includes("--warn") || process.env.KHAI_GUARD_BRANCH_ADVISORY === "1";

  // `--branch <name>` is for CI: on a PR, actions/checkout leaves a detached
  // HEAD (the merge commit), so rev-parse can't name the branch. CI passes the
  // PR head ref explicitly. Locally we read the current branch from git.
  let branch = flag("--branch");
  if (!branch) {
    try {
      branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).trim();
    } catch (err) {
      console.error(`KHAI-Guard: cannot resolve current branch — ${err.message}`);
      process.exit(2);
    }
    if (branch === "HEAD" || branch.length === 0) {
      console.log("KHAI-Guard branch-check: detached HEAD and no --branch; skipping.");
      process.exit(0);
    }
  }

  const changed = changedPaths(config);
  if (changed === null) {
    console.log("KHAI-Guard branch-check: no comparison base found; skipping (local).");
    process.exit(0);
  }

  const klass = classifyBranch(branch, config);
  const { ok, violations } = checkBranchScope(branch, changed, config);

  if (ok) {
    const where = klass ? `${klass.lane} lane (${klass.layer})` : "lane";
    console.log(
      `KHAI-Guard branch-check OK: "${branch}" is in ${where}; ` +
        `${changed.length} changed path(s) all in lane.`,
    );
    process.exit(0);
  }

  const head = advisory
    ? "::warning::KHAI-Guard branch-check (advisory): branch-scope violations:"
    : "::error::KHAI-Guard branch-check: branch-scope violations:";
  (advisory ? console.warn : console.error)(head);
  for (const v of violations) (advisory ? console.warn : console.error)(`  ${v}`);

  if (advisory) {
    console.warn("");
    console.warn("  Advisory mode: not blocking yet. Rename the branch to clear this.");
    process.exit(0);
  }
  console.error("");
  console.error("  Fix: rename the branch to its lane, or split per `khai-guard advise`.");
  process.exit(1);
}

// `advise --files <paths...>`: print the correct branch(es) for a set of paths.
// Pure advice — always exits 0 (it answers a question, it doesn't gate).
function runAdvise() {
  const config = loadConfig();
  const files = flagList("--files");
  if (files.length === 0) {
    console.error("KHAI-Guard: advise requires --files <paths...>.");
    process.exit(2);
  }
  const { lines } = advise({ files }, config);
  for (const line of lines) console.log(line);
  process.exit(0);
}

// `bump-check`: the release-scope flag. Read every changeset, and if any bump
// exceeds the free level (patch), print a loud, unmissable banner naming the
// escalation. minor/major is the maintainer's call; this guarantees it can't
// merge unnoticed. We do NOT hard-fail by default -- a hard lock is impossible
// when the bot holds the maintainer's own credentials, so the honest teeth are
// visibility: the banner in the log, a `::warning::` in the Actions UI, and the
// level handed to the workflow (GITHUB_OUTPUT) so the bot stamps a label.
// `--enforce` turns it red (exit 1) for repos that want CI to block as well.
function readChangesets() {
  const dir = resolve(process.cwd(), ".changeset");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .map((f) => ({
      file: `.changeset/${f}`,
      entries: parseChangeset(readFileSync(join(dir, f), "utf8")),
    }));
}

function runBumpCheck() {
  const config = loadConfig();
  const { ok, escalations, highest } = bumpScope(readChangesets(), config);

  if (ok) {
    console.log("KHAI-Guard bump-check OK: every changeset is patch (the free level).");
    process.exit(0);
  }

  // Loud and unmissable. A non-patch release is the maintainer's decision; the
  // banner makes it impossible to wave through by reflex.
  const label = config.bumpScope?.labels?.[highest] ?? `bump:${highest}`;
  console.log(
    `::warning title=Release scope: ${highest}::Non-patch changeset(s) detected -- ` +
      `declaring ${highest} is the maintainer's call.`,
  );
  const banner = [
    "",
    "############################################################",
    `##  RELEASE SCOPE FLAGGED:  ${highest.toUpperCase()}`,
    "##",
    "##  This PR's changesets widen the release beyond patch.",
    `##  Declaring ${highest} is the maintainer's call, not the agent's.`,
    "##",
    ...escalations.map((e) => `##    - ${e.package}: ${e.level}   (${e.file})`),
    "##",
    `##  The bot will stamp the label "${label}".`,
    "##  Merge ONLY if you intend this release scope.",
    "############################################################",
    "",
  ];
  for (const line of banner) console.log(line);

  // Hand the level + label to the workflow so the bot can stamp the PR.
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `bump_level=${highest}\nbump_label=${label}\n`);
  }

  process.exit(process.argv.includes("--enforce") ? 1 : 0);
}

// `branch <topic>`: deterministic lane selection. Reads the working-tree
// changes, resolves their lane via `advise`, and CREATES the correctly-named
// branch -- so the lane is never a judgement call. A clean single lane becomes
// `<lane>[/<unit>]/<topic>`; an unowned-only change becomes `chore/<topic>`; a
// change that spans lanes (or mixes an owned lane with unowned paths) is
// REFUSED with the split, so engine content can't silently land on a docs
// branch. The one command a weaker model should run instead of choosing a lane.
function runBranch() {
  const config = loadConfig();
  const stagedOnly = process.argv.includes("--staged-only") || process.argv.includes("-s");
  const trackedOnly = process.argv.includes("--tracked-only") || process.argv.includes("-t");

  const branchIdx = process.argv.indexOf("branch");
  const topic = process.argv.slice(branchIdx + 1).find((arg) => !arg.startsWith("-"));

  if (!topic || !/^[a-z0-9][a-z0-9-]*$/.test(topic)) {
    console.error("KHAI-Guard: `branch <topic>` needs a kebab-case change name (e.g. add-axis).");
    process.exit(2);
  }
  let files;
  try {
    if (stagedOnly) {
      files = git(["diff", "--name-only", "--cached"])
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (trackedOnly) {
      files = git(["diff", "--name-only", "HEAD"])
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      const tracked = git(["diff", "--name-only", "HEAD"]).split("\n");
      const untracked = git(["ls-files", "--others", "--exclude-standard"]).split("\n");
      files = [...new Set([...tracked, ...untracked].map((s) => s.trim()).filter(Boolean))];
    }
  } catch (err) {
    console.error(`KHAI-Guard branch: could not read working-tree changes — ${err.message}`);
    process.exit(2);
  }
  if (files.length === 0) {
    const type = stagedOnly ? "staged " : trackedOnly ? "tracked " : "uncommitted ";
    console.error(`KHAI-Guard branch: no ${type}changes to put on a branch.`);
    process.exit(2);
  }
  const { lanes, unowned, lines } = advise({ files }, config);
  let name;
  if (lanes.length === 1 && unowned.length === 0) {
    const l = lanes[0];
    name = l.unit == null ? `${l.lane}/${topic}` : `${l.lane}/${l.unit}/${topic}`;
  } else if (lanes.length === 0 && unowned.length > 0) {
    name = `chore/${topic}`; // unowned remainder: a general lane owns nothing
  } else {
    for (const line of lines) console.error(line);
    console.error(
      "\nKHAI-Guard branch: this change is not one lane — split it per the advice above " +
        "(not auto-creating a branch).",
    );
    process.exit(1);
  }
  // Defence in depth before handing the name to `git checkout -b`: the lane and
  // unit segments are derived from file paths (the unit via a path capture), so a
  // segment like "--orphan" (a legal directory name) could reach git as an option
  // rather than a branch name -- argv injection. Require every segment to be a
  // plain kebab token.
  if (!name.split("/").every((seg) => /^[a-z0-9][a-z0-9-]*$/.test(seg))) {
    console.error(
      `KHAI-Guard branch: refusing to create "${name}" — a path-derived segment is not a ` +
        "plain kebab name. Rename the offending file/dir, or create the branch by hand.",
    );
    process.exit(2);
  }
  try {
    git(["checkout", "-b", name, "--"]);
  } catch (err) {
    console.error(`KHAI-Guard branch: \`git checkout -b ${name}\` failed — ${err.message}`);
    process.exit(2);
  }
  console.log(
    `KHAI-Guard branch: on "${name}" (${files.length} file(s)). Commit + push; branch-check will pass.`,
  );
  console.log(
    "KHAI-Guard branch: not finished? Open the PR as a draft, and mark it ready " +
      "only when the change is whole.",
  );
}

// Pull the `license:` value out of a SKILL.md (or any) YAML frontmatter block.
// Deliberately tiny — no gray-matter dep in the guard — and unquotes a bare
// scalar. Returns null when there is no frontmatter or no license line.
function frontmatterLicense(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return null;
  const lm = /^license:\s*(.+)$/m.exec(m[1]);
  return lm ? lm[1].trim().replace(/^["']|["']$/g, "") : null;
}

// Subcommand: `khai-guard license-check` enforces the license-scope rule. Every
// package carries khai's NonCommercial concepts, so each package.json must
// declare an allowed license; every SKILL.md must declare a NonCommercial one.
// Scans the tracked tree (not a diff) like doctor, applies the licensePolicy,
// and exits 1 on a violation so the concepts can't walk free under a bare
// permissive license. No policy configured = nothing to check (exit 0).
function runLicenseCheck() {
  const config = loadConfig();
  const policy = config.licensePolicy;
  if (!policy) {
    console.log("KHAI-Guard license-check: no licensePolicy configured; nothing to check.");
    return;
  }
  const tracked = listTrackedFiles("license-check");
  const matchPkg = picomatch(policy.packages ?? [], { dot: true });
  const matchSkill = picomatch(policy.skills ?? [], { dot: true });
  const packages = [];
  const skills = [];
  for (const f of tracked) {
    try {
      if (matchPkg(f)) {
        const license = JSON.parse(readFileSync(resolve(process.cwd(), f), "utf8")).license ?? null;
        packages.push({ path: f, license });
      } else if (matchSkill(f)) {
        const license = frontmatterLicense(readFileSync(resolve(process.cwd(), f), "utf8"));
        skills.push({ path: f, license });
      }
    } catch (err) {
      // A file the policy matches but we cannot read or parse can't be shown to
      // declare an allowed license. Record it as a violation (license null) and
      // keep scanning, rather than aborting the whole gate (and masking every
      // other package's verdict) on one bad file.
      console.error(`KHAI-Guard license-check: cannot read ${f} — ${err.message}`);
      if (matchPkg(f)) packages.push({ path: f, license: null });
      else if (matchSkill(f)) skills.push({ path: f, license: null });
    }
  }
  const { ok, errors } = checkLicenses({ packages, skills }, config);
  if (!ok) {
    console.error("::error::KHAI-Guard license-check: license-scope violations:");
    for (const e of errors) console.error(`  ${e}`);
    console.error(
      "\n  Fix: declare an allowed NonCommercial license so khai concepts can't be resold.",
    );
    process.exit(1);
  }
  console.log(
    `KHAI-Guard license-check OK: ${packages.length} package(s) + ${skills.length} skill(s) conform.`,
  );
}

// Subcommand: `khai-guard lockfile-check` enforces the lockfile-scope rule. In
// an npm-workspaces monorepo the root package-lock.json is the only
// authoritative lock; a lockfile committed inside a package desyncs Dependabot
// and CI. Anchors at the repo toplevel (run from a package dir, the config
// would not resolve and a nested lock would list as the root one — a silent
// pass on the exact violation this gate polices), then scans the tracked tree
// (not a diff) like license-check and exits 1 on any nested lockfile. No
// policy configured = nothing to check (exit 0).
function runLockfileCheck() {
  chdirRepoToplevel("lockfile-check");
  const config = loadConfig();
  if (!config.lockfilePolicy) {
    console.log("KHAI-Guard lockfile-check: no lockfilePolicy configured; nothing to check.");
    return;
  }
  const tracked = listTrackedFiles("lockfile-check");
  const { ok, offenders } = checkLockfiles(tracked, config);
  if (!ok) {
    console.error("::error::KHAI-Guard lockfile-check: lockfile-scope violations:");
    for (const o of offenders) console.error(`  ${o}`);
    console.error("");
    console.error(
      "  This is an npm-workspaces monorepo: the root package-lock.json is the only\n" +
        "  authoritative lock. A nested lockfile is a fossil that desyncs Dependabot and\n" +
        "  CI. Remove it (workspaces install from the root lock); .gitignore keeps it out.",
    );
    process.exit(1);
  }
  console.log(
    `KHAI-Guard lockfile-check OK: no stray lockfiles (${tracked.length} tracked path(s) scanned).`,
  );
}

// Subcommand: `khai-guard member-check` enforces the member-scope rule. Atoms
// must not overlap: one phenomenon, one engine, so a member whose stem is
// already claimed by another engine (or that restates a whole engine's domain)
// fails the gate — the composite layer wires over the atoms and needs each
// phenomenon to have exactly one owner. Anchors at the repo toplevel, reads
// every engine manifest the policy names (members list, or the anchor +
// expressions shorthand), and exits 1 on a collision the policy's homonyms/
// grandfathered lists do not exempt. No policy configured = nothing to check
// (exit 0).
function runMemberCheck() {
  chdirRepoToplevel("member-check");
  const config = loadConfig();
  const policy = config.memberPolicy;
  if (!policy) {
    console.log("KHAI-Guard member-check: no memberPolicy configured; nothing to check.");
    return;
  }
  const tracked = listTrackedFiles("member-check");
  const matchManifest = picomatch(policy.engines ?? [], { dot: true });
  const engines = [];
  for (const f of tracked) {
    if (!matchManifest(f)) continue;
    try {
      const khai = JSON.parse(readFileSync(resolve(process.cwd(), f), "utf8")).khai;
      if (!khai || !khai.engine) continue;
      const files = Array.isArray(khai.members)
        ? khai.members.map((m) => m.file).filter(Boolean)
        : [khai.anchor, ...Object.values(khai.expressions ?? {})].filter(Boolean);
      engines.push({ path: f, engine: khai.engine, files });
    } catch (err) {
      // A manifest the policy matches but we cannot parse cannot prove its
      // members are collision-free; surface it and keep scanning rather than
      // masking every other engine's verdict on one bad file.
      console.error(`KHAI-Guard member-check: cannot read ${f} — ${err.message}`);
    }
  }
  const { ok, errors } = checkMembers(engines, config);
  const warnings = deadExemptions(engines, config);
  // The ratchet, LOUD but advisory (the bump-check precedent): a dead
  // exemption straddles two lanes, so it can only nag, never block. It nags
  // on every run until the governance-lane deletion lands.
  if (warnings?.length) {
    console.error("");
    console.error("  ════════════════════════ KHAI-GUARD RATCHET ════════════════════════");
    for (const w of warnings) {
      console.error(`  ${w}`);
      console.error(`::warning::KHAI-Guard member-check: ${w}`);
    }
    console.error("  ═════════════════════════════════════════════════════════════════════");
    console.error("");
  }
  if (!ok) {
    console.error("::error::KHAI-Guard member-check: member-scope violations:");
    for (const e of errors) console.error(`  ${e}`);
    console.error(
      "\n  Fix: one phenomenon, one owner. Thin the duplicate member to a pointer at\n" +
        "  the owning engine, or (for a same-word-different-science case) whitelist the\n" +
        "  stem under memberPolicy.homonyms in khai-guard.config.json.",
    );
    process.exit(1);
  }
  const total = engines.reduce((n, e) => n + e.files.length, 0);
  const ratchet = warnings?.length ? `; ${warnings.length} dead exemption(s) to ratchet` : "";
  console.log(
    `KHAI-Guard member-check OK: ${engines.length} engine(s), ${total} member(s), no unexempted collisions${ratchet}.`,
  );
}

// argv[2] is the first positional. `khai-guard --base …` leaves it as a flag,
// which falls through to the gate; only an explicit subcommand diverts.
if (process.argv[2] === "doctor") runDoctor();
else if (process.argv[2] === "branch-check") runBranchCheck();
else if (process.argv[2] === "advise") runAdvise();
else if (process.argv[2] === "bump-check") runBumpCheck();
else if (process.argv[2] === "changeset-check") runChangesetCheck();
else if (process.argv[2] === "branch") runBranch();
else if (process.argv[2] === "license-check") runLicenseCheck();
else if (process.argv[2] === "lockfile-check") runLockfileCheck();
else if (process.argv[2] === "member-check") runMemberCheck();
else runGate();
