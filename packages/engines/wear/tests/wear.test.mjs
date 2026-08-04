import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const MODES = [
  "process_abrasion.md",
  "process_flexure.md",
  "process_depletion.md",
  "process_seasoning.md",
];

describe("wear: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("wear: manifest", () => {
  it("declares a process engine on piece: a use root over four modes", () => {
    expect(manifest.engine).toBe("wear");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_wear.md");
  });

  it("hangs all four modes off the wear root", () => {
    const modes = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(modes).toEqual(MODES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_wear.md");
    }
  });

  it("declares both wiring altitudes, the piece link at Load Bearing", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "piece",
      section: "Load Bearing",
      link: "expression",
      level: "fail",
    });
  });
});

describe("wear: compose()", () => {
  it("composes every mode root-first, carrying the wear root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Wear")).toBe(true);
    }
  });

  it("carries the root above each mode", () => {
    const out = compose({ leaf: "process_seasoning.md" });
    expect(out.indexOf("# Process: Wear\n")).toBeLessThan(out.indexOf("# Process: Seasoning"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
