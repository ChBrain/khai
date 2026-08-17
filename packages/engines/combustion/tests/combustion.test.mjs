import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const WILDLAND = [
  "process_crown.md",
  "process_grass.md",
  "process_chaparral.md",
  "process_peat.md",
  "process_holdover.md",
  "process_spotting.md",
  "process_slash.md",
  "process_serotiny.md",
];

describe("combustion: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("combustion: manifest", () => {
  it("declares a process catalog on place: a combustion root over the phenomena", () => {
    expect(manifest.engine).toBe("combustion");
    expect(manifest.type).toBe("process");
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_combustion.md");
  });

  it("opens with the wildland domain, every phenomenon hung off the root", () => {
    const leaves = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(leaves).toEqual(WILDLAND);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_combustion.md");
    }
  });

  it("declares both wiring altitudes, the place link at Shown", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "place",
      section: "Shown",
      link: "expression",
      level: "fail",
    });
  });
});

describe("combustion: compose()", () => {
  it("composes every phenomenon root-first, carrying the combustion root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Combustion")).toBe(true);
    }
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
