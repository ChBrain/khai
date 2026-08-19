import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const MODES = [
  "process_shot.md",
  "process_sympathetic.md",
  "process_misfire.md",
  "process_uxo.md",
  "process_breach.md",
];

describe("detonation: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("detonation: manifest", () => {
  it("declares a process engine on place: a root over its modes", () => {
    expect(manifest.engine).toBe("detonation");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(6);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_detonation.md");
  });

  it("hangs every mode off the root", () => {
    const modes = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(modes).toEqual(MODES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_detonation.md");
    }
  });

  it("declares both wiring altitudes, the place link at Shown", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "place",
      section: "Shown",
      link: "expression",
      level: "fail",
    });
  });
});

describe("detonation: compose()", () => {
  it("composes every mode root-first, carrying the root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Detonation")).toBe(true);
    }
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
