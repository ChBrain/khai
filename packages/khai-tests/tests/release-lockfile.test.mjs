// The release keeps the lockfile with the versions it sets.
//
// `changeset version` bumps every released package's package.json and never
// touches package-lock.json, so each release used to leave the lockfile a
// version behind -- khai-tests 0.2.6 against a 0.2.7 manifest, and the same for
// every workspace range pointing at it. It is not a one-off somebody forgot: the
// changesets action rebuilds the release branch from scratch whenever main
// moves, so hand-fixing one release does nothing for the next.
//
// The fix is in the version command the action runs (`version-script: npm run
// version` in .github/workflows/release.yml), which is this repo's root
// `version` script.
// These tests pin that, and pin the invariant it exists to keep.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const read = (rel) => JSON.parse(readFileSync(join(REPO, rel), "utf8"));

describe("release: the version script syncs the lockfile", () => {
  it("runs changeset version and then rewrites the lockfile", () => {
    const script = read("package.json").scripts.version;
    expect(script).toMatch(/changeset version/);
    // --package-lock-only: update the lockfile from the manifests without
    // touching node_modules, which is all a version run needs.
    expect(script).toMatch(/npm install --package-lock-only/);
  });

  it("is the command the release workflow actually invokes, under the input name v2 wants", () => {
    // If the workflow stopped calling `npm run version`, the script above would
    // still look right and would never run.
    //
    // The INPUT NAME is pinned too, and deliberately: changesets/action v2
    // renamed `version` to `version-script` and fails outright under the old
    // name rather than falling back. Four consecutive khai releases died that
    // way with `npm test` green in each, because this assertion was written
    // against v1 and matched the very spelling that was broken. A test that
    // pins a contract has to be re-pinned when the contract moves; leaving it
    // on the old name made it certify the failure.
    const wf = readFileSync(join(REPO, ".github/workflows/release.yml"), "utf8");
    expect(wf).toMatch(/version-script:\s*npm run version/);
    expect(wf).toMatch(/publish-script:\s*npm run release/);
  });
});

describe("release: the lockfile agrees with the manifests", () => {
  // The invariant the script exists to keep. This fails on a release branch
  // built before the fix, which is the point: the drift is visible rather than
  // discovered later by a confused install.
  it("records every workspace package at its manifest version", () => {
    const lock = read("package-lock.json");
    const drift = [];
    for (const kind of ["engines", "composites"]) {
      const dir = join(REPO, "packages", kind);
      if (!existsSync(dir)) continue;
      for (const name of readdirSync(dir)) {
        const rel = `packages/${kind}/${name}`;
        const entry = lock.packages?.[rel];
        if (!entry || !existsSync(join(REPO, rel, "package.json"))) continue;
        const manifest = read(`${rel}/package.json`).version;
        if (entry.version !== manifest) drift.push(`${rel}: lock ${entry.version} vs ${manifest}`);
      }
    }
    for (const rel of Object.keys(lock.packages ?? {})) {
      if (!rel.startsWith("packages/khai-")) continue;
      if (!existsSync(join(REPO, rel, "package.json"))) continue;
      const manifest = read(`${rel}/package.json`).version;
      const entry = lock.packages[rel];
      if (entry.version && entry.version !== manifest) {
        drift.push(`${rel}: lock ${entry.version} vs ${manifest}`);
      }
    }
    expect(drift).toEqual([]);
  });
});
