// Bin-level integration tests for `khai-guard doctor`. Like cli.test.mjs,
// each case builds a throwaway git repo, runs the actual binary in a child
// process, and asserts the exit code plus operator-facing output — here for
// the adoption self-check rather than the diff gate.

import { describe, it, expect, afterEach } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const binPath = fileURLToPath(new URL("../bin/khai-guard.mjs", import.meta.url));

let repos = [];

afterEach(() => {
  for (const dir of repos) rmSync(dir, { recursive: true, force: true });
  repos = [];
});

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" });
}

function initRepo() {
  const dir = mkdtempSync(join(tmpdir(), "khai-guard-doctor-"));
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

// spawnSync (not execFileSync) so we capture stderr even on a successful
// exit — doctor's advisory warnings print to stderr while the process still
// exits 0, and execFileSync only surfaces stderr when the command fails.
function runDoctor(cwd) {
  const r = spawnSync(process.execPath, [binPath, "doctor"], { cwd, encoding: "utf8" });
  return { status: r.status ?? 1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

describe("khai-guard doctor", () => {
  it("reports healthy (exit 0) for a fully wired repo", () => {
    // Default config (no file): src/** = source; tests/**, .github/workflows,
    // .husky = test. Workflow and hook both reference khai-guard, and nothing
    // overlaps, so doctor should be clean with no warnings.
    const dir = initRepo();
    write(dir, "src/app.js", "v1\n");
    write(dir, "tests/app.test.js", "// test\n");
    write(dir, ".github/workflows/ci.yml", "jobs:\n  khai-guard:\n    run: npx khai-guard\n");
    write(dir, ".husky/pre-push", "#!/usr/bin/env sh\nnpx khai-guard\n");
    commitAll(dir, "fully wired repo");

    const r = runDoctor(dir);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("healthy");
    // Healthy means no warnings were emitted.
    expect(r.stdout).not.toContain("warning(s)");
  });

  it("fails (exit 2) when config buckets overlap on the tracked tree", () => {
    const dir = initRepo();
    write(
      dir,
      "khai-guard.config.json",
      JSON.stringify({ source: ["packages/**"], test: ["packages/**/tests/**"] }),
    );
    // This path matches BOTH buckets.
    write(dir, "packages/x/tests/a.test.js", "// test\n");
    commitAll(dir, "overlapping buckets with a real both-matching path");

    const r = runDoctor(dir);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("buckets overlap");
    expect(r.stderr).toContain("packages/x/tests/a.test.js");
  });

  it("fails (exit 2) on a malformed config", () => {
    const dir = initRepo();
    write(dir, "khai-guard.config.json", JSON.stringify({ source: "src/**" }));
    commitAll(dir, "malformed config: source is a string");

    const r = runDoctor(dir);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("invalid khai-guard.config.json");
  });

  it("warns but stays healthy (exit 0) when CI and the hook are missing", () => {
    // Tracked source, default config, but no .github/workflows and no
    // .husky/pre-push: advisory, not a misconfiguration.
    const dir = initRepo();
    write(dir, "src/app.js", "v1\n");
    commitAll(dir, "source only, no CI or hook");

    const r = runDoctor(dir);
    expect(r.status).toBe(0);
    const out = r.stdout + r.stderr;
    expect(out).toContain("no .github/workflows directory");
    expect(out).toContain("no .husky/pre-push hook");
    expect(r.stdout).toContain("healthy (with");
  });

  it("warns about a stale META-2 / inline gate left in a workflow", () => {
    const dir = initRepo();
    write(dir, "src/app.js", "v1\n");
    write(
      dir,
      ".github/workflows/ci.yml",
      "jobs:\n  khai-guard:\n    run: npx khai-guard\n  meta-2:\n    run: echo legacy gate\n",
    );
    write(dir, ".husky/pre-push", "npx khai-guard\n");
    commitAll(dir, "workflow references khai-guard but keeps a stale meta-2 gate");

    const r = runDoctor(dir);
    expect(r.status).toBe(0);
    expect(r.stdout + r.stderr).toContain("retire it");
  });
});
