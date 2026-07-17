import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, anchor, expressions } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("commons: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("commons: manifest", () => {
  it("declares the commons place engine", () => {
    expect(manifest.engine).toBe("commons");
    expect(manifest.type).toBe("place");
    expect(manifest.anchor).toBe("place_commons.md");
    expect(Object.keys(manifest.expressions).sort()).toEqual(["boundary", "pool", "sanction"]);
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

describe("commons: compose()", () => {
  for (const name of Object.keys(expressions)) {
    it(`composes ${name}: anchor first, then the expression`, () => {
      const out = compose({ expression: name });
      expect(out.startsWith(anchor)).toBe(true);
      expect(out).toContain(expressions[name]);
      expect(out.indexOf(anchor)).toBeLessThan(out.indexOf(expressions[name]));
    });
  }
  it("rejects an unknown expression", () => {
    expect(() => compose({ expression: "not-a-pool" })).toThrow();
  });
  it("rejects a missing expression", () => {
    expect(() => compose({})).toThrow();
  });
});
