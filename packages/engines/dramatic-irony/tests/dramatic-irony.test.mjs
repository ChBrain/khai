import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("dramatic-irony: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("dramatic-irony: manifest", () => {
  it("declares the process engine over the two gap forms", () => {
    expect(manifest.engine).toBe("dramatic-irony");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null).map((m) => m.file);
    expect(roots).toEqual(["process_dramatic_irony.md"]);
    const leaves = manifest.members
      .filter((m) => m.parent === "process_dramatic_irony.md")
      .map((m) => m.file)
      .sort();
    expect(leaves).toEqual(["process_double_meaning.md", "process_foreknowledge.md"]);
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

describe("dramatic-irony: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the form`, () => {
      const out = compose({ leaf });
      expect(out.startsWith("# Process: Dramatic Irony")).toBe(true);
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
