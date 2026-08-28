// A changeset must name a package the workspace actually has.
//
// Dormant until the source PR lands. The sentinel is `workspaceNames`, the new
// input carrying every workspace package name -- private ones included, which is
// the whole reason it is a second list rather than the existing `packages`.
// Probe the source for it so this suite stays green on a main without it.
// (The source/test-split rule: tests dormant, source second.)

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as guard from "../index.mjs";

const srcPath = join(dirname(fileURLToPath(import.meta.url)), "..", "index.mjs");
const DORMANT = !readFileSync(srcPath, "utf8").includes("workspaceNames");

const { changesetCheck } = guard;

// A house whose one publishable package is scoped -- the shape the defect took.
const NAMES = ["@scope/house"];
const PACKAGES = [{ name: "@scope/house", shipped: ["content/**"], released: true }];
const SHIPPED = ["content/**"];

const cs = (file, pkg, level = "minor") => ({
  file,
  added: true,
  entries: [{ package: pkg, level }],
});
const touchesContent = [{ status: "A", path: "content/thing/play_thing.md" }];

describe.skipIf(DORMANT)("changesetCheck: the package a changeset names", () => {
  it("passes the scoped name the workspace has", () => {
    const r = changesetCheck({
      changed: touchesContent,
      changesets: [cs("a.md", "@scope/house")],
      shipped: SHIPPED,
      packages: PACKAGES,
      workspaceNames: NAMES,
    });
    expect(r.violations).toEqual([]);
  });

  it("rejects the unscoped spelling of that same package", () => {
    // The live defect: nine changesets in the misfits house declared "khai-misfits"
    // against a package named "@chbrain/khai-misfits". `changeset version` throws
    // "not in the workspace" on the first of them, and the release stayed down for
    // two days with `npm test` green in every failed run.
    const r = changesetCheck({
      changed: touchesContent,
      changesets: [cs("a.md", "house")],
      shipped: SHIPPED,
      packages: PACKAGES,
      workspaceNames: NAMES,
    });
    expect(r.ok).toBe(false);
    expect(r.violations.join("\n")).toMatch(/house/);
    expect(r.violations.join("\n")).toMatch(/@scope\/house/);
  });

  it("names the offending file, so the fix is one open away", () => {
    const r = changesetCheck({
      changed: touchesContent,
      changesets: [cs("mis-named.md", "house")],
      shipped: SHIPPED,
      packages: PACKAGES,
      workspaceNames: NAMES,
    });
    expect(r.violations.join("\n")).toMatch(/mis-named\.md/);
  });

  it("reports every offender, not just the first", () => {
    // changesets itself throws on the FIRST bad name and stops, so a house
    // repairing them one run at a time learns of the next only by failing again.
    const r = changesetCheck({
      changed: touchesContent,
      changesets: [cs("a.md", "house"), cs("b.md", "khai-house"), cs("c.md", "@scope/house")],
      shipped: SHIPPED,
      packages: PACKAGES,
      workspaceNames: NAMES,
    });
    const text = r.violations.join("\n");
    expect(text).toMatch(/a\.md/);
    expect(text).toMatch(/b\.md/);
    expect(text).not.toMatch(/c\.md/);
  });

  it("accepts a PRIVATE workspace package, which `packages` does not list", () => {
    // The reason this rule reads `workspaceNames` and not `packages`.
    // `readPackages` drops private manifests, because every rule it feeds is
    // about publishing. Existence is not: a private package IS in the workspace,
    // changesets resolves it, and judging names against the publishable list
    // alone would reject a legitimate changeset. A wall stricter than the rule it
    // enforces is the failure this house keeps meeting.
    const r = changesetCheck({
      changed: touchesContent,
      changesets: [cs("a.md", "@scope/private-tool", "patch")],
      shipped: SHIPPED,
      packages: PACKAGES,
      workspaceNames: ["@scope/house", "@scope/private-tool"],
    });
    expect(r.violations.join("\n")).not.toMatch(/private-tool/);
  });

  it("says nothing when the workspace was not enumerated", () => {
    // No list means the caller could not read the manifests, not that every name
    // is wrong. A check that fired here would fail every consumer that does not
    // pass the input -- the silent-by-default contract the other package rules
    // already keep.
    const r = changesetCheck({
      changed: touchesContent,
      changesets: [cs("a.md", "house")],
      shipped: SHIPPED,
      packages: PACKAGES,
    });
    expect(r.violations.join("\n")).not.toMatch(/not a package in this workspace/);
  });

  it("says nothing about an empty changeset, which names no package", () => {
    const r = changesetCheck({
      changed: [{ status: "M", path: "docs/THING.md" }],
      changesets: [{ file: "a.md", added: true, entries: [] }],
      shipped: SHIPPED,
      packages: PACKAGES,
      workspaceNames: NAMES,
    });
    expect(r.violations.join("\n")).not.toMatch(/not a package in this workspace/);
  });

  it("checks a changeset the PR only EDITS, which is where the repair lands", () => {
    // The ships-nothing rules deliberately ignore an edited changeset: its bump
    // belongs to the PR that added it. This rule must not inherit that, or the
    // pass that FIXES nine wrong names could never be verified by the gate that
    // demanded it -- and a half-done repair would merge green.
    const r = changesetCheck({
      changed: [{ status: "M", path: ".changeset/a.md" }],
      changesets: [{ file: "a.md", added: false, entries: [{ package: "house", level: "minor" }] }],
      shipped: SHIPPED,
      packages: PACKAGES,
      workspaceNames: NAMES,
    });
    expect(r.ok).toBe(false);
    expect(r.violations.join("\n")).toMatch(/a\.md/);
  });
});
