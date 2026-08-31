// What a scope check says when it checked nothing.
//
// `branch-check` and the source/test split read a DIFF RANGE, which is committed
// history. Both used to print a confident pass over an empty range, so staging 53
// stray files and running the guard returned "0 changed path(s) all in lane"
// while committing the identical files returned a refusal. The files were never
// the difference; being in history was. That is the failure this file holds down,
// and it is a bin-level property rather than a decision, so it runs the real
// binary against real repositories.
//
// `unseenByRange` is the one part that is a decision, so it is unit-tested too:
// what the tree state MEANS is separable from reading it.

import { describe, it, expect, afterEach } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { unseenByRange } from "../index.mjs";

const binPath = fileURLToPath(new URL("../bin/khai-guard.mjs", import.meta.url));

let repos = [];
afterEach(() => {
  for (const dir of repos) rmSync(dir, { recursive: true, force: true });
  repos = [];
});

const git = (cwd, args) => execFileSync("git", args, { cwd, encoding: "utf8" });

function write(dir, rel, content) {
  const full = join(dir, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}

// A house with one lane, a base commit, and a branch that belongs to that lane.
// The base is what every range below is measured against.
function house() {
  const dir = mkdtempSync(join(tmpdir(), "khai-guard-range-"));
  repos.push(dir);
  git(dir, ["init", "-b", "main"]);
  git(dir, ["config", "user.email", "test@example.com"]);
  git(dir, ["config", "user.name", "KHAI-Guard Test"]);
  git(dir, ["config", "commit.gpgsign", "false"]);
  write(dir, "package.json", JSON.stringify({ name: "house", version: "1.0.0" }));
  write(
    dir,
    "khai-guard.config.json",
    JSON.stringify({
      branchScope: {
        shared: [".changeset/**"],
        lanes: [{ pattern: "governance/*", layer: "governance", allow: ["docs/**"] }],
      },
    }),
  );
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-m", "base"]);
  const base = git(dir, ["rev-parse", "HEAD"]).trim();
  git(dir, ["checkout", "-q", "-b", "governance/topic"]);
  return { dir, base };
}

function guard(cwd, args) {
  const r = spawnSync(process.execPath, [binPath, ...args], { cwd, encoding: "utf8" });
  return { status: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

describe("unseenByRange", () => {
  it("says nothing about a clean tree, so a clean pass stays a plain pass", () => {
    expect(unseenByRange({ staged: 0, unstaged: 0, untracked: 0 })).toBeNull();
    expect(unseenByRange({})).toBeNull();
    expect(unseenByRange()).toBeNull();
  });

  it("names each state it finds, and only those", () => {
    expect(unseenByRange({ staged: 2 })).toBe("2 staged path(s)");
    expect(unseenByRange({ untracked: 1 })).toBe("1 untracked path(s)");
    expect(unseenByRange({ staged: 3, unstaged: 1, untracked: 4 })).toBe(
      "3 staged, 1 unstaged, 4 untracked path(s)",
    );
  });
});

describe("a scope check over an empty range", () => {
  // The incident, in miniature. The assertion that matters is not that it passes
  // -- it did before -- but that it stops claiming it checked something.
  it("does not report a pass while files sit staged", () => {
    const { dir, base } = house();
    write(dir, "docs/note.md", "x");
    git(dir, ["add", "-A"]);

    for (const cmd of [["branch-check"], []]) {
      const r = guard(dir, [...cmd, "--base", base, "--head", base]);
      expect(r.status, `${cmd[0] ?? "source/test"} must not fail`).toBe(0);
      expect(r.out).toContain("NOTHING CHECKED");
      expect(r.out).toContain("1 staged path(s)");
      expect(r.out, "an empty range must not read as a pass").not.toMatch(/OK:/);
    }
  });

  it("counts untracked work too, which no committed range can see", () => {
    const { dir, base } = house();
    write(dir, "docs/untracked.md", "x");
    const r = guard(dir, ["branch-check", "--base", base, "--head", base]);
    expect(r.out).toContain("1 untracked path(s)");
  });

  it("says plainly that there was nothing to do when the tree is clean", () => {
    const { dir, base } = house();
    const r = guard(dir, ["branch-check", "--base", base, "--head", base]);
    expect(r.status).toBe(0);
    expect(r.out).toContain("nothing to check");
    expect(r.out).not.toContain("NOTHING CHECKED");
  });

  // The reason the empty range is handled BEFORE the branch name is judged: on
  // the default branch there is no lane to be in, and the old code failed with
  // `"main" matches no lane` for an author who had done nothing. Same for a
  // changeset that no pull request was ever going to carry.
  it("does not judge the branch name or a missing changeset when nothing changed", () => {
    const { dir, base } = house();
    git(dir, ["checkout", "-q", "main"]);
    for (const cmd of ["branch-check", "changeset-check"]) {
      const r = guard(dir, [cmd, "--base", base, "--head", base]);
      expect(r.status, `${cmd} on a clean main must not fail`).toBe(0);
      expect(r.out).not.toContain("matches no lane");
      expect(r.out).not.toContain("no changeset found");
    }
  });
});

describe("a scope check over a real range", () => {
  // The guard rail on all of the above: the skip must not reach a range that has
  // something in it, or it would silence the checks it is meant to keep honest.
  it("still judges a committed change, and still refuses one out of lane", () => {
    const { dir, base } = house();
    write(dir, "docs/in-lane.md", "x");
    git(dir, ["add", "-A"]);
    git(dir, ["commit", "-m", "in lane"]);
    const ok = guard(dir, ["branch-check", "--base", base, "--head", "HEAD"]);
    expect(ok.status).toBe(0);
    expect(ok.out).toMatch(/branch-check OK/);
    expect(ok.out).not.toContain("nothing to check");

    write(dir, "src/out-of-lane.mjs", "x");
    git(dir, ["add", "-A"]);
    git(dir, ["commit", "-m", "out of lane"]);
    const bad = guard(dir, ["branch-check", "--base", base, "--head", "HEAD"]);
    expect(bad.status).toBe(1);
    expect(bad.out).toContain("src/out-of-lane.mjs");
  });
});
