// The bias engine tests only what is bias-specific: that the package conforms to
// the canon through the shared conformance kit (@chbrain/khai-tests), its
// manifest contract, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, expressions } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("bias: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("bias: manifest", () => {
  it("declares the bias position engine with five motive families", () => {
    expect(manifest.engine).toBe("bias");
    expect(manifest.type).toBe("position");
    expect(manifest.anchor).toBe("position_bias.md");
    expect(Object.keys(manifest.expressions)).toHaveLength(5);
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

describe("bias: compose()", () => {
  for (const expression of Object.keys(expressions)) {
    it(`composes ${expression}: anchor first, then the family`, () => {
      const out = compose({ expression });
      expect(out.trimStart().split("\n")[0]).toBe("# Position: Bias");
      expect(out.includes("## Has")).toBe(true);
    });
  }
  it("rejects an unknown tilt", () => {
    expect(() => compose({ expression: "position_greed" })).toThrow();
  });
  it("rejects a missing tilt", () => {
    expect(() => compose({})).toThrow();
  });
});
