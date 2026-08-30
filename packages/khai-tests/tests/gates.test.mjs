// The house gates runner, lifted into the kit.
//
// Dormant until the source lands (tests first, source second). The guard is the
// module's existence rather than a string probe, so the import below is dynamic.
// This repo has twice paid for a prose-phrase sentinel that matched nothing and
// left a whole suite silently skipped, which is the same failure the runner
// itself exists against: green on what it could not see.
//
// The class: every khai house needs one command that runs every wall, exits
// once, and prints something a person can paste into a pull request. `npm run
// gates` in this repo is that command, and it exists because a handover listed
// six commands, an author ran some of them, and reported "all validation tests
// passed" while the science index gate was failing. So far so local. The cost of
// leaving it local is what this module is for: the khai-cultures house
// hand-built its own runner from the same idea and it drifted from that house's
// CI without anybody noticing, because two implementations of one rule is two
// things to get wrong and only one of them is read.
//
// Two design rules come across with it, both in the script's own header and both
// pinned below:
//
//   1. IT VERIFIES, IT DOES NOT FIX. A failing wall names the command that
//      repairs it and fails. A gate that quietly repairs what it finds teaches
//      nobody and hides the drift, so the fix is a STRING in a record, never
//      something the runner executes.
//
//   2. IT REPORTS WHAT IT SAW, and says what it did not look at. The worst
//      failures here were not gates going red; they were gates going green on a
//      tree they could not see.

import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "src", "gates.mjs");
const DORMANT = !existsSync(SRC);

let loadGates, runGates, renderGates;
beforeAll(async () => {
  if (DORMANT) return;
  ({ loadGates, runGates, renderGates } = await import(SRC));
});

let tmp;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/** A shell command that exits clean, and one that does not. */
const PASS = 'node -e "process.exit(0)"';
const FAIL = 'node -e "process.exit(1)"';

/** A shell command whose only observable effect is a file on disk. Used to prove
 * a command was NOT run: an absent sentinel is the assertion. */
const touch = (path) =>
  `node -e "require('fs').writeFileSync(process.argv[1], 'ran')" ${JSON.stringify(path)}`;

/** A real git repository, because the visibility check reads git and a fake one
 * would pin the fake. Content lives under packages/, which is the content root
 * every khai house shares. */
function repo({ untracked = false } = {}) {
  tmp = mkdtempSync(join(tmpdir(), "khai-gates-"));
  const pkg = join(tmp, "packages", "house");
  mkdirSync(pkg, { recursive: true });
  writeFileSync(join(pkg, "index.mjs"), "export const x = 1;\n");
  const git = (...args) => execFileSync("git", ["-C", tmp, ...args], { stdio: "ignore" });
  git("init", "--quiet", "-b", "main");
  git("add", "-A");
  if (untracked) writeFileSync(join(pkg, "place_new.md"), "# new\n");
  return tmp;
}

/** A workspace: config at the top, content root nested beneath it. The shape
 * guard-config.test.mjs pins for the policy loaders, asked of the manifest. */
function workspace(config) {
  tmp = mkdtempSync(join(tmpdir(), "khai-gates-config-"));
  const pkg = join(tmp, "packages", "house");
  mkdirSync(pkg, { recursive: true });
  if (config) writeFileSync(join(tmp, "khai-guard.config.json"), JSON.stringify(config));
  return pkg;
}

