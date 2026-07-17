// The double-bind engine tests only what is double-bind-specific: that the
// package conforms to the canon through the shared conformance kit
// (@chbrain/khai-tests), its manifest contract, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("double-bind: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("double-bind: manifest", () => {
  it("declares the double-bind engine and its anchor", () => {
    expect(manifest.engine).toBe("double-bind");
    expect(manifest.members).toHaveLength(4);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("plot_double_bind.md");
  });

  it("declares both enforceable wiring altitudes, each at its level", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "plot",
      section: "Tension",
      link: "expression",
      level: "fail",
    });
  });
});

describe("double-bind: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: anchor first`, () => {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Plot: Double Bind");
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "plot_nope.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
