import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_ingraining_pairing.md",
  "process_ingraining_discount.md",
  "process_ingraining_groove.md",
];

describe("ingraining: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("ingraining: manifest", () => {
  it("declares a process composite on persona: an installing root over three bridges", () => {
    expect(manifest.engine).toBe("ingraining");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_ingraining.md");
  });

  it("hangs all three bridges off the ingraining root, in pipeline order", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_ingraining.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The composite's cargo link is advisory, not a hard gate: a persona may link the
    // stage at which a response is being installed, and the audit surfaces where a play
    // has a persona act out of habit without naming what laid it down.
    expect(manifest.requires).toContainEqual({
      on: "persona",
      section: "Projection",
      link: "expression",
      level: "audit",
    });
    const cargo = manifest.requires.filter((r) => r.on !== "instructions");
    expect(cargo.map((r) => r.on)).toEqual(["persona"]);
  });
});

describe("ingraining: atoms", () => {
  it("re-exports the three laying-down engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["conditioning", "habit", "reward"]);
    expect(atoms.conditioning.manifest.engine).toBe("conditioning");
    expect(atoms.reward.manifest.engine).toBe("reward");
    expect(atoms.habit.manifest.engine).toBe("habit");
  });
});

describe("ingraining: compose()", () => {
  it("composes every bridge root-first, carrying the ingraining root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Ingraining")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_ingraining_groove.md" });
    expect(out.indexOf("# Process: Ingraining\n")).toBeLessThan(
      out.indexOf("# Process: Ingraining, the Groove"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
