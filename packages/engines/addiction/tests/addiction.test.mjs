import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("addiction: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("addiction: manifest", () => {
  it("declares the addiction process engine: root, four drives, four hormone pieces", () => {
    expect(manifest.engine).toBe("addiction");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(9);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_addiction.md");
    const pieces = manifest.members.filter((m) => m.type === "piece").map((m) => m.file);
    expect(pieces).toEqual([
      "piece_dopamine.md",
      "piece_endorphin.md",
      "piece_serotonin.md",
      "piece_oxytocin.md",
    ]);
    // Every drive and every hormone hangs directly off the root (heritage-flat).
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_addiction.md");
    }
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

describe("addiction: compose()", () => {
  const root = "Process: Addiction";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the drive or its piece`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
      // The root is a process and always leads; "Initiated by" is its first chapter.
      expect(out.indexOf(root)).toBeLessThan(out.indexOf("Initiated by"));
    });
  }

  it("composes all eight leaves: the four drives and the four hormone pieces", () => {
    expect(Object.keys(chains).sort()).toEqual(
      [
        "process_craving.md",
        "process_relief.md",
        "process_acclaim.md",
        "process_closeness.md",
        "piece_dopamine.md",
        "piece_endorphin.md",
        "piece_serotonin.md",
        "piece_oxytocin.md",
      ].sort(),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
