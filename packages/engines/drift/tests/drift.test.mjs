import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const MECHANISMS = ["process_normalization.md", "process_uncoupling.md", "process_gradient.md"];

describe("drift: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("drift: manifest", () => {
  it("declares a process engine: a root over three mechanisms", () => {
    expect(manifest.engine).toBe("drift");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_drift.md");
  });

  it("hangs all three mechanisms off the drift root", () => {
    const mechanisms = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(mechanisms).toEqual(MECHANISMS);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_drift.md");
    }
  });

  it("declares both wiring altitudes, including the first-of-kind process link", () => {
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

describe("drift: compose()", () => {
  it("composes every leaf root-first, carrying the drift root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Drift")).toBe(true);
    }
  });

  it("carries the root above each mechanism", () => {
    const out = compose({ leaf: "process_gradient.md" });
    expect(out.indexOf("# Process: Drift")).toBeLessThan(out.indexOf("# Process: Gradient"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
