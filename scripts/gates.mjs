#!/usr/bin/env node
// `npm run gates` -- every wall this repo has, in one command, with one exit
// code and a summary built to be pasted into a pull request.
//
// The logic is no longer here. It is `src/gates.mjs` in @chbrain/khai-tests,
// lifted out of this file so every khai house runs one runner instead of
// hand-maintaining its own: khai-cultures built a second one from the same idea
// and it drifted from that house's CI without anybody noticing, because two
// implementations of one rule is two things to get wrong and only one of them is
// read. The walls themselves are declared in the `gates` key of
// khai-guard.config.json, beside the lanes and the policies, so this repo's list
// of walls is data the runner reads rather than code only this file has.
//
// What stays here is the entry point and nothing else: `npm run gates` is the
// command a handover names, and the block it prints is what an author pastes
// into a pull request instead of claiming the gates passed.
//
// One behaviour changed with the lift and it is worth knowing. The old script
// treated the workspace-link check as a pre-check and stopped on it, exactly as
// it stopped on visibility. The runner stops only on visibility, which is the
// tree it cannot SEE; `workspace` is now a declared wall like any other, so an
// unlinked install fails loudly and the rest of the pass still runs and costs a
// minute. That is the honest side of the trade: the verdict is still red and the
// record still names the fix, which is what a reader needs.

import { loadGates, runGates, renderGates, gateLine } from "../packages/khai-tests/index.mjs";

const root = process.cwd();
const quiet = process.argv.includes("--quiet");

const run = runGates(root, {
  gates: loadGates(root),
  onRecord: quiet ? undefined : (record) => console.log(gateLine(record)),
});

console.log(`\n${renderGates(run.results)}`);
process.exit(run.ok ? 0 : 1);
