import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const ELEMENTS = [
  "process_path.md",
  "process_edge.md",
  "process_district.md",
  "process_node.md",
  "process_landmark.md",
];

describe("legibility: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("legibility: manifest", () => {
  it("declares a process engine: a navigable-image root over Lynch's five elements", () => {
    expect(manifest.engine).toBe("legibility");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(6);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_legibility.md");
  });

  it("hangs all five elements off the legibility root, no forced twist", () => {
    const elements = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(elements).toEqual(ELEMENTS);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_legibility.md");
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

describe("legibility: compose()", () => {
  it("composes every element root-first, carrying the legibility root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Legibility")).toBe(true);
    }
  });

  it("carries the root above the landmark element", () => {
    const out = compose({ leaf: "process_landmark.md" });
    expect(out.indexOf("# Process: Legibility\n")).toBeLessThan(out.indexOf("# Process: Landmark"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
