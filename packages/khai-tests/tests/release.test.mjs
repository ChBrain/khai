// The release workflow calls what changesets/action v2 actually reads.
//
// Dormant until the source lands (tests first, source second). The guard is the
// module's existence rather than a string probe, so the import below is dynamic.
//
// The class: a dependabot bump moved the khai monorepo's release to
// changesets/action v2, which RENAMED its inputs and refuses to run under the
// old names rather than falling back. `npm test` stayed green through four dead
// releases, because the failure sits in the last step of a job whose visible
// work all passes. Two houses raised from this monorepo wrote this exact test
// by hand afterward; this is that test, lifted so a third house does not.

import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "src", "release.mjs");
const DORMANT = !existsSync(SRC);

let verifyRelease, renderRelease;
beforeAll(async () => {
  if (DORMANT) return;
  ({ verifyRelease, renderRelease } = await import(SRC));
});

let tmp;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

const GOOD_STEP = `
      - name: version or publish
        uses: changesets/action@v2
        with:
          version-script: npm run version
          publish-script: npm run release
          github-token: \${{ secrets.RELEASE_TOKEN }}
`;

function house({
  step = GOOD_STEP,
  scripts = { version: "changeset version", release: "changeset publish" },
} = {}) {
  tmp = mkdtempSync(join(tmpdir(), "khai-release-"));
  writeFileSync(
    join(tmp, "package.json"),
    JSON.stringify({ name: "house", version: "0.0.0", scripts }),
  );
  mkdirSync(join(tmp, ".github", "workflows"), { recursive: true });
  writeFileSync(
    join(tmp, ".github", "workflows", "release.yml"),
    `name: release\non:\n  push:\n    branches: [main]\njobs:\n  release:\n    steps:\n      - uses: actions/checkout@v7\n${step}`,
  );
  return tmp;
}

describe.skipIf(DORMANT)("verifyRelease: the workflow calls this house's own scripts", () => {
  it("is clean on a workflow pinned the way v2 requires", () => {
    expect(verifyRelease(house())).toEqual([]);
  });

  it("catches the v1 input names (the outage this wall exists against)", () => {
    const step = `
      - uses: changesets/action@v2
        with:
          version: npm run version
          publish: npm run release
          github-token: \${{ secrets.RELEASE_TOKEN }}
`;
    const findings = verifyRelease(house({ step }));
    expect(findings.some((f) => f.reason.includes("version-script"))).toBe(true);
    expect(findings.some((f) => f.reason.includes("publish-script"))).toBe(true);
  });

  it("catches a named script the workflow points at that does not exist", () => {
    const findings = verifyRelease(house({ scripts: { release: "changeset publish" } }));
    expect(findings.some((f) => f.reason.includes('"version"'))).toBe(true);
  });

  it("catches a GITHUB_TOKEN env var set beside github-token (the second break)", () => {
    const step = `
      - uses: changesets/action@v2
        with:
          version-script: npm run version
          publish-script: npm run release
          github-token: \${{ secrets.RELEASE_TOKEN }}
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
    const findings = verifyRelease(house({ step }));
    expect(findings.some((f) => f.reason.includes("GITHUB_TOKEN"))).toBe(true);
  });

  it("does not fault a GITHUB_TOKEN env var on an earlier, unrelated step", () => {
    // Scoped to the changesets step, and only to it: an `install` step (npm ci
    // reaching a scoped registry) is entitled to its own GITHUB_TOKEN.
    tmp = mkdtempSync(join(tmpdir(), "khai-release-"));
    writeFileSync(
      join(tmp, "package.json"),
      JSON.stringify({
        name: "house",
        version: "0.0.0",
        scripts: { version: "changeset version", release: "changeset publish" },
      }),
    );
    mkdirSync(join(tmp, ".github", "workflows"), { recursive: true });
    writeFileSync(
      join(tmp, ".github", "workflows", "release.yml"),
      `name: release\non: push\njobs:\n  release:\n    steps:\n      - name: install\n        run: npm ci\n        env:\n          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}\n${GOOD_STEP}`,
    );
    expect(verifyRelease(tmp)).toEqual([]);
  });

  it("reports a missing workflow rather than passing on nothing", () => {
    tmp = mkdtempSync(join(tmpdir(), "khai-release-"));
    writeFileSync(join(tmp, "package.json"), JSON.stringify({ name: "house", version: "0.0.0" }));
    const findings = verifyRelease(tmp);
    expect(findings).toHaveLength(1);
    expect(findings[0].reason).toMatch(/no workflow/);
  });

  it("reports a workflow that never invokes changesets/action", () => {
    tmp = mkdtempSync(join(tmpdir(), "khai-release-"));
    writeFileSync(join(tmp, "package.json"), JSON.stringify({ name: "house", version: "0.0.0" }));
    mkdirSync(join(tmp, ".github", "workflows"), { recursive: true });
    writeFileSync(
      join(tmp, ".github", "workflows", "release.yml"),
      "name: release\non: push\njobs:\n  release:\n    steps:\n      - run: echo nothing\n",
    );
    const findings = verifyRelease(tmp);
    expect(findings).toHaveLength(1);
    expect(findings[0].reason).toMatch(/never invokes/);
  });

  it("reads a workflow at a caller-given path", () => {
    tmp = mkdtempSync(join(tmpdir(), "khai-release-"));
    writeFileSync(
      join(tmp, "package.json"),
      JSON.stringify({
        name: "house",
        version: "0.0.0",
        scripts: { version: "changeset version", release: "changeset publish" },
      }),
    );
    mkdirSync(join(tmp, ".github", "workflows"), { recursive: true });
    writeFileSync(
      join(tmp, ".github", "workflows", "publish.yml"),
      `jobs:\n  release:\n    steps:\n${GOOD_STEP}`,
    );
    expect(verifyRelease(tmp, { workflow: ".github/workflows/publish.yml" })).toEqual([]);
  });
});

describe.skipIf(DORMANT)("renderRelease", () => {
  it("names a clean run as clean", () => {
    expect(renderRelease([])).toMatch(/own scripts/);
  });

  it("prints every finding", () => {
    const text = renderRelease([{ reason: "some finding" }]);
    expect(text).toMatch(/1 finding/);
    expect(text).toMatch(/some finding/);
  });
});
