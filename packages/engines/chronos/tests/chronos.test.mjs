import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const FACETS = [
  "process_age.md",
  "process_sequence.md",
  "process_endurance.md",
  "process_maturation.md",
];

describe("chronos: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("chronos: manifest", () => {
  it("declares a process engine on piece: a passage root over four facets", () => {
    expect(manifest.engine).toBe("chronos");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_chronos.md");
  });

  it("hangs all four facets off the chronos root", () => {
    const facets = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(facets).toEqual(FACETS);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_chronos.md");
    }
  });

  it("declares both wiring altitudes, the piece link at Yearbook (first force on that chapter)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "piece",
      section: "Yearbook",
      link: "expression",
      level: "fail",
    });
  });
});

describe("chronos: compose()", () => {
  it("composes every facet root-first, carrying the chronos root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Chronos")).toBe(true);
    }
  });

  it("carries the root above each facet", () => {
    const out = compose({ leaf: "process_maturation.md" });
    expect(out.indexOf("# Process: Chronos\n")).toBeLessThan(out.indexOf("# Process: Maturation"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
