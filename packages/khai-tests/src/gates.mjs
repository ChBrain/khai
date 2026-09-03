// The house gates runner.
//
// Every khai house needs one command that runs every wall, exits once, and
// prints something a person can paste into a pull request. `npm run gates` in
// this repo was that command, and it existed because of a specific failure
// rather than a general wish for convenience: a handover listed six commands, an
// author ran some of them, and reported "all validation tests passed" while the
// science index gate was failing. Prose cannot fix that; a claim nobody can
// check is worth what it costs to make.
//
// The cost of leaving it local is what this module is for. The khai-cultures
// house hand-built its own runner from the same idea and it drifted from that
// house's CI without anybody noticing, because two implementations of one rule
// is two things to get wrong and only one of them is read. So the runner is
// lifted into the kit and the houses declare their walls, in the `gates` key of
// khai-guard.config.json, read through findGuardConfig's walk-up: a house that
// takes the workspace shape keeps its walls where it keeps its lanes, and the
// runner never owns a second notion of where the config lives.
//
// Three rules it holds to, all three learned the hard way:
//
//   1. IT VERIFIES, IT DOES NOT FIX. A gate that quietly repairs what it finds
//      teaches nobody and hides the drift, so a failing wall names the command
//      that repairs it and fails. The fix is a STRING carried to the reader,
//      never something the runner executes.
//
//   2. IT REPORTS WHAT IT SAW, and says what it did not look at. The worst
//      failures here were not gates going red; they were gates going GREEN on a
//      tree they could not see -- member-check reporting the old counts because
//      a new package was still untracked, the science pass finding nothing
//      because the workspace was not linked. So untracked paths under the
//      content root STOP the pass rather than being skipped past, the block
//      prints measured counts (a count that did not move when the tree moved is
//      the tell), and it declares unconditionally that it ran against the
//      installed node_modules and not a fresh `npm ci`. That last sentence is
//      the one that was missing when the khai-cultures runner said 10/10 while
//      CI failed all ten jobs on `npm ci`: the local pass was honest about every
//      wall it ran and silent about the one difference that decided the outcome.
//
//   3. ONE VERDICT, COMPUTED FROM THE RECORDS. A runner once printed FAIL for a
//      check, exited 1, and said "10/10 gates pass" on the next line: two
//      answers from one pass, and a reader who takes the friendlier one is not
//      being careless. The count and the verdict come off the same records here,
//      so disagreeing with itself is not a thing this can do -- and declaring no
//      gates at all is a FINDING rather than a clean pass, because green on
//      nothing is the failure mode a new house meets first.

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { findGuardConfig } from "./guard-config.mjs";

/** The one record name the runner reserves: the visibility check is the runner's
 * own, never a declared wall, and the renderer counts walls around it. */
export const VISIBILITY = "visibility";

/** What the runner did not look at, whoever calls it. Unconditional rather than
 * a caller's option: a caller that forgets it loses exactly the sentence that
 * was missing from the log that reported 10/10. */
// Worded to stay true whichever walls a house declares. It used to say a
// lockfile or manifest mismatch was invisible here, and for a house whose
// lockfile wall now asks `npm ci --dry-run` that is no longer so -- but a house
// that declares no such wall is still exposed, so the sentence names the gap
// conditionally rather than promising either way. What no declared wall can see
// is what only a real install decides, and that part is unconditional.
const STANDING_SKIP =
  "the pass used the installed node_modules and not a fresh `npm ci`, so whatever " +
  "only a real install decides (integrity, install scripts, platform-specific " +
  "packages) is invisible to it, as is a lockfile that does not match the " +
  "manifests unless a declared wall checks for one";

/** How many lines of a failing wall's output reach the block, and how wide. A
 * whole suite log is not a paste block; the first few lines are the reader's
 * way in to the log they still have on screen. */
const EXCERPT_LINES = 4;
const EXCERPT_WIDTH = 160;

/** How many notices from a PASSING wall reach the block. A notice is a line a
 * person must eventually act on, not a log: more than a handful at once is
 * itself the finding, and the wall's own output is still on screen. */
const NOTICE_LINES = 8;

/**
 * The walls a house declares, from the `gates` key of its khai-guard.config.json.
 *
 * `[]` for a house with no config, no key, or a config that will not parse: the
 * loader's answer to a house that declares nothing is a finding the RUNNER
 * reports (a not-ok record with its own name), never a crash here. A loader that
 * threw would make "this house declares no walls" indistinguishable from "this
 * house has no config", and both would arrive as a stack trace.
 *
 * Each entry is `{ name, command, fix?, count? }`. `fix` is optional: a wall with
 * nothing to run is a wall a person answers. `count` is a regex source read
 * against the wall's output, and its first capture group (or the whole match)
 * becomes the record's detail -- verbatim, for a reader to copy rather than to
 * paraphrase.
 *
 * @param {string} root
 * @returns {{name: string, command: string, fix?: string, count?: string}[]}
 */
