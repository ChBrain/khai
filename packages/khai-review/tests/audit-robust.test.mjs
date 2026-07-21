// The audit CLI upgraded to the harness: reviewCard/reviewMarkdown run each
// rubric through reviewRobust when given thresholds (consensus, skeptic, anchor),
// and the CLI resolves the house's rubrics from its management positions when the
// manifest asks. Judges are injected, so the walker tests need no model; the CLI
// spawn test uses the mock judge (KHAI_REVIEW_MOCK).

import { describe, it, expect, afterEach } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { reviewCard, reviewMarkdown } from "../index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const cliPath = join(here, "..", "cli.mjs");
const ROBUST_DORMANT = !readFileSync(join(here, "..", "index.mjs"), "utf8").includes(
  "robust = null",
);
const CLI_DORMANT = !readFileSync(cliPath, "utf8").includes("fromPositions");

const R = { id: "r", instruction: "flag it" };
const flag = async () => ({ verdict: "flag", suggestion: "s", reason: "why" });

describe.skipIf(ROBUST_DORMANT)("reviewCard / reviewMarkdown: robust option", () => {
  const card = { line_of_work: "the prose to review" };
  const md = "# X: Y\n\n## Projection\n\nthe prose to review\n";

  it("reviewCard confirms a flag on consensus when given thresholds", async () => {
    const flags = await reviewCard({ card }, flag, [R], process.cwd(), null, { n: 3, k: 2 });
    expect(flags).toHaveLength(1);
    expect(flags[0].verdict).toBe("flag");
    expect(flags[0].where).toBe("card.line_of_work");
  });

  it("reviewCard drops a finding below the consensus threshold", async () => {
    let i = 0;
    const judge = async () =>
      i++ === 0 ? { verdict: "flag", suggestion: "s", reason: "w" } : { verdict: "pass" };
    const flags = await reviewCard({ card }, judge, [R], process.cwd(), null, { n: 3, k: 2 });
    expect(flags).toEqual([]);
  });

  it("reviewCard stays single-shot when no thresholds are given (back-compat)", async () => {
    const flags = await reviewCard({ card }, flag, [R]);
    expect(flags).toHaveLength(1);
  });

  it("reviewMarkdown runs robust over the H2 sections", async () => {
    const flags = await reviewMarkdown("f.md", md, flag, [R], process.cwd(), "f.md", {
      n: 3,
      k: 2,
    });
    expect(flags).toHaveLength(1);
    expect(flags[0].where).toContain("Projection");
  });
});

describe.skipIf(CLI_DORMANT)("khai-review CLI: fromPositions resolves the house's rubrics", () => {
  let dir;
  afterEach(() => dir && rmSync(dir, { recursive: true, force: true }));

  it("resolves position rubrics from management/ and runs to an advisory exit 0", () => {
    dir = mkdtempSync(join(tmpdir(), "khai-audit-pos-"));
    // A target the CLI can review: the repo root's own khai card.
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        name: "t",
        version: "0.0.0",
        khai: { engine: "t", card: { line_of_work: "this is really just filler padding" } },
      }),
    );
    // The house's team: one position yields one rubric.
    mkdirSync(join(dir, "management"), { recursive: true });
    writeFileSync(
      join(dir, "management", "position_roadie.md"),
      '---\nkhai: position\ntitle: "The Roadie"\n---\n\n# Position: The Roadie\n\n## Drives\n\nthe chain stays current\n',
    );
    mkdirSync(join(dir, "audit", "house"), { recursive: true });
    const manifest = join(dir, "audit", "house", "audit.json");
    writeFileSync(
      manifest,
      JSON.stringify({
        id: "house",
        review: { fromPositions: true, thresholds: { n: 1, k: 1 }, targets: ["."] },
      }),
    );

    const r = spawnSync(process.execPath, [cliPath, "--manifest", manifest], {
      cwd: dir,
      encoding: "utf8",
      env: { ...process.env, KHAI_REVIEW_MOCK: "1" },
    });
    expect(r.status).toBe(0); // advisory, always exit 0
    expect(r.stdout).toMatch(/khai-review\[house\]/); // ran the audit
    // The mock judge flags filler; with the position rubric resolved and n=1 k=1,
    // the filler card chapter surfaces a finding tagged to the roadie rubric.
    const log = readFileSync(join(dir, "audit", "house", "log.md"), "utf8");
    expect(log).toContain("roadie");
  });
});
