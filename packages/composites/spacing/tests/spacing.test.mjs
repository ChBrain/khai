import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_spacing_fixture.md",
  "process_spacing_reach.md",
  "process_spacing_verdict.md",
];

describe("spacing: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("spacing: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("spacing");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_spacing.md");
  });

  it("hangs all three bridges off the spacing root, in the order the conversion runs", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_spacing.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link the distance they keep and what the room
    // allows them, and the audit surfaces where a play calls a gathering warm or cold and
    // never says how it was arranged.
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

describe("spacing: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["proxemics", "space"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  // The pairing is the composite's subject rather than an accident: a place engine that
  // cannot move and a process engine that must, meeting on one occasion.
  it("wires a place atom and a process atom, both attached where the composite reads", () => {
    expect(atoms.space.manifest.type).toBe("place");
    expect(atoms.proxemics.manifest.type).toBe("process");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // The space atom is a shorthand-root engine -- an `anchor` and named `expressions`, no
  // `members` array -- while proxemics carries a full member tree, so a consumer reading
  // these has to handle both shapes. The fixture bridge links all three space files by name.
  it("keeps the shorthand root and the three space files the fixture bridge links", () => {
    const space = atoms.space.manifest;
    expect(space.members).toBeUndefined();
    expect(space.anchor).toBe("place_space.md");
    expect(space.expressions).toEqual({
      affordance: "place_affordance.md",
      territory: "place_territory.md",
      atmosphere: "place_atmosphere.md",
    });
    expect(Array.isArray(atoms.proxemics.manifest.members)).toBe(true);
  });

  // The keystone runs from a fixed arrangement to a verdict about the people. It needs the
  // equilibrium at one end -- the reason a persona cannot simply accept an imposed distance,
  // and so pays for it on a channel that looks like character -- and the atmosphere at the
  // other, since that is what the verdict bridge credits to the company.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.proxemics.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_zone.md", "process_intrusion.md", "process_equilibrium.md"]),
    );
    expect(atoms.space.manifest.expressions.atmosphere).toBe("place_atmosphere.md");
  });

  // Neither atom was wired by a composite before this one, so the boundaries it draws are
  // with composites that read a place at other scales rather than with a shared engine. This
  // pins that the neighbouring place composites do not claim these two.
  it("takes both atoms uncomposed, leaving the neighbouring place composites untouched", () => {
    const deps = (name) =>
      Object.keys(
        JSON.parse(readFileSync(join(pkgDir, "..", name, "package.json"), "utf8")).dependencies,
      );
    for (const neighbour of ["dwelling", "peopling", "midst"]) {
      expect(deps(neighbour)).not.toContain("@chbrain/khai-engine-space");
      expect(deps(neighbour)).not.toContain("@chbrain/khai-engine-proxemics");
    }
  });
});

describe("spacing: compose()", () => {
  it("composes every bridge root-first, carrying the spacing root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Spacing")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_spacing_verdict.md" });
    expect(out.indexOf("# Process: Spacing\n")).toBeLessThan(
      out.indexOf("# Process: Spacing, the Verdict"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
