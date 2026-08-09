import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_inheritance.md",
  "process_homeostasis.md",
  "process_identified-patient.md",
];

describe("family-system: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("family-system: manifest", () => {
  it("declares a process composite: a system root over three bridges", () => {
    expect(manifest.engine).toBe("family-system");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_family-system.md");
  });

  it("hangs all three bridges off the family-system root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_family-system.md");
    }
  });

  it("wires the law at fail and the cargo on plot/Tension, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "plot",
      section: "Tension",
      link: "expression",
      level: "audit",
    });
    const cargo = manifest.requires.filter((r) => r.on !== "instructions");
    expect(cargo.map((r) => r.on)).toEqual(["plot"]);
  });
});

describe("family-system: atoms", () => {
  it("re-exports the three family-systems engines it wires, each loaded", () => {
    expect(Object.keys(atoms).sort()).toEqual(["differentiation", "doubleBind", "triangulation"]);
    expect(atoms.triangulation.manifest.engine).toBe("triangulation");
    expect(atoms.differentiation.manifest.engine).toBe("differentiation");
    expect(atoms.doubleBind.manifest.engine).toBe("double-bind");
  });

  it("references socialization and attachment as neighbours, not wired atoms", () => {
    expect(atoms).not.toHaveProperty("socialization");
    expect(atoms).not.toHaveProperty("attachment");
    for (const on of ["socialization", "attachment"]) {
      expect(manifest.requires.some((r) => r.on === on)).toBe(false);
    }
  });
});

describe("family-system: compose()", () => {
  it("composes every bridge root-first, carrying the family-system root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Family-system")).toBe(true);
    }
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });
});
