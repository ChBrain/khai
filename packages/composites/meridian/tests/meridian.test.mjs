import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_meridian_ceiling.md",
  "process_meridian_beat.md",
  "process_meridian_offset.md",
];

describe("meridian: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("meridian: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("meridian");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_meridian.md");
  });

  it("hangs all three bridges off the meridian root, in the order the gap opens", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_meridian.md");
    }
  });

  // This composite attaches at Place rather than at Persona, following its atoms: both
  // celestial and social-time declare place/Shown, and a clock is a fact about a place.
  it("wires the law at fail and the cargo on place at Shown, advisory (audit)", () => {
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
      level: "audit",
    });
    const cargo = manifest.requires.filter((r) => r.on !== "instructions");
    expect(cargo.map((r) => r.on)).toEqual(["place"]);
  });
});

describe("meridian: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["celestial", "social-time"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires two process atoms, both attached at place where the composite reads", () => {
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.type, name).toBe("process");
      expect(atom.manifest.requires, name).toContainEqual({
        on: "place",
        section: "Shown",
        link: "expression",
        level: "fail",
      });
    }
  });

  // An engine belongs to as many composites as have a question for it. Peopling wires this
  // same social-time engine with legibility and street life, reading a place by the presence
  // in it; meridian runs it against the sun, where the subject is a measurement rather than
  // a population. This pins the shared wiring so the pair stays deliberate.
  it("shares the social-time engine with the peopling composite", () => {
    const peopling = JSON.parse(
      readFileSync(join(pkgDir, "..", "peopling", "package.json"), "utf8"),
    );
    expect(Object.keys(peopling.dependencies)).toContain("@chbrain/khai-engine-social-time");
    expect(atoms["social-time"].manifest.engine).toBe("social-time");
  });

  // The keystone runs from a reference that could not be shared to a coordination that
  // replaced it. It needs the sun at one end -- the measurement a place takes from inside
  // itself -- and the schedule at the other, since that is the imposed timetable set by a
  // meridian the place does not stand on.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.celestial.manifest.members.map((m) => m.file)).toContain("process_sun.md");
    expect(atoms["social-time"].manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_calendar.md", "process_schedule.md"]),
    );
  });

  // The offset bridge carries two severances, not one: the clock cut from the sun, and the
  // starfield cut from sight by the place's own light. Losing the starfield member would
  // leave the twist with only half of what it reads.
  it("keeps the starfield the second severance runs on", () => {
    expect(atoms.celestial.manifest.members.map((m) => m.file)).toContain("process_starfield.md");
  });
});

describe("meridian: compose()", () => {
  it("composes every bridge root-first, carrying the meridian root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Meridian")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_meridian_offset.md" });
    expect(out.indexOf("# Process: Meridian\n")).toBeLessThan(
      out.indexOf("# Process: Meridian, the Offset"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
