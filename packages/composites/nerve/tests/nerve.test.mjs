import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_nerve_alarm.md", "process_nerve_step.md", "process_nerve_flat.md"];

describe("nerve: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("nerve: manifest", () => {
  it("declares a process composite on persona: a meeting root over three bridges", () => {
    expect(manifest.engine).toBe("nerve");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_nerve.md");
  });

  it("hangs all three bridges off the nerve root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_nerve.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The cargo link is advisory, not a hard gate: a persona may link what they did with
    // their alarm, and the audit surfaces where a play stages a danger and never says what
    // it cost anyone to meet it.
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

describe("nerve: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["courage", "fear"]);
    expect(atoms.fear.manifest.engine).toBe("fear");
    expect(atoms.courage.manifest.engine).toBe("courage");
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

  // The flat bridge holds two occupants and separates them by the standing trait: one has
  // a fearfulness that fires and has been decoupled from behaviour, the other has one set
  // so low there is nothing to decouple. Without the fearfulness position the bridge has
  // only one occupant and the keystone collapses.
  it("keeps the standing trait the flat bridge separates its two occupants by", () => {
    expect(atoms.fear.manifest.members.map((m) => m.file)).toContain("position_fearfulness.md");
  });
});

describe("nerve: compose()", () => {
  it("composes every bridge root-first, carrying the nerve root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Nerve")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_nerve_flat.md" });
    expect(out.indexOf("# Process: Nerve\n")).toBeLessThan(
      out.indexOf("# Process: Nerve, the Flat"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
