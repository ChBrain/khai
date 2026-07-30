import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, anchor, expressions } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("moral-identity: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("moral-identity: manifest", () => {
  it("declares the moral-identity position engine over the two dimensions' quadrants", () => {
    expect(manifest.engine).toBe("moral-identity");
    expect(manifest.type).toBe("position");
    expect(manifest.anchor).toBe("position_moral_identity.md");
    expect(Object.keys(manifest.expressions).sort()).toEqual([
      "custodian",
      "internalized",
      "peripheral",
      "symbolic",
    ]);
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

describe("moral-identity: compose()", () => {
  for (const name of Object.keys(expressions)) {
    it(`composes ${name}: anchor first, then the standing`, () => {
      const out = compose({ expression: name });
      expect(out.startsWith(anchor)).toBe(true);
      expect(out).toContain(expressions[name]);
      expect(out.indexOf(anchor)).toBeLessThan(out.indexOf(expressions[name]));
    });
  }
  it("rejects an unknown standing", () => {
    expect(() => compose({ expression: "not-a-standing" })).toThrow();
  });
  it("rejects a missing standing", () => {
    expect(() => compose({})).toThrow();
  });
});
