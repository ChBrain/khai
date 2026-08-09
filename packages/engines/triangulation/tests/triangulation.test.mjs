import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const FORMS = ["plot_detour.md", "plot_coalition.md", "plot_crossfire.md", "plot_stabilizer.md"];

describe("triangulation: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("triangulation: manifest", () => {
  it("declares a plot engine: a three-party-bind root over four forms", () => {
    expect(manifest.engine).toBe("triangulation");
    expect(manifest.type).toBe("plot");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.every((m) => m.type === "plot")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("plot_triangulation.md");
  });

  it("hangs all four forms off the triangulation root", () => {
    const forms = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(forms).toEqual(FORMS);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("plot_triangulation.md");
    }
  });

  it("wires on the plot at Tension (fail), the law at instructions/Knowledge", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "plot",
      section: "Tension",
      link: "expression",
      level: "fail",
    });
  });
});

describe("triangulation: compose()", () => {
  it("composes every form root-first, carrying the triangulation root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Plot: Triangulation")).toBe(true);
    }
  });

  it("carries the root above the stabilizer form (the systemic turn)", () => {
    const out = compose({ leaf: "plot_stabilizer.md" });
    expect(out.indexOf("# Plot: Triangulation\n")).toBeLessThan(out.indexOf("# Plot: Stabilizer"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "plot_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
