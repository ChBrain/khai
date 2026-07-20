// The suspense engine tests only what is suspense-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("suspense: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("suspense: manifest", () => {
  it("declares the suspense process engine and its anchor", () => {
    expect(manifest.engine).toBe("suspense");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("process_suspense.md");
  });

  it("declares the four facets that fall out of the anticipatory structure", () => {
    const files = manifest.members.map((m) => m.file);
    expect(files).toEqual(
      expect.arrayContaining([
        "process_suspense.md",
        "process_narrowing.md",
        "process_closing.md",
        "process_reprieve.md",
        "process_spillover.md",
      ]),
    );
  });

  it("declares both enforceable wiring altitudes, each at its level", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "persona",
      section: "Projection",
      link: "expression",
      level: "fail",
    });
  });
});

describe("suspense: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first`, () => {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Suspense");
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_nope.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
