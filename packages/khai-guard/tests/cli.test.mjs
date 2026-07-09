// Bin-level integration tests for the khai-guard CLI. The unit suite
// (classify.test.mjs) proves the pure core; this suite drives the actual
// binary end-to-end over real git repos, so the parts the core can't see —
// the three-dot diff range, the exit codes, the rename exemption wiring, and
// flag/usage handling — are locked instead of only smoke-tested by hand.
//
// Each case builds a throwaway git repo in a temp dir, makes real commits,
// runs bin/khai-guard.mjs in a child process, and asserts the exit code plus
// the operator-facing stdout/stderr.

import { describe, it, expect, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const binPath = fileURLToPath(new URL("../bin/khai-guard.mjs", import.meta.url));
const DORMANT = !readFileSync(binPath, "utf8").includes("pre-commit hooks are not installed");

// Temp repos created during a test, torn down afterEach.
let repos = [];

afterEach(() => {
  for (const dir of repos) rmSync(dir, { recursive: true, force: true });
  repos = [];
});

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" });
}

// A clean repo with deterministic identity: a fixed default branch (so
// `main` is stable across git versions) and no signing (so commits don't
// stall on a missing key in CI).
function initRepo() {
  const dir = mkdtempSync(join(tmpdir(), "khai-guard-cli-"));
  repos.push(dir);
  git(dir, ["init", "-b", "main"]);
  git(dir, ["config", "user.email", "test@example.com"]);
  git(dir, ["config", "user.name", "KHAI-Guard Test"]);
  git(dir, ["config", "commit.gpgsign", "false"]);
  return dir;
}

function write(dir, rel, content) {
  const full = join(dir, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}

function commitAll(dir, message) {
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-m", message]);
}

// Run the bin and normalize success/failure into one shape: a non-zero exit
// makes execFileSync throw, carrying status/stdout/stderr on the error.
function runGuard(cwd, args = []) {
  try {
    const stdout = execFileSync(process.execPath, [binPath, ...args], {
      cwd,
      encoding: "utf8",
    });
    return { status: 0, stdout, stderr: "" };
  } catch (err) {
    return {
      status: err.status ?? 1,
      stdout: err.stdout?.toString() ?? "",
      stderr: err.stderr?.toString() ?? "",
    };
  }
}

// Dormant until the changeset-check scoping fix lands in bin (the diff-scoped
// changeset filter). Probe bin for the fix's sentinel comment so this suite stays
// green on a main that still reads every changeset on disk; once the source lands,
// these activate. (Source/test-split: tests dormant until source.)
const DORMANT_ACCUM = !readFileSync(binPath, "utf8").includes(
  "Evaluate only the changesets THIS PR introduces",
);

// A house-shaped repo whose `main` carries an UNCONSUMED releasing changeset (the
// normal window between a release-carrying merge and its "Version Packages" PR).
function houseWithAccumulatedChangeset() {
  const dir = initRepo();
  write(
    dir,
    "package.json",
    JSON.stringify({ name: "@scope/house", version: "0.1.0", files: ["plays/**", "README.md"] }),
  );
  write(
    dir,
    "khai-guard.config.json",
    JSON.stringify({ changesetPolicy: { countDrivenAdd: ["plays/*/play_*.md"] } }),
  );
  write(dir, "README.md", "readme\n");
  write(dir, ".changeset/add-play.md", '---\n"@scope/house": minor\n---\n\nadd a play\n');
  commitAll(dir, "main: an unconsumed releasing changeset");
  return dir;
}

describe.skipIf(DORMANT_ACCUM)("khai-guard changeset-check: accumulated changesets", () => {
  it("does not block a docs PR (ships nothing, empty changeset) when main carries a leftover", () => {
    const dir = houseWithAccumulatedChangeset();
    git(dir, ["checkout", "-b", "governance/tidy-docs"]);
    write(dir, "REFERENCES.md", "docs\n");
    write(dir, ".changeset/tidy-docs.md", "---\n---\n\ndocs only\n");
    commitAll(dir, "docs + empty changeset");
    const r = runGuard(dir, [
      "changeset-check",
      "--base",
      "main",
      "--head",
      "HEAD",
      "--branch",
      "governance/tidy-docs",
    ]);
    expect(r.status).toBe(0);
  });

  it("still blocks a PR that ships nothing but adds its OWN releasing (patch) changeset", () => {
    const dir = houseWithAccumulatedChangeset();
    git(dir, ["checkout", "-b", "governance/bad-patch"]);
    write(dir, "REFERENCES.md", "docs\n");
    write(dir, ".changeset/bad.md", '---\n"@scope/house": patch\n---\n\ndrift\n');
    commitAll(dir, "docs + patch changeset");
    const r = runGuard(dir, [
      "changeset-check",
      "--base",
      "main",
      "--head",
      "HEAD",
      "--branch",
      "governance/bad-patch",
    ]);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/republish identical content and drift/);
  });
});

