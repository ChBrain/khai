import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const FACETS = [
  "process_window.md",
  "process_juncture.md",
  "process_timing.md",
  "process_ripeness.md",
];

describe("kairos: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("kairos: manifest", () => {
  it("declares a process engine: a moment root over four facets", () => {
    expect(manifest.engine).toBe("kairos");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_kairos.md");
  });

  it("hangs all four facets off the kairos root", () => {
    const facets = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(facets).toEqual(FACETS);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_kairos.md");
    }
  });

  it("wires multi-cargo: the law, and the moment-chapter of each unfolding type", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "plot",
      section: "Cue",
      link: "expression",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "plan",
      section: "Implementation",
      link: "expression",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "process",
      section: "Initiated by",
      link: "expression",
      level: "fail",
    });
  });

  it("carries exactly the three unfolding cargoes: plot, plan, process", () => {
    const cargo = manifest.requires.filter((r) => r.on !== "instructions");
    expect(cargo.map((r) => r.on).sort()).toEqual(["plan", "plot", "process"]);
  });
});

describe("kairos: compose()", () => {
  it("composes every facet root-first, carrying the kairos root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Kairos")).toBe(true);
    }
  });

  it("carries the root above each facet", () => {
    const out = compose({ leaf: "process_ripeness.md" });
    expect(out.indexOf("# Process: Kairos\n")).toBeLessThan(out.indexOf("# Process: Ripeness"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
