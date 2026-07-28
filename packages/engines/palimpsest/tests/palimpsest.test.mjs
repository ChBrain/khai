import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("palimpsest: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("palimpsest: manifest", () => {
  it("declares the palimpsest pitch engine: root plus three transforms", () => {
    expect(manifest.engine).toBe("palimpsest");
    expect(manifest.type).toBe("pitch");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("pitch_palimpsest.md");
    const forms = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(forms).toEqual(["pitch_parody.md", "pitch_travesty.md", "pitch_transposition.md"]);
  });
  it("declares both enforceable wiring altitudes, each at its level", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "play",
      section: "Arc",
      link: "expression",
      level: "fail",
    });
  });
});

describe("palimpsest: compose()", () => {
  const root = "Pitch: Palimpsest";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the transform`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
      expect(out.indexOf(root)).toBeLessThan(out.indexOf("Tenor"));
    });
  }

  it("rejects an unknown transform", () => {
    expect(() => compose({ leaf: "pitch_unknown.md" })).toThrow();
  });

  it("rejects a missing transform", () => {
    expect(() => compose({})).toThrow();
  });
});
