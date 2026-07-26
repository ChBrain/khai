import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("self-disclosure: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("self-disclosure: manifest", () => {
  it("declares the self-disclosure process engine: root plus four movements", () => {
    expect(manifest.engine).toBe("self-disclosure");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_self_disclosure.md");
    const movements = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(movements).toEqual([
      "process_breadth.md",
      "process_deepening.md",
      "process_reciprocity.md",
      "process_retreat.md",
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

describe("self-disclosure: compose()", () => {
  const root = "Process: Self-Disclosure";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the movement`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
      expect(out.indexOf(root)).toBeLessThan(out.indexOf("Initiated by"));
    });
  }

  it("rejects an unknown movement", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing movement", () => {
    expect(() => compose({})).toThrow();
  });
});
