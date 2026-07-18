// The self-esteem engine tests only what is self-esteem-specific: that the
// package conforms to the canon through the shared conformance kit
// (@chbrain/khai-tests), its manifest contract, and its compose() behavior.
// The kit's own drift detection - a dropped chapter, an invented Owner key,
// an undeclared extension - is proved in khai-tests against its own fixture,
// not re-proved here through self-esteem's files.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, anchor, expressions } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

// --- self-conformance: self-esteem certifies itself against the canon -----
describe("self-esteem: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

// --- manifest contract ----------------------------------------------------
describe("self-esteem: manifest", () => {
  it("declares the self-esteem position engine", () => {
    expect(manifest.engine).toBe("self-esteem");
    expect(manifest.type).toBe("position");
    expect(manifest.anchor).toBe("position_self_esteem.md");
    expect(Object.keys(manifest.expressions).sort()).toEqual(["contingent", "high", "low"]);
  });

  it("teaches both wiring altitudes in the card (Knowledge law + Projection)", () => {
    // Teaching lives in the WIRES card (single source).
    expect(manifest.card.setup).toContain("Knowledge");
    expect(manifest.card.setup).toContain("Projection");
  });

  it("declares both enforceable wiring altitudes, each at its level", () => {
    // The engine owns the contract; the kit enforces it. Two altitudes (the card
    // teaches them): the law, declared once in the world's Instructions Knowledge
    // chapter (links the anchor), and the per-persona read under Projection. Both
    // are the structural floor, so both are declared `fail`.
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
describe("self-esteem: compose()", () => {
  for (const name of Object.keys(expressions)) {
    it(`composes ${name}: anchor first, then the expression`, () => {
      const out = compose({ expression: name });
      // The anchor is carried upward -- it leads, the expression follows.
      expect(out.startsWith(anchor)).toBe(true);
      expect(out).toContain(expressions[name]);
      expect(out.indexOf(anchor)).toBeLessThan(out.indexOf(expressions[name]));
    });
  }

  it("rejects an unknown expression", () => {
    expect(() => compose({ expression: "not-a-self-esteem" })).toThrow();
  });

  it("rejects a missing expression", () => {
    expect(() => compose({})).toThrow();
  });
});
