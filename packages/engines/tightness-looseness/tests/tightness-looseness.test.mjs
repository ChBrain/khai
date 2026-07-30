import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, anchor, expressions } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("tightness-looseness: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("tightness-looseness: manifest", () => {
  it("declares the tightness-looseness position engine over the two regimes", () => {
    expect(manifest.engine).toBe("tightness-looseness");
    expect(manifest.type).toBe("position");
    expect(manifest.anchor).toBe("position_tightness_looseness.md");
    expect(Object.keys(manifest.expressions).sort()).toEqual(["loose", "tight"]);
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

describe("tightness-looseness: compose()", () => {
  for (const name of Object.keys(expressions)) {
    it(`composes ${name}: anchor first, then the regime`, () => {
      const out = compose({ expression: name });
      expect(out.startsWith(anchor)).toBe(true);
      expect(out).toContain(expressions[name]);
      expect(out.indexOf(anchor)).toBeLessThan(out.indexOf(expressions[name]));
    });
  }
  it("rejects an unknown regime", () => {
    expect(() => compose({ expression: "not-a-regime" })).toThrow();
  });
  it("rejects a missing regime", () => {
    expect(() => compose({})).toThrow();
  });
});
