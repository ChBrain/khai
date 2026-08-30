#!/usr/bin/env node
// `npm run gates` -- every wall this repo has, in one command, with one exit
// code and a summary built to be pasted into a pull request.
//
// It exists because of a specific failure rather than a general wish for
// convenience. A handover listed six commands; an author ran some, and reported
// "all validation tests passed" while the science index gate was failing. Prose
// cannot fix that: a claim nobody can check is worth what it costs to make. A
// single command with a single exit code and a copyable summary makes the claim
// checkable, which is the only thing that helps.
//
// Two rules it holds to, both learned the hard way:
//
//   1. IT VERIFIES, IT DOES NOT FIX. A gate that quietly repairs what it finds
//      teaches nobody and hides the drift. Where something is out of date it
//      names the command that fixes it and fails.
//
//   2. IT REPORTS WHAT IT SAW. The worst failures in this repo were not gates
//      going red; they were gates going GREEN on things they could not see --
//      member-check reporting the old counts because a new package was still
//      untracked, and the science pass finding nothing because `npm install`
//      had not linked the workspace. So the summary prints counts, and a count
//      that did not move when the tree moved is the tell. Untracked files under
//      packages/ are refused outright rather than silently skipped.

import { execSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const arg = (name) => process.argv.includes(name);
const QUIET = arg("--quiet");

const run = (cmd, { capture = true } = {}) => {
  const r = spawnSync(cmd, { shell: true, encoding: "utf8" });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim(), code: r.status };
};

const results = [];
const record = (name, ok, detail = "", fix = "") => {
  results.push({ name, ok, detail, fix });
  if (!QUIET) console.log(`${ok ? "ok  " : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
  if (!ok && fix && !QUIET) console.log(`      fix: ${fix}`);
};

// --- what the gates can even see -------------------------------------------

// Untracked content is invisible to member-check (it reads git-tracked paths)
// and, without an install, to the science and conformance passes. Both report
// success on the tree they can see, which is the failure this check exists for.
const untracked = run("git ls-files --others --exclude-standard -- packages/")
  .out.split("\n")
  .filter(Boolean);
if (untracked.length) {
  record(
    "visibility",
    false,
    `${untracked.length} untracked path(s) under packages/`,
    "git add them -- member-check reads git-tracked paths and will report the OLD counts on an untracked package",
  );
  for (const u of untracked.slice(0, 5)) console.log(`        ${u}`);
  if (untracked.length > 5) console.log(`        ... and ${untracked.length - 5} more`);
} else {
  record("visibility", true, "no untracked paths under packages/");
}

if (!existsSync("node_modules/@chbrain")) {
  record(
    "workspace",
    false,
    "no workspace links",
    "npm install -- without it the science and conformance passes scan nothing",
  );
} else {
  record("workspace", true, "linked");
}

// Stop here if the gates cannot see the tree. Everything below would run
// against an incomplete picture and report success on it, which is the exact
// failure this script exists to prevent -- and it would take a minute of suite
// time to produce an answer that means nothing.
if (results.some((r) => !r.ok)) {
  console.log("\n--- paste this ---");
  console.log(
    results
      .map((r) => `${r.ok ? "ok" : "FAIL"} ${r.name}${r.detail ? ` (${r.detail})` : ""}`)
      .join("\n"),
  );
  console.log(
    "\nStopped: the gates cannot see the whole tree, so no other result here would mean anything.",
  );
  console.log("------------------");
  process.exit(1);
}

// --- the walls --------------------------------------------------------------

const fmt = run("npx prettier --check . 2>&1");
record("format", fmt.ok, "", "npx prettier --write .");

const sci = run("npx khai-tests science verify 2>&1");
record("science index", sci.ok, "", "npx khai-tests science build");
if (!sci.ok && !QUIET)
  console.log(
    sci.out
      .split("\n")
      .slice(0, 4)
      .map((l) => `      ${l}`)
      .join("\n"),
  );

const member = run("npx khai-guard member-check 2>&1");
const counts = /(\d+) engine\(s\), (\d+) member\(s\)/.exec(member.out);
record("member scope", member.ok, counts ? `${counts[1]} engines, ${counts[2]} members` : "");

const license = run("npx khai-guard license-check 2>&1");
record("license", license.ok);

const lock = run("npx khai-guard lockfile-check 2>&1");
record("lockfile", lock.ok);

const test = run("npx vitest run 2>&1");
const tests = /Tests\s+(?:(\d+) failed \| )?(\d+) passed(?: \| (\d+) skipped)?/.exec(test.out);
record(
  "suite",
  test.ok,
  tests
    ? `${tests[2]} passed${tests[3] ? `, ${tests[3]} skipped` : ""}${tests[1] ? `, ${tests[1]} FAILED` : ""}`
    : "",
);
if (!test.ok && !QUIET) {
  const fails = test.out
    .split("\n")
    .filter((l) => /^\s+×/.test(l))
    .slice(0, 8);
  console.log(fails.map((l) => `      ${l.trim()}`).join("\n"));
}

// --- the paste block --------------------------------------------------------

const failed = results.filter((r) => !r.ok);
const line = (r) => `${r.ok ? "ok" : "FAIL"} ${r.name}${r.detail ? ` (${r.detail})` : ""}`;

console.log("\n--- paste this ---");
console.log(results.map(line).join("\n"));
console.log(
  failed.length
    ? `\n${failed.length} gate(s) failed. Do not report this as passing.`
    : "\nAll gates pass. Counts above are measured, not estimated -- copy them rather than writing your own.",
);
console.log("------------------");

process.exit(failed.length ? 1 : 0);
