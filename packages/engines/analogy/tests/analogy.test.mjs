import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("analogy: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("analogy: manifest", () => {
  it("declares the process engine over the four structure-mapping subprocesses", () => {
    expect(manifest.engine).toBe("analogy");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null).map((m) => m.file);
    expect(roots).toEqual(["process_analogy.md"]);
    const leaves = manifest.members
      .filter((m) => m.parent === "process_analogy.md")
      .map((m) => m.file)
      .sort();
    expect(leaves).toEqual([
      "process_inference.md",
      "process_mapping.md",
      "process_retrieval.md",
      "process_schema.md",
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

describe("analogy: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the form`, () => {
      const out = compose({ leaf });
      expect(out.startsWith("# Process: Analogy")).toBe(true);
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
