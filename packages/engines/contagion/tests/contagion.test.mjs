// The contagion engine tests only what is contagion-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, and its compose() behavior. The kit's own drift
// detection is proved in @chbrain/khai-tests.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

// --- self-conformance: contagion certifies itself against the canon --------
describe("contagion: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

// --- manifest contract -------------------------------------------------------
describe("contagion: manifest", () => {
  it("declares the contagion process engine", () => {
    expect(manifest.engine).toBe("contagion");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(3);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_contagion.md");
  });

  it("declares both enforceable wiring altitudes, each at its level", () => {
    // The engine owns the contract; the kit enforces it. One: the law linking
    // the root process. Two: the read linking the specific leaf moment.
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
describe("contagion: compose()", () => {
  const root = "Process: Contagion";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the moment`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
      expect(out.indexOf(root)).toBeLessThan(out.indexOf("Initiated by"));
    });
  }

  it("rejects an unknown moment", () => {
    expect(() => compose({ leaf: "process_synchrony.md" })).toThrow();
  });

  it("rejects a missing moment", () => {
    expect(() => compose({})).toThrow();
  });
});
