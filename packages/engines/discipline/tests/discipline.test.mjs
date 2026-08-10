import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const FACETS = [
  "process_surveillance.md",
  "process_norm.md",
  "process_examination.md",
  "process_docility.md",
];

describe("discipline: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("discipline: manifest", () => {
  it("declares a process engine: a disciplinary-power root over four facets", () => {
    expect(manifest.engine).toBe("discipline");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_discipline.md");
  });

  it("hangs all four facets off the discipline root", () => {
    const facets = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(facets).toEqual(FACETS);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_discipline.md");
    }
  });

  it("declares both wiring altitudes, the persona link at Projection", () => {
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

describe("discipline: compose()", () => {
  it("composes every facet root-first, carrying the discipline root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Discipline")).toBe(true);
    }
  });

  it("carries the root above the docility twist", () => {
    const out = compose({ leaf: "process_docility.md" });
    expect(out.indexOf("# Process: Discipline\n")).toBeLessThan(out.indexOf("# Process: Docility"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
