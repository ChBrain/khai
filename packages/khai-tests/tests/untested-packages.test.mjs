// Rule 3's second half, computed.
//
// AGENTS.md: "Source and tests are separate PRs. Land source first; tests are
// dormant until it does." The first half is enforced -- khai-guard refuses a
// branch that mixes the two, and a push that tries is rejected. Nothing has ever
// checked that the second PR arrived.
//
// So it stopped arriving. Five packages are in the tree with no test file of
// their own, the oldest for a month:
//
//   2026-08-04  composites/neighborhood-cycle   (#1087)
//   2026-08-10  composites/grapevine            (#1170)
//   2026-08-25  engines/disability              (#1378)
//   2026-08-30  composites/depression           (#1439)
//   2026-08-30  engines/anhedonia               (#1436)
//
// depression is published at 0.1.1. package-loads.test.mjs imports and composes
// every package centrally, so none of the five is unwitnessed -- but each is
// missing the per-package conformance test its 376 siblings carry, the one that
// asserts the manifest's own claims: the root, the movement set, the counts a
// quiet merge would erode.
//
// BASELINE is a ratchet, in the shape science-overlap-wall.test.mjs already
// uses: the known five pass, a sixth fails, and a package that gains its tests
// is warned about rather than failed, because the PR that writes those tests
// rides the package's own lane and cannot edit this governance file.
import { describe, it, expect } from "vitest";
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

// Prune an entry here in a governance sweep once the package's own lane has
// landed its tests. Never add one to make a red main green: a new package
// without tests is the debt this file exists to stop.
const BASELINE = [].sort();

/** Every package that declares a khai engine, and whether it carries its own tests. */
function packages() {
  const out = [];
  for (const kind of ["engines", "composites"]) {
    const base = join(REPO, "packages", kind);
    if (!existsSync(base)) continue;
    for (const d of readdirSync(base, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const dir = join(base, d.name);
      const manifestPath = join(dir, "package.json");
      if (!existsSync(manifestPath)) continue;
      if (!JSON.parse(readFileSync(manifestPath, "utf8")).khai?.engine) continue;
      const testDir = join(dir, "tests");
      // A tests/ directory holding no .test.mjs is the same silence as no
      // directory at all, and reads as coverage to anyone listing the tree.
      const tested =
        existsSync(testDir) && readdirSync(testDir).some((f) => f.endsWith(".test.mjs"));
      out.push({ id: `${kind}/${d.name}`, tested });
    }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

const PACKAGES = packages();
const UNTESTED = PACKAGES.filter((p) => !p.tested).map((p) => p.id);

describe("every published package is witnessed by its own tests", () => {
  // Green on an empty collection is how a wall stops being a wall: with no
  // packages found, UNTESTED is [] and the rule below passes saying nothing.
  it("finds the packages, so an empty result means no debt and not no data", () => {
    expect(PACKAGES.length).toBeGreaterThan(300);
    expect(PACKAGES.filter((p) => p.tested).length).toBeGreaterThan(300);
  });

  it("carries no package without a test file outside BASELINE", () => {
    const unbaselined = UNTESTED.filter((id) => !BASELINE.includes(id));
    expect(
      unbaselined,
      unbaselined.length
        ? `Package(s) with no tests/*.test.mjs: ${unbaselined.join(", ")}. ` +
            "Rule 3 lands source first and tests second -- this is the second " +
            "PR, on the package's own lane. Do not add the package to BASELINE: " +
            "that list only shrinks."
        : undefined,
    ).toEqual([]);
  });

  it("warns on stale BASELINE entries (pruned by a governance sweep, never a wall)", () => {
    const stale = BASELINE.filter((id) => !UNTESTED.includes(id));
    // A warning, not a failure: the PR that writes a package's tests rides that
    // package's lane, and the lane wall forbids it touching this file. Failing
    // here would demand a change the fixing branch is not allowed to carry.
    if (stale.length)
      console.warn(
        `untested-packages: stale BASELINE entr${stale.length === 1 ? "y" : "ies"} ` +
          `(now tested -- prune in a governance sweep): ${stale.join(", ")}`,
      );
    expect(true).toBe(true);
  });
});
