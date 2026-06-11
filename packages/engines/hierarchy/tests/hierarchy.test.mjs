// The hierarchy engine tests only what is hierarchy-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, and its compose() behavior. The kit's own drift
// detection is proved in @chbrain/khai-tests.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, expressions } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

// --- self-conformance: hierarchy certifies itself against the canon -------
describe("hierarchy: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

// --- manifest contract ----------------------------------------------------
describe("hierarchy: manifest", () => {
  it("declares the hierarchy position engine", () => {
    expect(manifest.engine).toBe("hierarchy");
    expect(manifest.type).toBe("position");
    expect(manifest.anchor).toBe("position_hierarchy.md");
    expect(Object.keys(manifest.expressions)).toHaveLength(9);
  });

  it("declares both enforceable wiring altitudes, each at its level", () => {
    // The engine owns the contract; the kit enforces it. One: the law linking
    // the anchor position. Two: the read linking the specific expression.
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

// --- behavior: compose() carries the anchor upward -------------------------
describe("hierarchy: compose()", () => {
  const anchorTitle = "Position: Hierarchy";

  for (const expression of Object.keys(expressions)) {
    it(`composes ${expression}: anchor first, then the position`, () => {
      const out = compose({ expression });
      expect(out.includes(anchorTitle)).toBe(true);
      expect(out.indexOf(anchorTitle)).toBeLessThan(out.indexOf("## Has"));
    });
  }

  it("rejects an unknown position", () => {
    expect(() => compose({ expression: "position_overlord" })).toThrow();
  });

  it("rejects a missing position", () => {
    expect(() => compose({})).toThrow();
  });
});