describe("khai-guard CLI", () => {
  it("uses a three-dot range: a stale branch isn't blamed for main's later source change", () => {
    // The regression that motivated 0.0.3. The branch only touches tests, but
    // main independently advanced a source file after the branch point. A
    // two-dot (base..head) diff would surface main's source change and falsely
    // report a mix; the three-dot range scopes the diff to what the branch
    // actually did.
    const dir = initRepo();
    write(dir, "src/app.js", "v1\n");
    commitAll(dir, "base: source");

    git(dir, ["checkout", "-b", "feature"]);
    write(dir, "tests/app.test.js", "// test\n");
    commitAll(dir, "feature: test only");

    git(dir, ["checkout", "main"]);
    write(dir, "src/app.js", "v2\n");
    commitAll(dir, "main: advance source past the branch point");

    const r = runGuard(dir, ["--base", "main", "--head", "feature"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("KHAI-Guard OK");
  });

  it("fails (exit 1) when a branch genuinely mixes source with tests", () => {
    const dir = initRepo();
    write(dir, "src/app.js", "v1\n");
    commitAll(dir, "base: source");

    git(dir, ["checkout", "-b", "feature"]);
    write(dir, "src/app.js", "v2\n");
    write(dir, "tests/app.test.js", "// test\n");
    commitAll(dir, "feature: source AND test");

    const r = runGuard(dir, ["--base", "main", "--head", "feature"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("mixes source with tests");
  });

  it("exempts a pure rename across buckets (R100) instead of counting it", () => {
    // Moving a file with byte-identical content is a pure rename (R100): it
    // changes neither product nor contract, so it's dropped — even when it
    // crosses from the source bucket into the test bucket.
    const dir = initRepo();
    write(dir, "src/mod.js", "stable contents\n");
    commitAll(dir, "base: source file");

    git(dir, ["checkout", "-b", "feature"]);
    mkdirSync(join(dir, "tests"), { recursive: true });
    git(dir, ["mv", "src/mod.js", "tests/mod.js"]);
    commitAll(dir, "feature: pure move src -> tests");

    const r = runGuard(dir, ["--base", "main", "--head", "feature"]);
    expect(r.status).toBe(0);
    // 0 source / 0 test proves the rename was dropped, not classified.
    expect(r.stdout).toContain("0 source / 0 test");
  });

  it("treats overlapping config buckets as a config error (exit 2), not a mix", () => {
    const dir = initRepo();
    write(
      dir,
      "khai-guard.config.json",
      JSON.stringify({ source: ["packages/**"], test: ["packages/**/tests/**"] }),
    );
    write(dir, "packages/x/index.js", "base\n");
    commitAll(dir, "base: config + source");

    git(dir, ["checkout", "-b", "feature"]);
    write(dir, "packages/x/tests/a.test.js", "// test\n");
    commitAll(dir, "feature: a path that matches both buckets");

    const r = runGuard(dir, ["--base", "main", "--head", "feature"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("buckets overlap");
  });

  it("rejects a flag whose value is missing (exit 2)", () => {
    const dir = initRepo();
    write(dir, "src/app.js", "v1\n");
    commitAll(dir, "base");

    // `--base --head x`: the next token is a flag, so --base has no value.
    const r = runGuard(dir, ["--base", "--head", "x"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("--base requires a value");
  });

  it("skips cleanly (exit 0) in local mode when there's no comparison base", () => {
    // No --base and no origin/main to resolve a merge-base against: skip
    // rather than block (first push, shallow clone, no remote).
    const dir = initRepo();
    write(dir, "src/app.js", "v1\n");
    commitAll(dir, "base");

    const r = runGuard(dir, []);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("skipping");
  });

  describe.skipIf(DORMANT)("pre-commit hook compliance check", () => {
    it("fails (exit 1) when pre-commit hook template exists but active hook is missing", () => {
      const dir = initRepo();
      write(dir, ".husky/pre-commit", "#!/usr/bin/env sh\nexit 0\n");
      write(dir, "src/app.js", "v1\n");
      commitAll(dir, "base");

      const r = runGuard(dir, []);
      expect(r.status).toBe(1);
      expect(r.stderr).toContain("pre-commit hooks are not installed");
    });

    it("passes cleanly when both pre-commit template and active hook exist", () => {
      const dir = initRepo();
      write(dir, ".husky/pre-commit", "#!/usr/bin/env sh\nexit 0\n");
      write(dir, ".husky/_/pre-commit", "#!/usr/bin/env sh\nexit 0\n");
      write(dir, "src/app.js", "v1\n");
      commitAll(dir, "base");

      const r = runGuard(dir, []);
      expect(r.status).toBe(0);
    });
  });
});

// license-check must not abort the whole scan on one unreadable file (PR #283).
// Dormant until the fix lands on main -- probe the bin for its comment, per the
// convention this suite already uses for the pre-commit feature above.
const LICENSE_DORMANT = !readFileSync(binPath, "utf8").includes("license: null });");

describe.skipIf(LICENSE_DORMANT)("khai-guard license-check: one bad file does not abort", () => {
  it("flags an unreadable matched file as a violation (exit 1), not a config abort (exit 2)", () => {
    const dir = initRepo();
    write(
      dir,
      "khai-guard.config.json",
      JSON.stringify({
        licensePolicy: {
          packages: ["packages/*/package.json"],
          packageLicenses: ["GOOD-LICENSE"],
        },
      }),
    );
    // A valid package and a malformed one, both matched by the policy glob.
    write(
      dir,
      "packages/good/package.json",
      JSON.stringify({ name: "good", license: "GOOD-LICENSE" }),
    );
    write(dir, "packages/bad/package.json", "{ name: bad, license: BROKEN ]");
    commitAll(dir, "init");

    const r = runGuard(dir, ["license-check"]);
    // exit 1 (violation), NOT 2 (the old abort), and the scan reached the bad file.
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/packages\/bad\/package\.json/);
    expect(r.stderr).toMatch(/cannot read/);
  });
});

// `branch` must validate the full computed name before `git checkout -b`, so a
// path-derived unit segment that looks like a flag can't be argv-injected (PR
// #304). Dormant until the fix lands -- probe the bin for the guard's message.
const VALIDATE_DORMANT = !readFileSync(binPath, "utf8").includes("refusing to create");

describe.skipIf(VALIDATE_DORMANT)("khai-guard branch: rejects an option-like computed name", () => {
  it("refuses when a path-derived unit segment looks like a flag", () => {
    const dir = initRepo();
    // An engine lane whose unit (segment 1) is captured from the file path.
    write(
      dir,
      "khai-guard.config.json",
      JSON.stringify({
        branchScope: {
          shared: [".changeset/**"],
          lanes: [
            {
              pattern: "engine/*/*",
              layer: "solution",
              unit: 1,
              allow: ["packages/engines/{name}/**"],
            },
          ],
        },
      }),
    );
    write(dir, "src/base.js", "v1\n");
    commitAll(dir, "base");
    // Untracked file under a directory named like a flag -> unit "--orphan".
    write(dir, "packages/engines/--orphan/x.md", "x\n");

    const r = runGuard(dir, ["branch", "foo"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/refusing to create/);
  });
});
