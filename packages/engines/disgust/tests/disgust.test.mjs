import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("disgust: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("disgust: manifest", () => {
  it("declares a multi-type engine: a process root over domains, a mechanism, and a trait", () => {
    expect(manifest.engine).toBe("disgust");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(6);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_disgust.md");

    const byType = (t) => manifest.members.filter((m) => m.type === t).map((m) => m.file);
    expect(byType("process")).toEqual([
      "process_disgust.md",
      "process_pathogen.md",
      "process_sexual.md",
      "process_sociomoral.md",
      "process_contamination.md",
    ]);
    expect(byType("position")).toEqual(["position_sensitivity.md"]);
  });

  it("every non-root member hangs off the disgust root", () => {
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_disgust.md");
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

describe("disgust: compose()", () => {
  it("composes every leaf root-first, carrying the disgust root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Disgust")).toBe(true);
    }
  });

  it("carries the position trait between the root and itself", () => {
    const out = compose({ leaf: "position_sensitivity.md" });
    expect(out.indexOf("Process: Disgust")).toBeLessThan(out.indexOf("Position: Sensitivity"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
