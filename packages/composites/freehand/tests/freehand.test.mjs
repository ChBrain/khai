import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_freehand_make.md",
  "process_freehand_play.md",
  "process_freehand_room.md",
];

describe("freehand: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("freehand: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("freehand");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_freehand.md");
  });

  it("hangs all three bridges off the freehand root, in the order the conversion runs", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_freehand.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link what they are carrying and what the room
    // lets them do with it, and the audit surfaces where a play hands somebody a run of
    // successes and never says what the room was like.
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

describe("freehand: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["dark-triad", "deception"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires a position atom and a process atom, both attached where the composite reads", () => {
    expect(atoms["dark-triad"].manifest.type).toBe("position");
    expect(atoms.deception.manifest.type).toBe("process");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // An engine belongs to as many composites as have a question for it. Opacity wires this
  // same deception engine from the concealing persona's side, alongside secret and
  // self-disclosure -- what is withheld and what withholding costs. Freehand runs it as the
  // instrument a disposition reaches for, where the cost is exposure rather than strain.
  it("shares the deception engine with the opacity composite", () => {
    const opacity = JSON.parse(readFileSync(join(pkgDir, "..", "opacity", "package.json"), "utf8"));
    expect(Object.keys(opacity.dependencies)).toContain("@chbrain/khai-engine-deception");
    expect(atoms.deception.manifest.engine).toBe("deception");
  });

  // The composite's first claim is that the three shapes deceive differently rather than
  // more or less, so it needs all three present and distinct: collapse them and the play
  // bridge has nothing to tell apart.
  it("keeps the three shapes the play bridge tells apart", () => {
    expect(atoms["dark-triad"].manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining([
        "position_narcissism.md",
        "position_machiavellianism.md",
        "position_psychopathy.md",
      ]),
    );
  });

  // The keystone runs from a constant disposition to a variable outcome, and maintenance is
  // where the room applies its pressure -- construction and delivery are cheap everywhere,
  // and only keeping a false belief standing is priced by records and repeat encounters.
  it("keeps the maintenance member the room bridge prices", () => {
    expect(atoms.deception.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining([
        "process_construction.md",
        "process_delivery.md",
        "process_maintenance.md",
      ]),
    );
  });
});

describe("freehand: compose()", () => {
  it("composes every bridge root-first, carrying the freehand root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Freehand")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_freehand_room.md" });
    expect(out.indexOf("# Process: Freehand\n")).toBeLessThan(
      out.indexOf("# Process: Freehand, the Room"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
