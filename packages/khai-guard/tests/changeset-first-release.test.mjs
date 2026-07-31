import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as guard from "../index.mjs";

// Dormant until the source PR lands. `changesetCheck` gains a `packages` input —
// the workspace's own view of itself, one record per publishable package — and
// with it two per-package rules: the first-release rule (a package that has never
// been published must declare no bump, because `changeset version` bumps FROM the
// manifest version and would publish the first release one step above it), and
// the ships-nothing rule judged per package rather than against the repository
// root. Probe the source for the new-behaviour sentinel so this suite stays green
// on a main that has neither. (The source/test-split rule: tests dormant, source
// second.)
const srcPath = join(dirname(fileURLToPath(import.meta.url)), "..", "index.mjs");
const DORMANT = !readFileSync(srcPath, "utf8").includes("never been published");

const { changesetCheck } = guard;

// A two-package workspace: one released with a known shipped set, one brand new.
const PACKAGES = [
  {
    name: "@scope/shipped",
    shipped: ["packages/shipped/package.json", "packages/shipped/index.mjs"],
    released: true,
  },
  { name: "@scope/fresh", shipped: ["packages/fresh/package.json"], released: false },
];

const cs = (pkg, level) => [{ file: ".changeset/x.md", entries: [{ package: pkg, level }] }];
const emptyCs = [{ file: ".changeset/e.md", entries: [] }];
const touch = (path, status = "M") => [{ status, path }];

describe.skipIf(DORMANT)("changesetCheck: the first-release rule", () => {
  it("flags a patch changeset on a package that has never been published", () => {
    const r = changesetCheck({
      changed: touch("packages/fresh/index.mjs", "A"),
      changesets: cs("@scope/fresh", "patch"),
      packages: PACKAGES,
    });
    expect(r.ok).toBe(false);
    expect(r.violations.join("\n")).toMatch(/never been published/);
    expect(r.violations.join("\n")).toMatch(/@scope\/fresh/);
  });

  it("flags a minor just the same — any level skips the initial version", () => {
    const r = changesetCheck({
      changed: touch("packages/fresh/index.mjs", "A"),
      changesets: cs("@scope/fresh", "minor"),
      packages: PACKAGES,
    });
    expect(r.ok).toBe(false);
    expect(r.violations.join("\n")).toMatch(/never been published/);
  });

  it("allows an empty changeset on a new package: the manifest version ships as-is", () => {
    const r = changesetCheck({
      changed: [
        { status: "A", path: "packages/fresh/index.mjs" },
        { status: "A", path: ".changeset/e.md" },
      ],
      changesets: emptyCs,
      packages: PACKAGES,
    });
    expect(r.ok).toBe(true);
  });

  it("names every unreleased package once, however many changesets bump it", () => {
    const r = changesetCheck({
      changed: touch("packages/fresh/index.mjs", "A"),
      changesets: [
        { file: ".changeset/a.md", entries: [{ package: "@scope/fresh", level: "patch" }] },
        { file: ".changeset/b.md", entries: [{ package: "@scope/fresh", level: "patch" }] },
      ],
      packages: PACKAGES,
    });
    const hits = r.violations.filter((v) => /never been published/.test(v));
    expect(hits).toHaveLength(1);
    expect(hits[0].match(/@scope\/fresh/g)).toHaveLength(1);
  });

  it("leaves a package the workspace does not know alone", () => {
    const r = changesetCheck({
      changed: touch("packages/shipped/index.mjs"),
      changesets: cs("@other/elsewhere", "patch"),
      packages: PACKAGES,
    });
    expect(r.ok).toBe(true);
  });
});

describe.skipIf(DORMANT)("changesetCheck: the ships-nothing rule, per package", () => {
  it("allows a release that changes that package's own shipped content", () => {
    const r = changesetCheck({
      changed: touch("packages/shipped/index.mjs"),
      changesets: cs("@scope/shipped", "patch"),
      packages: PACKAGES,
    });
    expect(r.ok).toBe(true);
  });

  it("flags a release that changes nothing under that package's files", () => {
    const r = changesetCheck({
      changed: touch("packages/shipped/tests/x.test.mjs"),
      changesets: cs("@scope/shipped", "patch"),
      packages: PACKAGES,
    });
    expect(r.ok).toBe(false);
    expect(r.violations.join("\n")).toMatch(/republish identical content and drift/);
  });

  it("is not fooled by a sibling package's content changing", () => {
    // The old root-level rule matched any shipped path anywhere; per package,
    // touching `fresh` must not license a release of `shipped`.
    const r = changesetCheck({
      changed: touch("packages/fresh/package.json"),
      changesets: cs("@scope/shipped", "patch"),
      packages: PACKAGES,
    });
    expect(r.ok).toBe(false);
    expect(r.violations.join("\n")).toMatch(/@scope\/shipped/);
  });

  it("stays off for a package with no files field (shipped set unknown)", () => {
    const r = changesetCheck({
      changed: touch("anywhere.md"),
      changesets: cs("@scope/nofiles", "patch"),
      packages: [{ name: "@scope/nofiles", shipped: [], released: true }],
    });
    expect(r.ok).toBe(true);
  });

  it("does not double-report: a first release is not also a ships-nothing finding", () => {
    const r = changesetCheck({
      changed: touch("unrelated.md"),
      changesets: cs("@scope/fresh", "patch"),
      packages: PACKAGES,
    });
    expect(r.violations).toHaveLength(1);
    expect(r.violations[0]).toMatch(/never been published/);
  });
});

describe.skipIf(DORMANT)("changesetCheck: the single-package house is unchanged", () => {
  it("falls back to the root shipped set when no packages are given", () => {
    const r = changesetCheck({
      changed: touch("docs/x.md"),
      changesets: cs("@scope/house", "patch"),
      shipped: ["package.json", "misfits/**"],
    });
    expect(r.ok).toBe(false);
    expect(r.violations.join("\n")).toMatch(/republish identical content and drift/);
  });

  it("does not run the root rule twice when packages are given", () => {
    // `packages` supersedes the flat root set; the finding must come from the
    // per-package pass only, not from both.
    const r = changesetCheck({
      changed: touch("packages/shipped/tests/x.test.mjs"),
      changesets: cs("@scope/shipped", "patch"),
      shipped: ["package.json", "packages/**"],
      packages: PACKAGES,
    });
    expect(r.violations.filter((v) => /republish identical content/.test(v))).toHaveLength(1);
  });
});
