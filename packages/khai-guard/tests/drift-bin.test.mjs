// Bin-level integration tests for `khai-guard drift`.
//
// `checkDrift` (index.mjs) is pure and prints nothing, so drift-scope.test.mjs
// covers the decision and nothing at all covers the I/O. That is the bin's
// whole remaining job: read the manifest and lockfile, ask the registry, write
// the report — and the shape of that report on stdout is a contract, because a
// house workflow pipes `--json` into `JSON.parse`. Prose on stdout is a broken
// build for the caller the flag exists for, whichever path emitted it, so every
// path is exercised here against the real binary rather than the export.
//
// The registry is stubbed rather than called: `npm view` is shelled out to, so
// a stub earlier on PATH injects the answer and the cases stay deterministic
// and offline.

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

function write(dir, rel, content) {
  const full = join(dir, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}

// A house in miniature: a git repo (the bin walks to the toplevel first), a
// manifest declaring the dependencies, a lockfile holding the versions, and a
// guard config carrying the policy.
function house({ policy, deps = {}, held = {} } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "khai-guard-drift-"));
  repos.push(dir);
  git(dir, ["init", "-b", "main"]);
  git(dir, ["config", "user.email", "test@example.com"]);
  git(dir, ["config", "user.name", "KHAI-Guard Test"]);
  git(dir, ["config", "commit.gpgsign", "false"]);
  write(
    dir,
    "package.json",
    JSON.stringify({ name: "house", version: "1.0.0", devDependencies: deps }),
  );
  write(dir, "khai-guard.config.json", JSON.stringify(policy ? { driftPolicy: policy } : {}));
  const packages = Object.fromEntries(
    Object.entries(held).map(([name, version]) => [`node_modules/${name}`, { version }]),
  );
  write(dir, "package-lock.json", JSON.stringify({ lockfileVersion: 3, packages }));
  return dir;
}

// Stands in for `npm view <name> version`. A name mapped to null is a package
// the registry will not serve, which the bin must report as unreachable rather
// than drop.
function stubRegistry(dir, versions) {
  const binDir = join(dir, ".stub-bin");
  mkdirSync(binDir, { recursive: true });
  const arms = Object.entries(versions)
    .map(([name, version]) => `  ${name}) ${version === null ? "exit 1" : `echo ${version}`} ;;`)
    .join("\n");
  writeFileSync(join(binDir, "npm"), `#!/bin/sh\ncase "$2" in\n${arms}\n  *) exit 1 ;;\nesac\n`, {
    mode: 0o755,
  });
  return binDir;
}

