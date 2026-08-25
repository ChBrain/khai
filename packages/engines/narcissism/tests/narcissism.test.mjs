import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("narcissism: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("narcissism: manifest", () => {
  it("declares a multi-type engine: a position root over positions, plans, and processes", () => {
    expect(manifest.engine).toBe("narcissism");
    expect(manifest.type).toBe("position");
    expect(manifest.members).toHaveLength(12);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("position_narcissism.md");

    const byType = (t) => manifest.members.filter((m) => m.type === t).map((m) => m.file);
    expect(byType("position")).toEqual([
      "position_narcissism.md",
      "position_grandiose.md",
      "position_vulnerable.md",
      "position_communal_narcissism.md",
      "position_malignant.md",
    ]);
    expect(byType("plan")).toEqual([
      "plan_dominance.md",
      "plan_safety.md",
      "plan_glory.md",
      "plan_conquest.md",
    ]);
    expect(byType("process")).toEqual([
      "process_narcissistic_admiration.md",
      "process_narcissistic_rivalry.md",
      "process_injury.md",
    ]);
  });

  it("each type-position parents its aim-plan", () => {
    const parentOf = (f) => manifest.members.find((m) => m.file === f).parent;
    expect(parentOf("plan_dominance.md")).toBe("position_grandiose.md");
    expect(parentOf("plan_safety.md")).toBe("position_vulnerable.md");
    expect(parentOf("plan_glory.md")).toBe("position_communal_narcissism.md");
    expect(parentOf("plan_conquest.md")).toBe("position_malignant.md");
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

describe("narcissism: compose()", () => {
  it("composes every leaf root-first, carrying the narcissism root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Position: Narcissism")).toBe(true);
    }
  });

  it("a plan leaf carries its type-position between the root and itself", () => {
    const out = compose({ leaf: "plan_dominance.md" });
    expect(out.indexOf("Position: Narcissism")).toBeLessThan(out.indexOf("Position: Grandiose"));
    expect(out.indexOf("Position: Grandiose")).toBeLessThan(out.indexOf("Plan: Dominance"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
