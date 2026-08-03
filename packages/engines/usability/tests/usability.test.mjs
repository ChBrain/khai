import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const FACETS = ["piece_grip.md", "piece_signifier.md", "piece_feedback.md", "piece_constraint.md"];

describe("usability: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("usability: manifest", () => {
  it("declares a piece engine: a root over four design facets", () => {
    expect(manifest.engine).toBe("usability");
    expect(manifest.type).toBe("piece");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.every((m) => m.type === "piece")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("piece_usability.md");
  });

  it("hangs all four facets off the usability root", () => {
    const facets = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(facets).toEqual(FACETS);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("piece_usability.md");
    }
  });

  it("declares both wiring altitudes, including the first-of-kind piece link", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "piece",
      section: "Apparent",
      link: "expression",
      level: "fail",
    });
  });
});

describe("usability: compose()", () => {
  it("composes every leaf root-first, carrying the usability root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Piece: Usability")).toBe(true);
    }
  });

  it("carries the root above each facet", () => {
    const out = compose({ leaf: "piece_constraint.md" });
    expect(out.indexOf("# Piece: Usability")).toBeLessThan(out.indexOf("# Piece: Constraint"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "piece_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
