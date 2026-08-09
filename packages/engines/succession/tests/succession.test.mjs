import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const MODES = [
  "process_pioneer.md",
  "process_progression.md",
  "process_maturity.md",
  "process_rewilding.md",
];

describe("succession: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("succession: manifest", () => {
  it("declares a process engine on place: a reclaiming root over four modes", () => {
    expect(manifest.engine).toBe("succession");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_succession.md");
  });

  it("hangs all four modes off the succession root", () => {
    const modes = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(modes).toEqual(MODES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_succession.md");
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

describe("succession: compose()", () => {
  it("composes every mode root-first, carrying the succession root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Succession")).toBe(true);
    }
  });

  it("carries the root above each mode", () => {
    const out = compose({ leaf: "process_rewilding.md" });
    expect(out.indexOf("# Process: Succession\n")).toBeLessThan(
      out.indexOf("# Process: Rewilding"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
