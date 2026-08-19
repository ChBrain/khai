import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_tending_turn.md", "process_tending_flinch.md", "process_tending_toll.md"];

describe("tending: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("tending: manifest", () => {
  it("declares a process composite on persona: an aim root over three bridges", () => {
    expect(manifest.engine).toBe("tending");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_tending.md");
  });

  it("hangs all three bridges off the tending root, sorted by where the relief is aimed", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_tending.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The cargo link is advisory, not a hard gate: a persona may link where their relief
    // is aimed, and the audit surfaces where a play shows somebody meeting a need and
    // never says what it did to them.
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

describe("tending: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["caregiving", "compassion"]);
    expect(atoms.compassion.manifest.engine).toBe("compassion");
    expect(atoms.caregiving.manifest.engine).toBe("caregiving");
  });

  it("wires two process-typed atoms, both attached where the composite reads", () => {
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.type, name).toBe("process");
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // The composite exists because compassion already models its own shadows: without the
  // distress and pity members there is no flinch to sort against the turn, and without
  // burnout there is nothing for the keystone to reinterpret. These three are the load
  // the bridges hang from.
  it("keeps the members the three bridges are sorted against", () => {
    const c = atoms.compassion.manifest.members.map((m) => m.file);
    expect(c).toContain("process_distress.md");
    expect(c).toContain("process_pity.md");
    expect(atoms.caregiving.manifest.members.map((m) => m.file)).toContain("process_burnout.md");
  });
});

describe("tending: compose()", () => {
  it("composes every bridge root-first, carrying the tending root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Tending")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_tending_toll.md" });
    expect(out.indexOf("# Process: Tending\n")).toBeLessThan(
      out.indexOf("# Process: Tending, the Toll"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
