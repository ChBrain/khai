import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_uptake_curve.md", "process_uptake_signal.md", "process_uptake_turn.md"];

describe("uptake: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("uptake: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("uptake");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_uptake.md");
  });

  it("hangs all three bridges off the uptake root, in the order the thing travels", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_uptake.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link where they stand relative to a thing and
    // what holding it says about them, and the audit surfaces where a play has something fall
    // out of favour and never says who had picked it up.
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

describe("uptake: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["adoption", "social-identity"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires a process atom and a position atom, both attached where the composite reads", () => {
    expect(atoms.adoption.manifest.type).toBe("process");
    expect(atoms["social-identity"].manifest.type).toBe("position");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // An engine belongs to as many composites as have a question for it. Membership wires this
  // same social-identity engine on one persona's standing bind to a group, and intergroup on
  // the us/them line; uptake runs it on a thing, where the group is constituted by whoever
  // currently holds it and has no way to keep anybody out -- which is why the turn happens.
  // This pins the shared wiring so the reuse stays deliberate rather than accidental.
  it("shares the social-identity engine with membership and intergroup", () => {
    const deps = (name) =>
      Object.keys(
        JSON.parse(readFileSync(join(pkgDir, "..", name, "package.json"), "utf8")).dependencies,
      );
    expect(deps("membership")).toContain("@chbrain/khai-engine-social-identity");
    expect(deps("intergroup")).toContain("@chbrain/khai-engine-social-identity");
  });

  // The keystone runs from a thing spreading to the same spreading stopping it. It needs the
  // tipping point at one end -- the place past which the holders are no longer the early ones
  // -- and the mobility/creativity pair at the other, since those are the only two moves the
  // turn bridge offers and losing either would leave it with a single forced response.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.adoption.manifest.members.map((m) => m.file)).toContain(
      "place_the_tipping_point.md",
    );
    expect(atoms["social-identity"].manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["position_mobility.md", "position_creativity.md"]),
    );
  });

  // The adoption atom's tree mixes member types -- five positions for the adopter roles and
  // four places for the grounds an idea passes through -- so a consumer reading it must not
  // assume a single type. The curve bridge links across both.
  it("keeps the adoption atom's mixed positions and places the curve bridge links", () => {
    const types = new Set(atoms.adoption.manifest.members.map((m) => m.type));
    expect([...types].sort()).toEqual(["place", "position", "process"]);
    const files = atoms.adoption.manifest.members.map((m) => m.file);
    expect(files).toEqual(
      expect.arrayContaining([
        "position_innovator.md",
        "position_laggard.md",
        "place_the_outside.md",
        "place_the_old_ground.md",
      ]),
    );
  });
});

describe("uptake: compose()", () => {
  it("composes every bridge root-first, carrying the uptake root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Uptake")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_uptake_turn.md" });
    expect(out.indexOf("# Process: Uptake\n")).toBeLessThan(
      out.indexOf("# Process: Uptake, the Turn"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
