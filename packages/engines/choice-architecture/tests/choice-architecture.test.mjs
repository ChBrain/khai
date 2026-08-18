import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const FACETS = ["piece_preset.md", "piece_sludge.md", "piece_ordering.md", "piece_assortment.md"];

describe("choice-architecture: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("choice-architecture: manifest", () => {
  it("declares a piece engine: an arrangement root over four facets", () => {
    expect(manifest.engine).toBe("choice-architecture");
    expect(manifest.type).toBe("piece");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.every((m) => m.type === "piece")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe(
      "piece_choice_architecture.md",
    );
  });

  it("hangs all four facets off the arrangement root", () => {
    const facets = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(facets).toEqual(FACETS);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("piece_choice_architecture.md");
    }
  });

  it("declares both wiring altitudes, the piece link at Apparent (the arrangement as met)", () => {
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

describe("choice-architecture: compose()", () => {
  it("composes every leaf root-first, carrying the arrangement root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Piece: Choice Architecture")).toBe(true);
    }
  });

  it("carries the root above each facet", () => {
    const out = compose({ leaf: "piece_assortment.md" });
    expect(out.indexOf("# Piece: Choice Architecture")).toBeLessThan(
      out.indexOf("# Piece: Assortment"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "piece_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
