// The moral-judgment engine tests only what is moral-judgment-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, and its compose() behavior. The kit's own drift
// detection is proved in khai-tests against its own fixture, not re-proved here.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, anchor, expressions } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

// --- self-conformance: moral-judgment certifies itself against the canon ---------
describe("moral-judgment: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

// --- manifest contract ----------------------------------------------------
describe("moral-judgment: manifest", () => {
  it("declares the moral-judgment position engine", () => {
    expect(manifest.engine).toBe("moral-judgment");
    expect(manifest.type).toBe("position");
    expect(manifest.anchor).toBe("position_moral_judgment.md");
    expect(Object.keys(manifest.expressions).sort()).toEqual([
      "authority",
      "care",
      "fairness",
      "liberty",
      "loyalty",
      "sanctity",
    ]);
  });

  it("teaches both wiring altitudes in the card (Knowledge law + Projection)", () => {
    expect(manifest.card.setup).toContain("Knowledge");
    expect(manifest.card.setup).toContain("Projection");
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

// --- behavior: compose() carries the anchor upward ------------------------
describe("moral-judgment: compose()", () => {
  for (const name of Object.keys(expressions)) {
    it(`composes ${name}: anchor first, then the expression`, () => {
      const out = compose({ expression: name });
      expect(out.startsWith(anchor)).toBe(true);
      expect(out).toContain(expressions[name]);
      expect(out.indexOf(anchor)).toBeLessThan(out.indexOf(expressions[name]));
    });
  }

  it("rejects an unknown expression", () => {
    expect(() => compose({ expression: "not-a-moral-judgment" })).toThrow();
  });

  it("rejects a missing expression", () => {
    expect(() => compose({})).toThrow();
  });
});