describe.skipIf(DORMANT)("loadGates: the wall manifest", () => {
  it("reads the gates a house declares in its guard config", () => {
    const pkg = workspace({
      gates: [
        { name: "format", command: "npx prettier --check .", fix: "npx prettier --write ." },
        { name: "science index", command: "npx khai-tests science verify" },
      ],
    });
    const gates = loadGates(pkg);
    expect(gates.map((g) => g.name)).toEqual(["format", "science index"]);
    expect(gates[0].fix).toBe("npx prettier --write .");
    // `fix` is optional: a wall with nothing to run is a wall a person answers.
    expect(gates[1].fix).toBeUndefined();
  });

  it("resolves the config ABOVE the root, which is a workspace-shaped house", () => {
    // The manifest is found by findGuardConfig's walk-up and not by
    // join(root, "khai-guard.config.json"), so a house whose content sits in
    // packages/<house> while its config stays at the repository root still finds
    // its walls. The kit already learned this once, on the policy loaders: a
    // declaration read by nothing is indistinguishable from one nobody made. The
    // runner reuses that walk rather than owning a second notion of where the
    // config lives, because two answers to "where is the config" is how the
    // policies and the walls come to disagree about which house they are in.
    const pkg = workspace({ gates: [{ name: "suite", command: "npx vitest run" }] });
    expect(loadGates(pkg).map((g) => g.name)).toEqual(["suite"]);
  });

  it("returns [] when the config declares no gates key", () => {
    // Empty, and not an error: the runner's answer to a house that declares
    // nothing is a finding it reports (below), not a crash in the loader.
    const pkg = workspace({ workPolicy: { canon: [] } });
    expect(loadGates(pkg)).toEqual([]);
  });

  it("returns [] when there is no config anywhere up the walk", () => {
    const pkg = workspace(null);
    expect(loadGates(pkg)).toEqual([]);
  });
});

describe.skipIf(DORMANT)("runGates: it verifies, it does not fix", () => {
  it("names a failing wall and its fix command, and does not run the fix", () => {
    // Rule 1, pinned as a side effect rather than as prose: the fix here is a
    // command that would leave a file on disk. The file must not exist. A runner
    // that repairs what it finds reports green on a tree it just changed, and
    // the drift it repaired is never read by anybody.
    const root = repo();
    const sentinel = join(root, "the-fix-ran");
    const run = runGates(root, {
      gates: [{ name: "science index", command: FAIL, fix: touch(sentinel) }],
    });
    expect(run.ok).toBe(false);
    const wall = run.results.find((r) => r.name === "science index");
    expect(wall.ok).toBe(false);
    expect(existsSync(sentinel)).toBe(false);
    // The fix is carried to the reader, which is the whole of what the runner
    // owes: it is named in the paste block, never executed.
    expect(renderGates(run.results)).toContain(touch(sentinel));
  });

  it("is not ok if ANY wall failed, whatever the rest did", () => {
    // One verdict for the whole run. A runner once printed FAIL for a check,
    // exited 1, and said "10/10 gates pass" on the next line: two answers from
    // one pass, and a reader who takes the friendlier one is not being careless.
    // The count and the verdict are computed from the same records here, so
    // disagreeing with itself is not a thing this can do.
    const root = repo();
    const run = runGates(root, {
      gates: [
        { name: "one", command: PASS },
        { name: "two", command: PASS },
        { name: "three", command: FAIL, fix: "npx khai-tests science build" },
        { name: "four", command: PASS },
        { name: "five", command: PASS },
      ],
    });
    expect(run.ok).toBe(false);
    expect(run.results.filter((r) => r.ok === false)).toHaveLength(1);
    const text = renderGates(run.results);
    expect(text).not.toMatch(/all gates pass/i);
    expect(text).toMatch(/three/);
  });

  it("is ok when every declared wall passed", () => {
    const root = repo();
    const run = runGates(root, {
      gates: [
        { name: "one", command: PASS },
        { name: "two", command: PASS },
      ],
    });
    expect(run.ok).toBe(true);
    expect(run.results.filter((r) => r.name !== "visibility").map((r) => r.ok)).toEqual([
      true,
      true,
    ]);
  });

  it("declaring no gates is a FINDING, not a clean pass", () => {
    // Green on nothing is the failure mode the runner exists against, and it is
    // the one a new house meets first: it installs the kit, calls the runner
    // before declaring a manifest, and hears that all its gates pass. Nothing
    // about that sentence is false and everything about it is wrong. So an empty
    // manifest is a not-ok record with its own name, and the run carries the
    // verdict: distinguishable from success by `ok`, not merely by reading the
    // prose.
    const root = repo();
    const run = runGates(root, { gates: [] });
    expect(run.ok).toBe(false);
    expect(run.results.some((r) => r.ok === false)).toBe(true);
    const text = renderGates(run.results);
    expect(text).toMatch(/no gates declared/i);
    expect(text).not.toMatch(/all gates pass/i);
  });
});

