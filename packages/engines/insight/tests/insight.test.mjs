import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("insight: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("insight: manifest", () => {
  it("declares the process engine over the three restructuring mechanisms", () => {
    expect(manifest.engine).toBe("insight");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null).map((m) => m.file);
    expect(roots).toEqual(["process_insight.md"]);
    const leaves = manifest.members
      .filter((m) => m.parent === "process_insight.md")
      .map((m) => m.file)
      .sort();
    expect(leaves).toEqual([
      "process_chunk_decomposition.md",
      "process_constraint_relaxation.md",
      "process_re_encoding.md",
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

describe("insight: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the form`, () => {
      const out = compose({ leaf });
      expect(out.startsWith("# Process: Insight")).toBe(true);
      expect(out.trim().length).toBeGreaterThan(0);
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "not-a-form" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
