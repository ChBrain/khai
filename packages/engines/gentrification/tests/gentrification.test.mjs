import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const FACETS = [
  "process_rent_gap.md",
  "process_upgrading.md",
  "process_eviction.md",
  "process_commodification.md",
];

describe("gentrification: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("gentrification: manifest", () => {
  it("declares a process engine on place: a re-entry root over four facets", () => {
    expect(manifest.engine).toBe("gentrification");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_gentrification.md");
  });

  it("hangs all four facets off the gentrification root", () => {
    const facets = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(facets).toEqual(FACETS);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_gentrification.md");
    }
  });

  it("declares both wiring altitudes, the place link at Withheld", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "place",
      section: "Withheld",
      link: "expression",
      level: "fail",
    });
  });
});

describe("gentrification: compose()", () => {
  it("composes every facet root-first, carrying the gentrification root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Gentrification")).toBe(true);
    }
  });

  it("carries the root above each facet", () => {
    const out = compose({ leaf: "process_rent_gap.md" });
    expect(out.indexOf("# Process: Gentrification\n")).toBeLessThan(
      out.indexOf("# Process: Rent-Gap"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