describe.skipIf(DORMANT)("runGates: what the gates cannot see", () => {
  it("refuses a tree with untracked files under the content root", () => {
    // Rule 2. member-check reads git-tracked paths and reports the OLD counts on
    // an untracked package; the science and conformance passes scan what the
    // install linked. Both go GREEN on the tree they can see, which is worse
    // than either going red, so an untracked path under packages/ is refused
    // rather than skipped past.
    const root = repo({ untracked: true });
    const sentinel = join(root, "a-wall-ran");
    const run = runGates(root, { gates: [{ name: "suite", command: touch(sentinel) }] });
    expect(run.ok).toBe(false);
    const seen = run.results.find((r) => r.name === "visibility");
    expect(seen.ok).toBe(false);
    expect(seen.detail).toMatch(/untracked/i);
    // And it STOPS: a wall run against a tree the runner has said it cannot see
    // produces an answer that means nothing, and it means nothing expensively.
    expect(existsSync(sentinel)).toBe(false);
  });

  it("passes visibility on a clean tree and goes on to the walls", () => {
    const root = repo();
    const run = runGates(root, { gates: [{ name: "suite", command: PASS }] });
    expect(run.results.find((r) => r.name === "visibility").ok).toBe(true);
    expect(run.results.find((r) => r.name === "suite").ok).toBe(true);
    expect(run.ok).toBe(true);
  });
});

describe.skipIf(DORMANT)("renderGates: the paste block", () => {
  it("declares what it did NOT run, always", () => {
    // The khai-cultures runner said 10/10 while CI failed all ten jobs on
    // `npm ci`, and no line of either log said "lockfile". The local pass was
    // honest about every wall it ran and silent about the one difference that
    // decided the outcome, so the reader had no way to know the question had not
    // been asked. The declaration is unconditional, not a caller's option: a
    // caller that forgets it loses exactly the sentence that was missing.
    const text = renderGates([{ name: "one", ok: true, detail: "" }]);
    expect(text).toMatch(/node_modules/);
    expect(text).toMatch(/npm ci/);
  });

  it("carries a caller's own skips alongside the standing one", () => {
    const text = renderGates([{ name: "one", ok: true, detail: "" }], {
      skips: ["the tongues package is not published from here"],
    });
    expect(text).toMatch(/the tongues package is not published from here/);
    expect(text).toMatch(/npm ci/);
  });

  it("carries the measured counts from the records", () => {
    // Counts are the tell rule 2 is built on: a count that did not move when the
    // tree moved is how a blind gate announces itself. So they are rendered from
    // the records verbatim, for a reader to copy rather than to paraphrase.
    const text = renderGates([
      { name: "member scope", ok: true, detail: "376 engines, 1290 members" },
      { name: "suite", ok: true, detail: "1204 passed, 31 skipped" },
    ]);
    expect(text).toMatch(/376 engines, 1290 members/);
    expect(text).toMatch(/1204 passed, 31 skipped/);
  });

  it("names a record it could not read rather than passing over it", () => {
    // The same rule renderInstructions holds for a law it cannot read: a record
    // that produced no answer is printed as a record that produced no answer.
    // Dropping it leaves a paste block whose gate count is short by one and
    // whose reader has no way to notice.
    const text = renderGates([
      { name: "member scope", ok: false, detail: "", error: "spawn ENOENT" },
    ]);
    expect(text).toMatch(/member scope/);
    expect(text).toMatch(/unreadable: spawn ENOENT/);
  });

  it("is pure: records in, text out, no config and no tree", () => {
    // The renderer never reads disk, so a house can print a run it did not
    // perform (a CI summary, a replay) and get the same block.
    const records = [{ name: "one", ok: true, detail: "counted" }];
    expect(renderGates(records)).toBe(renderGates(records));
    expect(records).toEqual([{ name: "one", ok: true, detail: "counted" }]);
  });
});
