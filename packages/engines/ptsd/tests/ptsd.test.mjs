import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("ptsd: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("ptsd: manifest", () => {
  it("declares the process engine over the four clusters", () => {
    expect(manifest.engine).toBe("ptsd");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("process_ptsd.md");
    const leaves = manifest.members
      .filter((m) => m.parent)
      .map((m) => m.file)
      .sort();
    expect(leaves).toEqual([
      "position_estrangement.md",
      "process_evasion.md",
      "process_hyperarousal.md",
      "process_reexperiencing.md",
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

describe("ptsd: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first`, () => {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: PTSD");
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_nope.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