export function loadGates(root) {
  const path = findGuardConfig(root);
  if (!path) return [];
  let config;
  try {
    config = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return [];
  }
  return Array.isArray(config?.gates) ? config.gates : [];
}

/** The first few lines of something, trimmed and capped. */
const excerpt = (lines) =>
  lines
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, EXCERPT_LINES)
    .map((l) => (l.length > EXCERPT_WIDTH ? `${l.slice(0, EXCERPT_WIDTH - 3)}...` : l));

/** A wall's measured count, read off its own output. A declared count that
 * matched nothing on a wall that PASSED is said out loud rather than left blank:
 * a count that stopped being printed is exactly the tell rule 2 rests on, and a
 * blank detail reads like a wall that never counted anything. */
function measure(out, count, ok) {
  if (typeof count !== "string" || !count) return "";
  let re;
  try {
    re = new RegExp(count);
  } catch {
    return "count declaration is not a regex";
  }
  const m = re.exec(out);
  if (!m) return ok ? "count not found in the output" : "";
  return String(m[1] ?? m[0]).trim();
}

/** Lines of a wall's output the house asked to be carried up, matched against
 * the wall's declared `warn` regex.
 *
 * A wall that PASSES relays only its count today, so anything it said on the way
 * is captured and dropped. That is not a cosmetic loss. The stale-BASELINE
 * warnings are the designated way a ratchet says one of its entries can be
 * pruned -- deliberately a warning rather than a failure, because the branch that
 * earns the prune rides a package lane and cannot edit the governance file that
 * holds the list. Made inaudible here, the list can only ever grow.
 *
 * Matched with `gm` so the declaration is a line pattern rather than a search:
 * a wall says its piece on its own line, and the record carries whole lines.
 *
 * @param {string} out - the wall's combined stdout and stderr
 * @param {string|undefined} warn - regex source, from the gate's declaration
 * @returns {string[]} matched lines, trimmed and capped
 */
function notices(out, warn) {
  if (typeof warn !== "string" || !warn) return [];
  let re;
  try {
    re = new RegExp(warn, "gm");
  } catch {
    // Same posture as measure(): a malformed declaration is said out loud, never
    // thrown. A house that mistyped a pattern should read that, not a stack.
    return ["warn declaration is not a regex"];
  }
  const seen = [];
  for (const m of out.matchAll(re)) {
    const raw = String(m[1] ?? m[0]).trim();
    // Capped like a failure excerpt, and for the same reason: this is the
    // reader's way in, not the record itself. A stale list can name a dozen
    // entries, and whoever runs the sweep runs the wall to get all of them.
    const line = raw.length > EXCERPT_WIDTH ? `${raw.slice(0, EXCERPT_WIDTH - 3)}...` : raw;
    // A wall that repeats itself across projects (one vitest run, several
    // workers) should not repeat itself in the block.
    if (line && !seen.includes(line)) seen.push(line);
    if (seen.length === NOTICE_LINES) break;
  }
  return seen;
}

/** What the walls can even see. Untracked content is invisible to member-check
 * (it reads git-tracked paths) and, without an install, to the science and
 * conformance passes; both report success on the tree they can see, which is
 * worse than either going red. */
function visibility(root, contentRoots) {
  const where = contentRoots.join(", ");
  const r = spawnSync(
    "git",
    ["-C", root, "ls-files", "--others", "--exclude-standard", "--", ...contentRoots],
    { encoding: "utf8" },
  );
  // A tree git would not answer for is not a clean tree. "git could not read
  // this" and "there is nothing untracked" are different facts, and collapsing
  // them is how a visibility check reports clean on a tree it never opened.
  if (r.error || r.status !== 0) {
    return {
      name: VISIBILITY,
      ok: false,
      detail: `could not read the tree under ${where}`,
      error: r.error ? r.error.message : `git exited ${r.status}: ${(r.stderr ?? "").trim()}`,
      fix: "run the gates inside the house's git repository",
    };
  }
  const untracked = (r.stdout ?? "").split("\n").filter((l) => l.trim());
  if (!untracked.length) {
    return { name: VISIBILITY, ok: true, detail: `no untracked paths under ${where}` };
  }
  return {
    name: VISIBILITY,
    ok: false,
    detail: `${untracked.length} untracked path(s) under ${where}`,
    fix:
      "git add them -- member-check reads git-tracked paths and will report " +
      "the OLD counts on an untracked package",
    output: excerpt(untracked),
  };
}

