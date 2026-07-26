import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("social-identity: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("social-identity: manifest", () => {
  it("declares the social-identity position engine: root plus four stances", () => {
    expect(manifest.engine).toBe("social-identity");
    expect(manifest.type).toBe("position");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.find((m) => m.parent === null).file).toBe(
      "position_social_identity.md",
    );
    const stances = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(stances).toEqual([
      "position_identification.md",
      "position_mobility.md",
      "position_creativity.md",
      "position_competition.md",
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

describe("social-identity: compose()", () => {
  const root = "Position: Social Identity";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the stance`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
      expect(out.indexOf(root)).toBeLessThan(out.indexOf("## Has"));
    });
  }

  it("rejects an unknown stance", () => {
    expect(() => compose({ leaf: "position_unknown.md" })).toThrow();
  });

  it("rejects a missing stance", () => {
    expect(() => compose({})).toThrow();
  });
});
