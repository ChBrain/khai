// The gates manifest, held against the workflow that actually runs it.
//
// khai-cultures' own preflight.mjs (retired when that house adopted `khai-tests
// gates`) re-derived its CI job list from ci.yml every run, and its own comment
// said why: a "gates" array a house hand-maintains is a second copy of what
// jobs.yml already says, and a second copy of one truth is the failure this
// house had already had once. That house rebuilt the same wall on its own; this
// module is it, lifted so no house rebuilds it a third time.
//
// The correspondence runs both ways, which is stricter than the retired
// preflight ever checked: a job with no gate is invisible to `npm run gates`
// (green on a wall CI runs and this never asks), and a gate with no job is dead
// weight nobody's CI exercises (green on a wall nothing ever runs against a real
// push). Either direction alone would have missed one of the two failures this
// wall exists to name.
//
// A house's own naming rarely lines up letter for letter with its job ids --
// `khai-guard` the job against `branch-check` the gate, one job running several
// gates as steps -- so the match is declared where it does not fall out of the
// name automatically: `ciPolicy` in khai-guard.config.json, `only` for a job
// with no local equivalent to run (a hosted scan, a release step gated on a
// secret) and `split` for one job that runs several gates as steps. A gate may
// also declare its own `job`, which wins over the name match.
//
// Parsed with a regex over the YAML rather than a parser dependency: the job
// list preflight needed was every 2-space-indented key under `jobs:`, and
// nothing here reads deeper than that.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { findGuardConfig } from "./guard-config.mjs";
import { loadGates } from "./gates.mjs";

const DEFAULT_WORKFLOW = ".github/workflows/ci.yml";

/** khai-<x> -> x, lowercased and stripped to alphanumerics, so "khai-branch-
 * scope" reads as "branchscope" against a gate named "branch-scope" without
 * either side's own spelling of hyphen, space or case mattering. */
function normalize(name) {
  return String(name ?? "")
    .toLowerCase()
    .replace(/^khai-?/, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Every job id under `jobs:` in a workflow file -- a 2-space-indented key, the
 * shape every khai CI workflow uses at that level (no anchors, aliases or flow
 * mappings there). */
function parseJobIds(yaml) {
  const lines = String(yaml).split("\n");
  const jobs = [];
  let inJobs = false;
  for (const line of lines) {
    if (/^jobs:\s*$/.test(line)) {
      inJobs = true;
      continue;
    }
    if (!inJobs) continue;
    const m = line.match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
    if (m) jobs.push(m[1]);
  }
  return jobs;
}

/** `ciPolicy` from the nearest khai-guard.config.json, or `{}` for a house with
 * no config, no key, or a config that will not parse -- the same "declares
 * nothing, gets a finding rather than a crash" shape `loadGates` already uses. */
function loadCiPolicy(root) {
  const path = findGuardConfig(root);
  if (!path) return {};
  try {
    const config = JSON.parse(readFileSync(path, "utf8"));
    return config?.ciPolicy && typeof config.ciPolicy === "object" ? config.ciPolicy : {};
  } catch {
    return {};
  }
}

/**
 * Every gate a house declares, held against every job id its CI workflow
 * declares. `[]` is clean; anything else is a finding, never a crash -- a
 * missing workflow or a workflow that parses to zero jobs is reported the same
 * way as a real mismatch, because both are "this wall found nothing to check",
 * and green on that is the failure mode a gates wall meets first.
 *
 * @param {string} root
 * @returns {{job: string|null, gate: string|null, reason: string}[]}
 */
export function verifyGatesAgainstCi(root) {
  const gates = loadGates(root);
  const policy = loadCiPolicy(root);
  const workflowRel =
    typeof policy.workflow === "string" && policy.workflow ? policy.workflow : DEFAULT_WORKFLOW;
  const workflowPath = join(root, workflowRel);

  if (!existsSync(workflowPath)) {
    return [{ job: null, gate: null, reason: `no workflow at ${workflowRel}` }];
  }

  const jobs = parseJobIds(readFileSync(workflowPath, "utf8"));
  if (jobs.length === 0) {
    // Anti-vacuous, the same shape the retired preflight refused to pass on: a
    // parse that finds nothing must not read as a house with nothing to check.
    return [{ job: null, gate: null, reason: `parsed 0 job id(s) from ${workflowRel}` }];
  }

  const only = new Set((Array.isArray(policy.only) ? policy.only : []).map(normalize));
  const split = policy.split && typeof policy.split === "object" ? policy.split : {};
  const gateNames = new Set(gates.map((g) => g?.name).filter(Boolean));
  const claimed = new Set();
  const findings = [];

  for (const job of jobs) {
    if (only.has(normalize(job))) continue; // declared CI-only: no local gate owed

    if (Object.prototype.hasOwnProperty.call(split, job)) {
      const names = Array.isArray(split[job]) ? split[job] : [];
      const missing = names.filter((n) => !gateNames.has(n));
      // Claim whichever named gates DO exist even when the split is short one --
      // they are still spoken for by this job, and leaving them unclaimed would
      // double-report the same gap as both "job under-covered" and "gate with no
      // job", which is one finding read twice.
      for (const n of names) if (gateNames.has(n)) claimed.add(n);
      if (names.length === 0 || missing.length > 0) {
        findings.push({
          job,
          gate: null,
          reason:
            names.length === 0
              ? `ciPolicy.split names no gates for this job`
              : `ciPolicy.split runs this job through ${names.join(", ")}, and ` +
                `${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} not declared in "gates"`,
        });
      }
      continue;
    }

    const explicit = gates.find((g) => typeof g?.job === "string" && g.job === job);
    if (explicit) {
      claimed.add(explicit.name);
      continue;
    }

    const byName = gates.find(
      (g) =>
        !claimed.has(g?.name) &&
        !(typeof g?.job === "string" && g.job) &&
        g?.name &&
        normalize(g.name) === normalize(job),
    );
    if (byName) {
      claimed.add(byName.name);
      continue;
    }

    findings.push({
      job,
      gate: null,
      reason:
        "no gates entry matches this job -- name one to match, give it an explicit " +
        '"job", cover it under ciPolicy.split, or list it in ciPolicy.only',
    });
  }

  for (const gate of gates) {
    if (!gate?.name || claimed.has(gate.name)) continue;
    if (typeof gate.job === "string" && gate.job) {
      findings.push({
        job: null,
        gate: gate.name,
        reason: `declares job "${gate.job}", which is not a job id in ${workflowRel}`,
      });
      continue;
    }
    findings.push({
      job: null,
      gate: gate.name,
      reason: `no job id in ${workflowRel} matches this gate's name`,
    });
  }

  return findings;
}

/** Render findings for a terminal. Pure: findings in, text out. */
export function renderCiCheck(findings) {
  if (!findings.length) {
    return "khai-tests gates verify-ci: every declared gate matches a job, and every job matches a gate.";
  }
  const lines = [`khai-tests gates verify-ci: ${findings.length} finding(s).`, ""];
  for (const f of findings) {
    const where = f.job ? `job "${f.job}"` : `gate "${f.gate}"`;
    lines.push(`  - ${where}: ${f.reason}`);
  }
  return lines.join("\n");
}