/** One declared wall, run through the shell. The fix is never executed. */
function runWall(root, gate) {
  const name = typeof gate?.name === "string" && gate.name ? gate.name : "(unnamed gate)";
  const fix = typeof gate?.fix === "string" && gate.fix ? { fix: gate.fix } : {};
  // A malformed declaration is a record, not a throw: the house declared a wall
  // and got no answer from it, which is a thing the block must say.
  if (typeof gate?.command !== "string" || !gate.command.trim()) {
    return { name, ok: false, detail: "", error: "declared with no command", ...fix };
  }
  const r = spawnSync(gate.command, { cwd: root, shell: true, encoding: "utf8" });
  if (r.error) return { name, ok: false, detail: "", error: r.error.message, ...fix };
  const out = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
  const ok = r.status === 0;
  const notice = notices(out, gate.warn);
  return {
    name,
    ok,
    detail: measure(out, gate.count, ok),
    ...(notice.length ? { notices: notice } : {}),
    ...fix,
    ...(ok ? {} : { output: excerpt(out.split("\n")) }),
  };
}

/**
 * Run a house's walls and return one verdict over the records.
 *
 * Visibility first, and it STOPS: a wall run against a tree the runner has said
 * it cannot see produces an answer that means nothing, and it means nothing
 * expensively. `contentRoots` is where the house keeps its content and defaults
 * to this workspace's shape -- khai-misfits keeps its productions in `misfits/`,
 * and a packages/-only check would go green on that house forever. The default
 * looks ONLY where it was told, which is correct rather than lenient: a check
 * that quietly widened to the whole tree would refuse every scratch file in a
 * working directory and be turned off within a week.
 *
 * `onRecord` is called with each record as it lands, so a caller can show
 * progress through a pass that takes minutes without owning a second format for
 * a gate line (use `gateLine`).
 *
 * @param {string} root
 * @param {{gates?: object[], contentRoots?: string[], onRecord?: (r: object) => void}} [opts]
 * @returns {{ok: boolean, results: object[]}}
 */
export function runGates(root, { gates = [], contentRoots = ["packages/"], onRecord } = {}) {
  const results = [];
  const push = (record) => {
    results.push(record);
    if (typeof onRecord === "function") onRecord(record);
    return record;
  };

  const roots = contentRoots.length ? contentRoots : ["packages/"];
  if (!push(visibility(root, roots)).ok) return { ok: false, results };

  // Green on nothing is the failure mode this runner exists against, and it is
  // the one a new house meets first: it installs the kit, calls the runner
  // before declaring a manifest, and hears that all its gates pass. Nothing
  // about that sentence is false and everything about it is wrong.
  if (!gates.length) {
    push({
      name: "manifest",
      ok: false,
      detail: "no gates declared",
      fix: 'declare a "gates" array in khai-guard.config.json',
    });
    return { ok: false, results };
  }

  for (const gate of gates) push(runWall(root, gate));
  return { ok: results.every((r) => r.ok), results };
}

/** One record as one line. Exported so a caller showing live progress and the
 * paste block print the same thing: two formats for one record is how a runner
 * comes to disagree with its own summary. */
export function gateLine(record) {
  return `${record.ok ? "ok  " : "FAIL"}  ${record.name}${record.detail ? `  ${record.detail}` : ""}`;
}

/**
 * The paste block. Pure: records in, text out, no config and no tree, so a house
 * can print a run it did not perform (a CI summary, a replay) and get the same
 * block.
 *
 * `skips` are the caller's own, rendered alongside the standing one and never
 * replacing it.
 *
 * @param {object[]} results
 * @param {{skips?: string[]}} [opts]
 * @returns {string}
 */
export function renderGates(results, { skips = [] } = {}) {
  const records = Array.isArray(results) ? results : [];
  const walls = records.filter((r) => r.name !== VISIBILITY);
  const failed = records.filter((r) => !r.ok);
  const lines = [
    `khai-tests gates: ${walls.length} wall(s) recorded, ${failed.length} failed.`,
    "",
  ];
  for (const r of records) {
    lines.push(gateLine(r));
    // A record that produced no answer is printed as a record that produced no
    // answer. Dropping it leaves a block whose gate count is short by one and
    // whose reader has no way to notice.
    if (r.error) lines.push(`      unreadable: ${r.error}`);
    // Before the failure excerpt: a notice is what the wall asked a person to
    // read, and on a passing wall it is the only thing it said beyond its count.
    for (const l of r.notices ?? []) lines.push(`      note: ${l}`);
    for (const l of r.output ?? []) lines.push(`        ${l}`);
    if (!r.ok && r.fix) lines.push(`      fix: ${r.fix}`);
  }
  lines.push("", "Not run:");
  for (const skip of [STANDING_SKIP, ...skips]) lines.push(`  - ${skip}`);
  lines.push("");
  if (failed.length) {
    lines.push(`${failed.length} gate(s) failed. Do not report this as passing.`);
  } else if (walls.length) {
    lines.push(
      "All gates pass. Counts above are measured, not estimated -- copy them " +
        "rather than writing your own.",
    );
  } else {
    // Every record ok and no wall among them: a run that asked nothing. It gets
    // no congratulation, for the same reason an empty manifest does not.
    lines.push("No wall ran, so nothing here says a house is clean.");
  }
  return lines.join("\n");
}
