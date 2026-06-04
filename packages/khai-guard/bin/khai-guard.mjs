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
//
// Subcommand: `khai-guard bump-check` flags a non-patch release. It reads the
// .changeset/ dir and, if any changeset declares minor/major (beyond the
// configured freeLevel), prints a LOUD banner and emits the level so CI can
// stamp a label. Advisory by default (exit 0); pass `--enforce` to exit 1.
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
  checkLicenses,
  resolveConfig,
  parseNameStatus,
  DEFAULT_CONFIG,
  ConfigError,
} from "../index.mjs";
import picomatch from "picomatch";

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
  const topic = process.argv[3];
  if (!topic || !/^[a-z0-9][a-z0-9-]*$/.test(topic)) {
    console.error("KHAI-Guard: `branch <topic>` needs a kebab-case change name (e.g. add-axis).");
    process.exit(2);
  }
  let files;
  try {
    const tracked = git(["diff", "--name-only", "HEAD"]).split("\n");
    const untracked = git(["ls-files", "--others", "--exclude-standard"]).split("\n");
    files = [...new Set([...tracked, ...untracked].map((s) => s.trim()).filter(Boolean))];
  } catch (err) {
    console.error(`KHAI-Guard branch: could not read working-tree changes — ${err.message}`);
    process.exit(2);
  }
  if (files.length === 0) {
    console.error("KHAI-Guard branch: no uncommitted changes to put on a branch.");
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
  try {
    git(["checkout", "-b", name]);
  } catch (err) {
    console.error(`KHAI-Guard branch: \`git checkout -b ${name}\` failed — ${err.message}`);
    process.exit(2);
  }
  console.log(
    `KHAI-Guard branch: on "${name}" (${files.length} file(s)). Commit + push; branch-check will pass.`,
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
  let tracked;
  try {
    tracked = git(["ls-files"])
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (err) {
    console.error(`KHAI-Guard license-check: could not list tracked files — ${err.message}`);
    process.exit(2);
  }
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
      console.error(`KHAI-Guard license-check: cannot read ${f} — ${err.message}`);
      process.exit(2);
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

// argv[2] is the first positional. `khai-guard --base …` leaves it as a flag,
// which falls through to the gate; only an explicit subcommand diverts.
if (process.argv[2] === "doctor") runDoctor();
else if (process.argv[2] === "branch-check") runBranchCheck();
else if (process.argv[2] === "advise") runAdvise();
else if (process.argv[2] === "bump-check") runBumpCheck();
else if (process.argv[2] === "branch") runBranch();
else if (process.argv[2] === "license-check") runLicenseCheck();
else runGate();
