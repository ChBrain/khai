// Rule 3's second half, computed -- and computed at the altitude the lanes allow.
//
// AGENTS.md: "Source and tests are separate PRs. Land source first; tests are
// dormant until it does." The first half is enforced. The second was not checked
// at all until #1508, and five packages had drifted, the oldest by a month.
//
// #1508's answer was a BASELINE list, and that answer was structurally wrong. A
// new package's source PR rides `engine/<name>` or `composite/<name>`; this file
// is governance. The lane wall forbids the reach -- correctly -- so the PR that
// creates a package can neither ship its tests (source and test cannot share a
// branch) nor baseline itself. Every new package was unlandable. The list only
// ever worked for debt that already existed, which is the one case it was
// written against.
//
// So the exemption is computed instead of listed, and the line it computes is
// publication:
//
//   released (a CHANGELOG.md exists), no tests  -> FAIL. Nothing reaches the
//       registry unwitnessed. This is irreversible in a way a branch is not.
//   unreleased, no tests                        -> NOTE. Rule 3's window, and
//       no wider: the note fires on every `npm run gates` until the tests land.
//
// The note is the load-bearing half, and it only works now. When the five drifted
// there was no audible warning anywhere: vitest's reporter dropped a passing
// test's console (#1507) and the gates runner dropped a passing wall's output
// (#1514). Two of those five were released and would fail here; the other three
// were unreleased and would have been nagged about on every run instead of
// sitting silent for weeks.
import { describe, it, expect } from "vitest";
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** Every package that declares a khai engine, with whether it ships tests and
 * whether it has ever been released. changesets writes CHANGELOG.md on the first
 * publish and never before it, so its presence is the publication line -- and it
 * is readable in a shallow checkout, which a git-history probe is not: CI's test
 * job checks out at depth 1. */
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
      out.push({
        id: `${kind}/${d.name}`,
        tested,
        released: existsSync(join(dir, "CHANGELOG.md")),
      });
    }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

const PACKAGES = packages();
const UNTESTED = PACKAGES.filter((p) => !p.tested);

describe("every published package is witnessed by its own tests", () => {
  // Green on an empty collection is how a wall stops being a wall: with no
  // packages found, UNTESTED is [] and the rule below passes saying nothing.
  it("finds the packages, so an empty result means no debt and not no data", () => {
    expect(PACKAGES.length).toBeGreaterThan(300);
    expect(PACKAGES.filter((p) => p.tested).length).toBeGreaterThan(300);
    // Both sides of the publication line must be populated, or the split is
    // measuring nothing and the fail tier could be empty for the wrong reason.
    expect(PACKAGES.filter((p) => p.released).length).toBeGreaterThan(100);
    expect(PACKAGES.filter((p) => !p.released).length).toBeGreaterThan(10);
  });

  it("ships no RELEASED package without a test file", () => {
    const offenders = UNTESTED.filter((p) => p.released).map((p) => p.id);
    expect(
      offenders,
      offenders.length
        ? `Released package(s) with no tests/*.test.mjs: ${offenders.join(", ")}. ` +
            "These are on the registry. Rule 3's window closed at publish -- write " +
            "the tests on the package's own lane."
        : undefined,
    ).toEqual([]);
  });

  it("notes an unreleased package still inside rule 3's window", () => {
    const pending = UNTESTED.filter((p) => !p.released).map((p) => p.id);
    // A note, not a failure: the PR that creates a package cannot carry its
    // tests, so failing here would make every new package unlandable -- which is
    // exactly the bug this file replaces. It fires on every run until the second
    // PR lands, and it is audible (#1507, #1514) in a way it was not before.
    if (pending.length)
      console.warn(
        `untested-packages: ${pending.length} package(s) awaiting their rule 3 tests PR: ` +
          `${pending.join(", ")}`,
      );
    expect(true).toBe(true);
  });
});
