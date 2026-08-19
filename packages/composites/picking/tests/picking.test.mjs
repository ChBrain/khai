import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_picking_fence.md",
  "process_picking_call.md",
  "process_picking_spread.md",
];

describe("picking: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("picking: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("picking");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_picking.md");
  });

  it("hangs all three bridges off the picking root, in the order the episode runs", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_picking.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link where they stand on a divided question,
    // and the audit surfaces where a play hands a persona a firm conviction and never says
    // what choice produced it.
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

describe("picking: atoms", () => {
  it("re-exports the three engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["ambivalence", "decision", "dissonance"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires one position atom and two process atoms, all attached where the composite reads", () => {
    expect(atoms.ambivalence.manifest.type).toBe("position");
    expect(atoms.decision.manifest.type).toBe("process");
    expect(atoms.dissonance.manifest.type).toBe("process");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // An engine belongs to as many composites as have a question for it. Two of these three
  // are wired twice: squaring runs dissonance on a persona's own conduct, where an act was
  // wrong and the account is repaired, while picking runs it on a choice between two goods
  // with nothing to excuse; slack runs decision under scarcity, asking how much room a
  // persona has to decide with, while picking grants the room and reads the division. This
  // pins both pairs so the reuse stays deliberate rather than accidental.
  it("shares dissonance with squaring and decision with slack", () => {
    const deps = (name) =>
      Object.keys(
        JSON.parse(readFileSync(join(pkgDir, "..", name, "package.json"), "utf8")).dependencies,
      );
    expect(deps("squaring")).toContain("@chbrain/khai-engine-dissonance");
    expect(deps("slack")).toContain("@chbrain/khai-engine-decision");
  });

  // The keystone runs from a division that costs nothing to a conviction that was paid for.
  // It needs the free-choice route at one end -- the spread of alternatives after a
  // commitment -- and the paralysed mode at the other, which is the fence made visible when
  // the fork cannot be answered.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.dissonance.manifest.members.map((m) => m.file)).toContain(
      "process_free_choice.md",
    );
    expect(atoms.decision.manifest.members.map((m) => m.file)).toContain("process_paralysed.md");
  });

  // The ambivalence atom is a shorthand-root engine: it declares an `anchor` and named
  // `expressions` instead of a `members` array, so a consumer reading its tree has to take
  // that shape into account. The fence bridge links all three files by name, and the gap
  // between potential and felt is what the call bridge closes.
  it("keeps the shorthand root and both forms the fence bridge reads", () => {
    const amb = atoms.ambivalence.manifest;
    expect(amb.members).toBeUndefined();
    expect(amb.anchor).toBe("position_ambivalence.md");
    expect(amb.expressions).toEqual({
      potential: "position_potential.md",
      felt: "position_felt.md",
    });
  });
});

describe("picking: compose()", () => {
  it("composes every bridge root-first, carrying the picking root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Picking")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_picking_spread.md" });
    expect(out.indexOf("# Process: Picking\n")).toBeLessThan(
      out.indexOf("# Process: Picking, the Spread"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
