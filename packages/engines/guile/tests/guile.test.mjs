import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const FACETS = [
  "piece_sneaking.md",
  "piece_obstruction.md",
  "piece_nagging.md",
  "piece_forcing.md",
  "piece_misdirection.md",
];

describe("guile: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("guile: manifest", () => {
  it("declares a piece engine: a deceit root over five dark-pattern facets", () => {
    expect(manifest.engine).toBe("guile");
    expect(manifest.type).toBe("piece");
    expect(manifest.members).toHaveLength(6);
    expect(manifest.members.every((m) => m.type === "piece")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("piece_guile.md");
  });

  it("hangs all five facets off the guile root", () => {
    const facets = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(facets).toEqual(FACETS);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("piece_guile.md");
    }
  });

  it("declares both wiring altitudes, the piece link at Apparent (the deceptive surface)", () => {
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

describe("guile: compose()", () => {
  it("composes every leaf root-first, carrying the guile root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Piece: Guile")).toBe(true);
    }
  });

  it("carries the root above each facet", () => {
    const out = compose({ leaf: "piece_misdirection.md" });
    expect(out.indexOf("# Piece: Guile")).toBeLessThan(out.indexOf("# Piece: Misdirection"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "piece_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
