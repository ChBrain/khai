import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("moral-licensing: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("moral-licensing: manifest", () => {
  it("declares a process engine: a root over the two directions of the balance", () => {
    expect(manifest.engine).toBe("moral-licensing");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(3);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_moral_licensing.md");

    const byType = (t) => manifest.members.filter((m) => m.type === t).map((m) => m.file);
    expect(byType("process")).toEqual([
      "process_moral_licensing.md",
      "process_indulgence.md",
      "process_cleansing.md",
    ]);
  });

  it("every non-root member hangs off the moral-licensing root", () => {
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_moral_licensing.md");
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

describe("moral-licensing: compose()", () => {
  it("composes every leaf root-first, carrying the moral-licensing root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Moral Licensing")).toBe(true);
    }
  });

  it("carries a direction between the root and itself", () => {
    const out = compose({ leaf: "process_cleansing.md" });
    expect(out.indexOf("Process: Moral Licensing")).toBeLessThan(out.indexOf("Process: Cleansing"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
