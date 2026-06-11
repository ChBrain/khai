// The temperament engine tests only what is temperament-specific: that the
// package conforms to the canon through the shared conformance kit
// (@chbrain/khai-tests), its manifest contract, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, expressions } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("temperament: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("temperament: manifest", () => {
  it("declares the temperament position engine with ten poles", () => {
    expect(manifest.engine).toBe("temperament");
    expect(manifest.type).toBe("position");
    expect(manifest.anchor).toBe("position_temperament.md");
    expect(Object.keys(manifest.expressions)).toHaveLength(10);
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

describe("temperament: compose()", () => {
  for (const expression of Object.keys(expressions)) {
    it(`composes ${expression}: anchor first, then the pole`, () => {
      const out = compose({ expression });
      expect(out.trimStart().split("\n")[0]).toBe("# Position: Temperament");
      expect(out.includes("## Has")).toBe(true);
    });
  }
  it("rejects an unknown pole", () => {
    expect(() => compose({ expression: "position_choleric" })).toThrow();
  });
  it("rejects a missing pole", () => {
    expect(() => compose({})).toThrow();
  });
});
