// The gates manifest, held against the workflow that actually runs it.
//
// Dormant until the source lands (tests first, source second). The guard is the
// module's existence rather than a string probe, so the import below is dynamic.
//
// The class: khai-cultures' retired preflight.mjs re-derived its CI job list
// from ci.yml because a "gates" array a house hand-maintains is a second copy
// of what jobs.yml already says, and its own comment named the failure --
// a manifest that quietly falls behind ci.yml. That house rebuilt the same wall
// on its own; this is it, lifted so no third house rebuilds it.

import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "src", "ci.mjs");
const DORMANT = !existsSync(SRC);

let verifyGatesAgainstCi, renderCiCheck;
beforeAll(async () => {
  if (DORMANT) return;
  ({ verifyGatesAgainstCi, renderCiCheck } = await import(SRC));
});

let tmp;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/** A workflow with the given 2-space job ids under `jobs:`. */
const workflow = (jobs) =>
  `name: ci\non:\n  push:\n    branches: [main]\n\njobs:\n${jobs
    .map((j) => `  ${j}:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo ${j}\n`)
    .join("")}`;

/** A house: config (gates + optional ciPolicy) at the root, workflow beside it. */
function house({ gates = [], ciPolicy, jobs = [], workflowPath = ".github/workflows/ci.yml" }) {
  tmp = mkdtempSync(join(tmpdir(), "khai-ci-"));
  writeFileSync(
    join(tmp, "khai-guard.config.json"),
    JSON.stringify({ gates, ...(ciPolicy ? { ciPolicy } : {}) }),
  );
  const wfFull = join(tmp, workflowPath);
  mkdirSync(dirname(wfFull), { recursive: true });
  writeFileSync(wfFull, workflow(jobs));
  return tmp;
}

describe.skipIf(DORMANT)("verifyGatesAgainstCi: the manifest matches the workflow", () => {
  it("is clean when every job normalizes to a declared gate name", () => {
    const root = house({
      gates: [{ name: "khai-guard" }, { name: "branch-scope" }],
      jobs: ["khai-guard", "khai-branch-scope"],
    });
    expect(verifyGatesAgainstCi(root)).toEqual([]);
  });

  it("reports a job with no declared gate", () => {
    const root = house({ gates: [], jobs: ["khai-tests"] });
    const findings = verifyGatesAgainstCi(root);
    expect(findings).toHaveLength(1);
    expect(findings[0].job).toBe("khai-tests");
    expect(findings[0].gate).toBeNull();
  });

  it("reports a gate with no matching job", () => {
    const root = house({ gates: [{ name: "stray-wall" }], jobs: ["khai-guard"] });
    const findings = verifyGatesAgainstCi(root);
    expect(findings.map((f) => f.gate)).toContain("stray-wall");
  });

  it("honours ciPolicy.only for a job with no local equivalent", () => {
    const root = house({
      gates: [],
      ciPolicy: { only: ["codeql"] },
      jobs: ["codeql"],
    });
    expect(verifyGatesAgainstCi(root)).toEqual([]);
  });

  it("honours ciPolicy.split for one job running several gates as steps", () => {
    const root = house({
      gates: [{ name: "prettier" }, { name: "suite" }],
      ciPolicy: { split: { "khai-tests": ["prettier", "suite"] } },
      jobs: ["khai-tests"],
    });
    expect(verifyGatesAgainstCi(root)).toEqual([]);
  });

  it("reports a split naming a gate that was not declared", () => {
    const root = house({
      gates: [{ name: "prettier" }],
      ciPolicy: { split: { "khai-tests": ["prettier", "suite"] } },
      jobs: ["khai-tests"],
    });
    const findings = verifyGatesAgainstCi(root);
    expect(findings).toHaveLength(1);
    expect(findings[0].job).toBe("khai-tests");
    expect(findings[0].reason).toMatch(/suite/);
  });

  it("honours a gate's own explicit job over the name match", () => {
    const root = house({
      gates: [{ name: "branch-check", job: "khai-branch-scope" }],
      jobs: ["khai-branch-scope"],
    });
    expect(verifyGatesAgainstCi(root)).toEqual([]);
  });

  it("reports a gate whose declared job is not a real job id", () => {
    const root = house({
      gates: [{ name: "branch-check", job: "no-such-job" }],
      jobs: ["khai-guard"],
    });
    const findings = verifyGatesAgainstCi(root);
    // Two findings: the declared job never claims the real one, and the gate
    // itself is left unmatched under its bogus declaration.
    expect(findings.some((f) => f.gate === "branch-check")).toBe(true);
    expect(findings.some((f) => f.job === "khai-guard")).toBe(true);
  });

  it("reports a workflow that parses to zero jobs rather than passing on nothing", () => {
    tmp = mkdtempSync(join(tmpdir(), "khai-ci-"));
    writeFileSync(join(tmp, "khai-guard.config.json"), JSON.stringify({ gates: [] }));
    mkdirSync(join(tmp, ".github", "workflows"), { recursive: true });
    writeFileSync(join(tmp, ".github", "workflows", "ci.yml"), "name: ci\non: push\n");
    const findings = verifyGatesAgainstCi(tmp);
    expect(findings).toHaveLength(1);
    expect(findings[0].reason).toMatch(/0 job/);
  });

  it("reports a missing workflow rather than passing on nothing", () => {
    tmp = mkdtempSync(join(tmpdir(), "khai-ci-"));
    writeFileSync(join(tmp, "khai-guard.config.json"), JSON.stringify({ gates: [] }));
    const findings = verifyGatesAgainstCi(tmp);
    expect(findings).toHaveLength(1);
    expect(findings[0].reason).toMatch(/no workflow/);
  });

  it("reads ciPolicy.workflow when the workflow lives somewhere else", () => {
    const root = house({
      gates: [{ name: "khai-guard" }],
      ciPolicy: { workflow: ".github/workflows/main.yml" },
      jobs: ["khai-guard"],
      workflowPath: ".github/workflows/main.yml",
    });
    expect(verifyGatesAgainstCi(root)).toEqual([]);
  });
});

describe.skipIf(DORMANT)("renderCiCheck", () => {
  it("names a clean run as clean", () => {
    expect(renderCiCheck([])).toMatch(/every declared gate matches/);
  });

  it("prints every finding, not just the count", () => {
    const findings = [{ job: "khai-tests", gate: null, reason: "no gates entry matches this job" }];
    const text = renderCiCheck(findings);
    expect(text).toMatch(/1 finding/);
    expect(text).toMatch(/khai-tests/);
  });
});
