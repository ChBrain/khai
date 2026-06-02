#!/usr/bin/env node
// The audit consistency check (the required status). Reads the audit PR's review
// threads and each audit ledger, derives the treatment each finding's thread
// records, runs reconcile, and exits non-zero on any mismatch. No model calls,
// no GitHub calls: the threads are passed in as JSON (the workflow's
// github-script step fetches them), so this stays a pure, fast gate.
//
//   node .github/scripts/audit-consistency.mjs <threads.json> <ledger.json> [<ledger.json> ...]
//
// threads.json: [{ isResolved: bool, comments: [{ body: string }] }]
//   the finding id comes from the marker in the bot's first comment; the
//   treatment from the latest human reply that parses to one (Accept/Reduce/
//   Transfer); resolved from the thread.

import { readFileSync } from "node:fs";
import { findingIdOf, parseTreatment, reconcile } from "../../packages/khai-review/index.mjs";

const [threadsPath, ...ledgerPaths] = process.argv.slice(2);
if (!threadsPath || !ledgerPaths.length) {
  console.error("usage: audit-consistency.mjs <threads.json> <ledger.json> ...");
  process.exit(2);
}

const threads = JSON.parse(readFileSync(threadsPath, "utf8"));
const decisions = [];
for (const t of threads) {
  const comments = t.comments ?? [];
  let id = null;
  for (const c of comments) {
    const f = findingIdOf(c.body);
    if (f) {
      id = f;
      break;
    }
  }
  if (!id) continue; // not a finding thread
  let decision = null;
  for (const c of comments) {
    const d = parseTreatment(c.body);
    if (d) decision = d; // the latest parsing reply wins
  }
  decisions.push({
    id,
    treatment: decision?.treatment,
    resolution: decision?.resolution,
    resolved: Boolean(t.isResolved),
  });
}

const ledger = ledgerPaths.flatMap((p) => JSON.parse(readFileSync(p, "utf8")));
const { ok, blocks } = reconcile(ledger, decisions);

if (!ok) {
  for (const b of blocks) console.error(`✖ ${b.id}: ${b.reason}`);
  console.error(
    `\naudit consistency: ${blocks.length} block(s); the table and the comments disagree.`,
  );
  process.exit(1);
}
console.log(`audit consistency: ${ledger.length} finding(s), the table agrees with the comments.`);
