// The superstition engine tests only what is superstition-specific: that the
// package conforms to the canon through the shared conformance kit
// (@chbrain/khai-tests), its manifest contract, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, expressions } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("superstition: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("superstition: manifest", () => {
  it("declares the superstition position engine with five links", () => {
    expect(manifest.engine).toBe("superstition");
    expect(manifest.type).toBe("position");
    expect(manifest.anchor).toBe("position_superstition.md");
    expect(Object.keys(manifest.expressions)).toHaveLength(5);
  });

  it("declares both enforceable wiring altitudes, each at its level", () => {
    // The engine owns the contract; the kit enforces it. One: the law linking
    // the anchor (global). Two: the link each persona given the engine carries
    // (specific). The engine explains how to link; it does not force every persona.
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

describe("superstition: compose()", () => {
  for (const expression of Object.keys(expressions)) {
    it(`composes ${expression}: anchor first, then the link`, () => {
      const out = compose({ expression });
      expect(out.trimStart().split("\n")[0]).toBe("# Position: Superstition");
      expect(out.includes("## Has")).toBe(true);
    });
  }

  it("rejects an unknown link", () => {
    expect(() => compose({ expression: "position_evil_eye" })).toThrow();
  });

  it("rejects a missing link", () => {
    expect(() => compose({})).toThrow();
  });
});
