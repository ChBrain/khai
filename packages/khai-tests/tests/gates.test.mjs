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

let loadGates, runGates, renderGates, gateLine;
beforeAll(async () => {
  if (DORMANT) return;
  ({ loadGates, runGates, renderGates, gateLine } = await import(SRC));
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

/** A passing command whose stdout is a countable line, for pinning `count`: the
 * runner's job is to relay the tool's own words, never to paraphrase or
 * re-count them. */
const COUNT_LINE = "node -e \"console.log('7 widgets, 3 gadgets')\"";

/** A PASSING command that also says something a person must act on. The whole
 * point of `warn`: this wall exits 0, so nothing but a declared pattern carries
 * its line up, and before that pattern existed the line was captured and
 * dropped. The repeat is deliberate -- one vitest run says its piece once per
 * worker, and the block must not. */
const WARN_LINES = [
  "the-wall: stale BASELINE entry (prune in a governance sweep): Nobody :: a work",
  "noise nobody asked to be carried",
  "the-wall: stale BASELINE entry (prune in a governance sweep): Nobody :: a work",
].join("\\n");
const WARN_LINE = `node -e "console.log('${WARN_LINES}')"`;

/** A real git repository, because the visibility check reads git and a fake one
 * would pin the fake. Content lives under packages/ by default, which is the
 * content root this workspace and every house shaped like it uses; `content`
 * moves it, which is the shape a house that has not taken the workspace layout
 * has. */
function repo({ untracked = false, content = "packages" } = {}) {
  tmp = mkdtempSync(join(tmpdir(), "khai-gates-"));
  const pkg = join(tmp, content, "house");
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

  it("looks where the house keeps its content, not where this repo keeps its", () => {
    // The khai-misfits house keeps its productions in `misfits/` and will until
    // its workspace migration lands, so it is the first real consumer of this
    // runner and the first tree where a packages/-only check sees nothing at
    // all. A check that cannot be pointed at a house's own content root is a
    // check that goes green on that house forever, which is the failure the
    // runner exists against, arriving through the runner itself.
    const root = repo({ content: "misfits", untracked: true });
    const sentinel = join(root, "a-wall-ran");
    const run = runGates(root, {
      gates: [{ name: "suite", command: touch(sentinel) }],
      contentRoots: ["misfits/"],
    });
    expect(run.ok).toBe(false);
    expect(run.results.find((r) => r.name === "visibility").ok).toBe(false);
    expect(existsSync(sentinel)).toBe(false);
  });

  it("looks ONLY where it was told, so the default means packages/ and nothing else", () => {
    // The other half of the option, and the half that gives it a meaning: the
    // same tree, unchanged, with the default roots. The untracked misfit is
    // invisible, the run is clean, and that is correct rather than lenient --
    // a check that quietly widened to the whole tree would refuse every
    // scratch file in a working directory and be turned off within a week.
    // Which is what makes the declaration load-bearing: the house says where
    // its content is, and until it does the runner is honest about looking
    // somewhere else.
    const root = repo({ content: "misfits", untracked: true });
    const run = runGates(root, { gates: [{ name: "suite", command: PASS }] });
    expect(run.results.find((r) => r.name === "visibility").ok).toBe(true);
    expect(run.ok).toBe(true);
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

describe.skipIf(DORMANT)("runGates: the count a wall prints", () => {
  it("extracts the tool's own words, verbatim", () => {
    // The point of `count` is that the reader copies the tool's own line
    // rather than trusting a paraphrase. The fixture prints text no assertion
    // here invents, and the detail must be that text exactly, not a re-count
    // and not "7 widgets and 3 gadgets".
    const root = repo();
    const run = runGates(root, {
      gates: [{ name: "inventory", command: COUNT_LINE, count: "\\d+ widgets, \\d+ gadgets" }],
    });
    expect(run.ok).toBe(true);
    const wall = run.results.find((r) => r.name === "inventory");
    expect(wall.detail).toBe("7 widgets, 3 gadgets");
  });

  it('says "count not found" rather than leaving a passing wall blank', () => {
    // A declared count that matches nothing on a wall that PASSED is the exact
    // case measure()'s own comment names: a blank detail here reads like a
    // wall that never counted anything, and a count that silently stops being
    // printed is how a blind gate hides. It must be said out loud, not left
    // empty.
    const root = repo();
    const run = runGates(root, {
      gates: [{ name: "inventory", command: PASS, count: "\\d+ zzz never printed" }],
    });
    expect(run.ok).toBe(true);
    const wall = run.results.find((r) => r.name === "inventory");
    expect(wall.detail).toBe("count not found in the output");
  });
});

describe.skipIf(DORMANT)("runGates: the notes a PASSING wall asks to be carried", () => {
  const STALE = "^.*prune in a governance sweep.*$";

  it("carries the matching lines of a wall that exited clean", () => {
    // The gap this closes: a passing wall relays only its count, so anything it
    // said on the way was captured and dropped. The stale-baseline warnings are
    // deliberately warnings -- the branch that earns a prune rides a package lane
    // and cannot edit the governance file holding the list -- so inaudible here,
    // the list can only ever grow.
    const root = repo();
    const run = runGates(root, {
      gates: [{ name: "suite", command: WARN_LINE, warn: STALE }],
    });
    expect(run.ok).toBe(true);
    const wall = run.results.find((r) => r.name === "suite");
    expect(wall.notices).toEqual([
      "the-wall: stale BASELINE entry (prune in a governance sweep): Nobody :: a work",
    ]);
  });

  it("carries only what the pattern asked for", () => {
    // A wall's output is a log. `warn` is the house saying which line of it is
    // addressed to a person, and a pattern that swept up the rest would make the
    // block unreadable and the notice worthless.
    const root = repo();
    const run = runGates(root, { gates: [{ name: "suite", command: WARN_LINE, warn: STALE }] });
    const wall = run.results.find((r) => r.name === "suite");
    expect(wall.notices).not.toContain("noise nobody asked to be carried");
  });

  it("says the same thing once, however many workers said it", () => {
    // WARN_LINE prints the line twice on purpose: one vitest run is several
    // workers, and a wall repeating itself must not make the block repeat itself.
    const root = repo();
    const run = runGates(root, { gates: [{ name: "suite", command: WARN_LINE, warn: STALE }] });
    expect(run.results.find((r) => r.name === "suite").notices).toHaveLength(1);
  });

  it("leaves the record alone when a wall says nothing to carry", () => {
    // Absent, not empty: a `notices: []` on every quiet wall would put an empty
    // affordance in every record and teach a reader to skim past the ones that
    // are not empty.
    const root = repo();
    const run = runGates(root, { gates: [{ name: "suite", command: PASS, warn: STALE }] });
    expect(run.results.find((r) => r.name === "suite").notices).toBeUndefined();
  });

  it("carries nothing when the house declared no pattern", () => {
    // Opt-in. A wall that was never asked to speak up stays as quiet as it was
    // before `warn` existed, which is what every other house's config relies on.
    const root = repo();
    const run = runGates(root, { gates: [{ name: "suite", command: WARN_LINE }] });
    expect(run.results.find((r) => r.name === "suite").notices).toBeUndefined();
  });

  it("says a malformed pattern out loud rather than throwing", () => {
    // The same posture measure() takes on a bad `count`: a house that mistyped a
    // regex should read that in the block, not a stack trace, and the rest of
    // the pass must still run.
    const root = repo();
    const run = runGates(root, { gates: [{ name: "suite", command: WARN_LINE, warn: "([" }] });
    expect(run.ok).toBe(true);
    expect(run.results.find((r) => r.name === "suite").notices).toEqual([
      "warn declaration is not a regex",
    ]);
  });

  it("renders a note under the gate line, above a failure's excerpt", () => {
    // Placement is the claim: on a passing wall the note is the only thing the
    // wall said beyond its count, so it must not be buried under output the
    // reader skims.
    const block = renderGates([
      { name: "suite", ok: true, detail: "6374 passed", notices: ["the-wall: stale entry"] },
    ]);
    const lines = block.split("\n");
    const gate = lines.findIndex((l) => l.startsWith("ok    suite"));
    expect(lines[gate + 1]).toBe("      note: the-wall: stale entry");
  });
});

describe.skipIf(DORMANT)("runGates: onRecord is a ticker, not a second engine", () => {
  it("fires once per record, in order, with the SAME objects that land in results", () => {
    // Including the visibility record: onRecord is a view onto push(), not a
    // second notion of what counts as a record. A ticker that only saw the
    // declared walls would print a different count than the block underneath
    // it.
    const root = repo();
    const seen = [];
    const run = runGates(root, {
      gates: [
        { name: "one", command: PASS },
        { name: "two", command: FAIL },
      ],
      onRecord: (r) => seen.push(r),
    });
    expect(seen.map((r) => r.name)).toEqual(["visibility", "one", "two"]);
    expect(seen).toEqual(run.results);
    // Not merely equal in shape: the SAME object. A ticker fed a copy could
    // drift from the paste block silently; the runner hands one record to
    // both.
    seen.forEach((r, i) => expect(r).toBe(run.results[i]));
  });

  it("does not change the outcome: same ok, same results, with or without a callback", () => {
    // A progress ticker earns its keep only if watching does not change what
    // is being watched. Same gates, same tree, once with onRecord and once
    // without.
    const root = repo();
    const gates = [
      { name: "one", command: PASS },
      { name: "two", command: FAIL, fix: "npx khai-tests science build" },
    ];
    const withCb = runGates(root, { gates, onRecord: () => {} });
    const withoutCb = runGates(root, { gates });
    expect(withCb.ok).toBe(withoutCb.ok);
    expect(withCb.results).toEqual(withoutCb.results);
  });
});

describe.skipIf(DORMANT)("gateLine: the one formatter for ticker and paste block", () => {
  it("renderGates prints, for every record, exactly gateLine(record) as its line", () => {
    // The invariant that matters: a live ticker calling gateLine directly and
    // the paste block calling renderGates must never show two different
    // sentences for the same record. renderGates does not re-format a record
    // of its own; it composes its line by calling gateLine, so that line and
    // gateLine(record) are the same string, not merely similar ones.
    const records = [
      { name: "one", ok: true, detail: "12 checked" },
      { name: "two", ok: false, detail: "", error: "spawn ENOENT" },
      { name: "three", ok: false, detail: "3 failing", fix: "npx thing --fix" },
    ];
    const lines = renderGates(records).split("\n");
    for (const r of records) {
      expect(lines).toContain(gateLine(r));
    }
  });

  it("is pure and total: ok and not-ok, with and without detail, fix, or error", () => {
    // No disk access and nothing it can throw on: gateLine reads only the
    // fields on the record handed to it. Called twice on the same record it
    // returns the same string, which is what lets a caller print progress
    // without re-deriving anything.
    const cases = [
      { name: "a", ok: true, detail: "" },
      { name: "a", ok: true, detail: "5 counted" },
      { name: "a", ok: false, detail: "" },
      { name: "a", ok: false, detail: "", error: "boom" },
      { name: "a", ok: false, detail: "", fix: "run this" },
    ];
    for (const c of cases) {
      const line = gateLine(c);
      expect(typeof line).toBe("string");
      expect(gateLine(c)).toBe(line);
    }
    // The literal shape, pinned rather than left to "some string or other": a
    // leading verdict word, the name, and the detail only when there is one.
    expect(gateLine({ name: "suite", ok: true, detail: "" })).toBe("ok    suite");
    expect(gateLine({ name: "suite", ok: false, detail: "" })).toBe("FAIL  suite");
    expect(gateLine({ name: "suite", ok: true, detail: "3 passed" })).toBe("ok    suite  3 passed");
  });
});
