import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("dark-triad: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("dark-triad: manifest", () => {
  it("declares the dark-triad position engine: shared core plus three traits", () => {
    expect(manifest.engine).toBe("dark-triad");
    expect(manifest.type).toBe("position");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("position_dark_triad.md");
    const traits = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(traits).toEqual([
      "position_narcissism.md",
      "position_machiavellianism.md",
      "position_psychopathy.md",
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

describe("dark-triad: compose()", () => {
  const root = "Position: Dark Triad";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the trait`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
      expect(out.indexOf(root)).toBeLessThan(out.indexOf("## Has"));
    });
  }

  it("rejects an unknown trait", () => {
    expect(() => compose({ leaf: "position_unknown.md" })).toThrow();
  });

  it("rejects a missing trait", () => {
    expect(() => compose({})).toThrow();
  });
});
