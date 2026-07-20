// The uncanny engine tests only what is uncanny-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("uncanny: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("uncanny: manifest", () => {
  it("declares the uncanny process engine and its anchor", () => {
    expect(manifest.engine).toBe("uncanny");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(6);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("process_uncanny.md");
  });

  it("declares the five species the uncanny may resolve into", () => {
    const expressions = manifest.members
      .filter((m) => m.parent === "process_uncanny.md")
      .map((m) => m.file)
      .sort();
    expect(expressions).toEqual(
      [
        "process_animate.md",
        "process_animism.md",
        "process_double.md",
        "process_recurrence.md",
        "process_revenant.md",
      ].sort(),
    );
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

describe("uncanny: compose()", () => {
  const root = "Process: Uncanny";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the species`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
      expect(out.indexOf(root)).toBeLessThan(out.indexOf("Initiated by"));
    });
  }

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
