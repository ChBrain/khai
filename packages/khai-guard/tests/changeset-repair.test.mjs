import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as guard from "../index.mjs";

// Dormant until the source PR lands. The ships-nothing rules stop counting a
// changeset the PR merely EDITS as release intent: the bump stands on the base
// and belongs to the PR that added it, so repairing a wrong package name or a
// typo no longer reads as a release this diff must justify with shipped content.
// Probe the source for the new-behaviour sentinel so this suite stays green on a
// main that has neither. (The source/test-split rule: tests dormant, source
// second.)
const srcPath = join(dirname(fileURLToPath(import.meta.url)), "..", "index.mjs");
const DORMANT = !readFileSync(srcPath, "utf8").includes("not new release intent");

const { changesetCheck } = guard;

const SHIPPED = ["misfits/**", "registry.json", "README.md"];
const PACKAGES = [
  { name: "@scope/house", shipped: ["misfits/**", "registry.json"], released: true },
];

const bump = (file, added, level = "minor", pkg = "@scope/house") => ({
  file,
  added,
  entries: [{ package: pkg, level }],
});
const empty = (file, added = true) => ({ file, added, entries: [] });

describe.skipIf(DORMANT)("changesetCheck: an edited changeset is a repair", () => {
  it("allows a PR that repairs a releasing changeset and ships no content", () => {
    // The khai-misfits case: seven changesets named the package unscoped, so
    // every release threw. The repair edits them, touches nothing under `files`,
    // and carries an empty changeset of its own.
    const r = changesetCheck({
      changed: [
        { status: "M", path: ".changeset/add-the-sort.md" },
        { status: "A", path: ".changeset/fix-names.md" },
      ],
      changesets: [bump(".changeset/add-the-sort.md", false), empty(".changeset/fix-names.md")],
      shipped: SHIPPED,
    });
    expect(r.ok).toBe(true);
  });

  it("still fails a PR that ADDS a releasing changeset and ships no content", () => {
    const r = changesetCheck({
      changed: [
        { status: "M", path: "docs/x.md" },
        { status: "A", path: ".changeset/new.md" },
      ],
      changesets: [bump(".changeset/new.md", true, "patch")],
      shipped: SHIPPED,
    });
    expect(r.ok).toBe(false);
    expect(r.violations.join("\n")).toMatch(/republish identical content and drift/);
  });

  it("treats a record with no `added` flag as added, so old callers are unchanged", () => {
    const r = changesetCheck({
      changed: [{ status: "M", path: "docs/x.md" }],
      changesets: [{ file: ".changeset/n.md", entries: [{ package: "x", level: "patch" }] }],
      shipped: SHIPPED,
    });
    expect(r.ok).toBe(false);
  });

  it("is not rescued by an edited changeset when the PR also adds a releasing one", () => {
    // One repair plus one genuine new bump: the added one still has to justify
    // itself, so the finding stands.
    const r = changesetCheck({
      changed: [
        { status: "M", path: ".changeset/old.md" },
        { status: "A", path: ".changeset/new.md" },
      ],
      changesets: [bump(".changeset/old.md", false), bump(".changeset/new.md", true)],
      shipped: SHIPPED,
    });
    expect(r.ok).toBe(false);
    expect(r.violations.join("\n")).toMatch(/republish identical content and drift/);
  });
});

describe.skipIf(DORMANT)("changesetCheck: the per-package rule reads added only", () => {
  it("allows repairing a changeset that names a known package, shipping nothing", () => {
    const r = changesetCheck({
      changed: [{ status: "M", path: ".changeset/old.md" }],
      changesets: [bump(".changeset/old.md", false)],
      packages: PACKAGES,
    });
    expect(r.ok).toBe(true);
  });

  it("still flags an added changeset that ships nothing under that package's files", () => {
    const r = changesetCheck({
      changed: [{ status: "A", path: ".changeset/new.md" }],
      changesets: [bump(".changeset/new.md", true)],
      packages: PACKAGES,
    });
    expect(r.ok).toBe(false);
    expect(r.violations.join("\n")).toMatch(/@scope\/house/);
  });

  it("allows an added changeset when that package's own content changed", () => {
    const r = changesetCheck({
      changed: [
        { status: "M", path: "misfits/the_sort/play_the_sort.md" },
        { status: "A", path: ".changeset/new.md" },
      ],
      changesets: [bump(".changeset/new.md", true)],
      packages: PACKAGES,
    });
    expect(r.ok).toBe(true);
  });
});