// spawnSync, not execFileSync: findings print to stderr while the process still
// exits 0 without --enforce, and stdout must be captured either way.
function drift(cwd, args = [], stubDir = null) {
  const env = stubDir ? { ...process.env, PATH: `${stubDir}:${process.env.PATH}` } : process.env;
  const r = spawnSync(process.execPath, [binPath, "drift", ...args], {
    cwd,
    encoding: "utf8",
    env,
  });
  return { status: r.status ?? 1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

const parsed = (stdout) => JSON.parse(stdout);
const EMPTY = { behind: 0, unreachable: 0, rows: [] };

describe("khai-guard drift --json", () => {
  // The three ways the command can finish with nothing to compare. Each is a
  // caller waiting to parse, so each owes it a report.
  it("emits a parseable empty report when no driftPolicy is configured", () => {
    const r = drift(house({ policy: null }), ["--json"]);
    expect(r.status).toBe(0);
    expect(parsed(r.stdout)).toEqual(EMPTY);
  });

  it("emits a parseable empty report when the policy names no scopes", () => {
    const r = drift(house({ policy: { scopes: [] } }), ["--json"]);
    expect(r.status).toBe(0);
    expect(parsed(r.stdout)).toEqual(EMPTY);
  });

  it("emits a parseable empty report when no dependency is in the named scopes", () => {
    const dir = house({ policy: { scopes: ["@chbrain/"] }, deps: { prettier: "^3.0.0" } });
    const r = drift(dir, ["--json"]);
    expect(r.status).toBe(0);
    expect(parsed(r.stdout)).toEqual(EMPTY);
  });

  it("reports a package the registry has moved past, and stdout stays JSON", () => {
    const dir = house({
      policy: { scopes: ["@chbrain/"] },
      deps: { "@chbrain/khai-tests": "^0.2.0" },
      held: { "@chbrain/khai-tests": "0.2.1" },
    });
    const stub = stubRegistry(dir, { "@chbrain/khai-tests": "0.2.4" });
    const r = drift(dir, ["--json"], stub);
    const report = parsed(r.stdout);
    expect(report.behind).toBe(1);
    expect(report.rows[0]).toMatchObject({
      name: "@chbrain/khai-tests",
      held: "0.2.1",
      latest: "0.2.4",
      behind: true,
    });
    // the finding itself is a human line, and it belongs on stderr or the
    // caller's parse breaks
    expect(r.stderr).toContain("@chbrain/khai-tests");
    expect(r.status).toBe(0);
  });

  it("keeps stdout parseable when the registry will not answer", () => {
    const dir = house({
      policy: { scopes: ["@chbrain/"] },
      deps: { "@chbrain/khai-tests": "^0.2.0" },
      held: { "@chbrain/khai-tests": "0.2.4" },
    });
    const stub = stubRegistry(dir, { "@chbrain/khai-tests": null });
    const report = parsed(drift(dir, ["--json"], stub).stdout);
    expect(report.unreachable).toBe(1);
    expect(report.rows).toHaveLength(1);
    expect(report.rows[0].latest).toBe(null);
  });

  it("says nothing on stdout beyond the report when everything is level", () => {
    const dir = house({
      policy: { scopes: ["@chbrain/"] },
      deps: { "@chbrain/khai-tests": "^0.2.0" },
      held: { "@chbrain/khai-tests": "0.2.4" },
    });
    const stub = stubRegistry(dir, { "@chbrain/khai-tests": "0.2.4" });
    const r = drift(dir, ["--json"], stub);
    // the success line is the one that broke the first house to consume this
    expect(r.stdout).not.toMatch(/KHAI-Guard/);
    expect(parsed(r.stdout)).toMatchObject({ behind: 0, unreachable: 0 });
  });

  it("exits 1 under --enforce and 0 without it, on the same finding", () => {
    const build = () =>
      house({
        policy: { scopes: ["@chbrain/"] },
        deps: { "@chbrain/khai-tests": "^0.2.0" },
        held: { "@chbrain/khai-tests": "0.2.1" },
      });
    const lenient = build();
    const strict = build();
    expect(
      drift(lenient, ["--json"], stubRegistry(lenient, { "@chbrain/khai-tests": "0.2.4" })).status,
    ).toBe(0);
    expect(
      drift(
        strict,
        ["--json", "--enforce"],
        stubRegistry(strict, { "@chbrain/khai-tests": "0.2.4" }),
      ).status,
    ).toBe(1);
  });
});

// Suppressing prose under --json must not mean deleting it: a person running
// the command with no flag is the other caller, and they are owed the reason.
describe("khai-guard drift (human)", () => {
  it("says why there is nothing to check when no driftPolicy is configured", () => {
    const r = drift(house({ policy: null }));
    expect(r.stdout).toContain("no driftPolicy configured");
    expect(r.status).toBe(0);
  });

  it("says why there is nothing to check when the policy names no scopes", () => {
    const r = drift(house({ policy: { scopes: [] } }));
    expect(r.stdout).toContain("names no scopes");
  });

  it("renders the table and the level count", () => {
    const dir = house({
      policy: { scopes: ["@chbrain/"] },
      deps: { "@chbrain/khai-tests": "^0.2.0" },
      held: { "@chbrain/khai-tests": "0.2.4" },
    });
    const r = drift(dir, [], stubRegistry(dir, { "@chbrain/khai-tests": "0.2.4" }));
    expect(r.stdout).toContain("| package | lockfile | registry |");
    expect(r.stdout).toContain("`@chbrain/khai-tests`");
    expect(r.stdout).toContain("1 package(s) level with the registry");
  });

  it("marks a behind row in the table", () => {
    const dir = house({
      policy: { scopes: ["@chbrain/"] },
      deps: { "@chbrain/khai-tests": "^0.2.0" },
      held: { "@chbrain/khai-tests": "0.2.1" },
    });
    const r = drift(dir, [], stubRegistry(dir, { "@chbrain/khai-tests": "0.2.4" }));
    expect(r.stdout).toContain("**behind**");
  });

  // A lockfile that holds nothing for a declared package is unknown, not zero:
  // reading it as behind would raise an issue against a house that is fine.
  it("reads a package the lockfile does not hold as unknown", () => {
    const dir = house({
      policy: { scopes: ["@chbrain/"] },
      deps: { "@chbrain/khai-tests": "^0.2.0" },
    });
    const r = drift(dir, [], stubRegistry(dir, { "@chbrain/khai-tests": "0.2.4" }));
    expect(r.stdout).toContain("| unknown |");
    expect(r.stdout).not.toContain("**behind**");
  });
});
