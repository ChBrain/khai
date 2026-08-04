import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const STANCES = [
  "process_conservation.md",
  "process_reconstruction.md",
  "process_reuse.md",
  "process_facsimile.md",
];

describe("reclamation: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("reclamation: manifest", () => {
  it("declares a process engine on place: an intervention root over four stances", () => {
    expect(manifest.engine).toBe("reclamation");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_reclamation.md");
  });

  it("hangs all four stances off the reclamation root", () => {
    const stances = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(stances).toEqual(STANCES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_reclamation.md");
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

describe("reclamation: compose()", () => {
  it("composes every stance root-first, carrying the reclamation root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Reclamation")).toBe(true);
    }
  });

  it("carries the root above each stance", () => {
    const out = compose({ leaf: "process_facsimile.md" });
    expect(out.indexOf("# Process: Reclamation\n")).toBeLessThan(
      out.indexOf("# Process: Facsimile"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
