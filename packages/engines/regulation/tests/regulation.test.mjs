// The regulation engine tests only what is regulation-specific: that the
// package conforms to the canon through the shared conformance kit
// (@chbrain/khai-tests), its manifest contract, and its compose() behavior.
// The kit's own drift detection is proved in @chbrain/khai-tests.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

// --- self-conformance: regulation certifies itself against the canon ------
describe("regulation: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

// --- manifest contract ----------------------------------------------------
describe("regulation: manifest", () => {
  it("declares the regulation process engine", () => {
    expect(manifest.engine).toBe("regulation");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_regulation.md");
  });

  it("declares both enforceable wiring altitudes, each at its level", () => {
    // The engine owns the contract; the kit enforces it. One: the law linking
    // the root process. Two: the read linking the specific leaf strategy.
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

// --- behavior: compose() carries the root process upward -------------------
describe("regulation: compose()", () => {
  const root = "Process: Regulation";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the strategy`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
      expect(out.indexOf(root)).toBeLessThan(out.indexOf("Initiated by"));
    });
  }

  it("rejects an unknown strategy", () => {
    expect(() => compose({ leaf: "process_avoidance.md" })).toThrow();
  });

  it("rejects a missing strategy", () => {
    expect(() => compose({})).toThrow();
  });
});
