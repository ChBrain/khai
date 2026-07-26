import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("register: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("register: manifest", () => {
  it("declares the register position engine: root plus four boundary modes", () => {
    expect(manifest.engine).toBe("register");
    expect(manifest.type).toBe("position");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("position_register.md");
    const modes = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(modes).toEqual([
      "position_shorthand.md",
      "position_badge.md",
      "position_closure.md",
      "position_translation.md",
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

describe("register: compose()", () => {
  const root = "Position: Register";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the mode`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
      expect(out.indexOf(root)).toBeLessThan(out.indexOf("## Has"));
    });
  }

  it("rejects an unknown mode", () => {
    expect(() => compose({ leaf: "position_unknown.md" })).toThrow();
  });

  it("rejects a missing mode", () => {
    expect(() => compose({})).toThrow();
  });
});
