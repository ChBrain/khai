// The dramatic-situations engine tests only what is dramatic-situations-specific:
// that the package conforms to the canon through the shared conformance kit
// (@chbrain/khai-tests), its manifest contract, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("dramatic-situations: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("dramatic-situations: manifest", () => {
  it("declares the dramatic-situations engine and its anchor", () => {
    expect(manifest.engine).toBe("dramatic-situations");
    expect(manifest.members).toHaveLength(7);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("plot_dramatic_situation.md");
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
      section: "Action",
      link: "expression",
      level: "fail",
    });
  });
});

describe("dramatic-situations: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: anchor first`, () => {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Plot: Dramatic Situation");
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "plot_nope.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
