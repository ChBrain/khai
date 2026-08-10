import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const PHASES = [
  "process_loading.md",
  "process_criticality.md",
  "process_snap.md",
  "process_ratchet.md",
];

describe("tipping-point: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("tipping-point: manifest", () => {
  it("declares a process engine: a critical-transition root over four phases", () => {
    expect(manifest.engine).toBe("tipping-point");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_tipping-point.md");
  });

  it("hangs all four phases off the tipping-point root", () => {
    const phases = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(phases).toEqual(PHASES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_tipping-point.md");
    }
  });

  it("declares both wiring altitudes, the process link at Direction", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "process",
      section: "Direction",
      link: "expression",
      level: "fail",
    });
  });
});

describe("tipping-point: compose()", () => {
  it("composes every phase root-first, carrying the tipping-point root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Tipping-point")).toBe(true);
    }
  });

  it("carries the root above the ratchet twist", () => {
    const out = compose({ leaf: "process_ratchet.md" });
    expect(out.indexOf("# Process: Tipping-point\n")).toBeLessThan(
      out.indexOf("# Process: Ratchet"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
