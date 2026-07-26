import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("accommodation: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("accommodation: manifest", () => {
  it("declares the accommodation process engine: root plus four strategies", () => {
    expect(manifest.engine).toBe("accommodation");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_accommodation.md");
    const strategies = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(strategies).toEqual([
      "process_attunement.md",
      "process_divergence.md",
      "process_holding.md",
      "process_overaccommodation.md",
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

describe("accommodation: compose()", () => {
  const root = "Process: Accommodation";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the strategy`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
      expect(out.indexOf(root)).toBeLessThan(out.indexOf("Initiated by"));
    });
  }

  it("rejects an unknown strategy", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing strategy", () => {
    expect(() => compose({})).toThrow();
  });
});
