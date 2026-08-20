import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_remainder_horizon.md",
  "process_remainder_tally.md",
  "process_remainder_closing.md",
];

describe("remainder: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("remainder: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("remainder");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_remainder.md");
  });

  it("hangs all three bridges off the remainder root, in the order the pricing runs", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_remainder.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link the horizon they hold and what they
    // measure against it, and the audit surfaces where a play gives a persona a reckoning and
    // never says how much time they think they have.
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

describe("remainder: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["regret", "time-horizon"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires a position atom and a process atom, both attached where the composite reads", () => {
    expect(atoms["time-horizon"].manifest.type).toBe("position");
    expect(atoms.regret.manifest.type).toBe("process");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // An engine belongs to as many composites as have a question for it. Longing wires this
  // same regret engine with nostalgia and loneliness, reading a persona turned toward what is
  // gone; remainder runs it forward against the time left, where the subject is what a regret
  // costs rather than what it reaches for. This pins the shared wiring so the pair stays
  // deliberate rather than accidental.
  it("shares the regret engine with the longing composite", () => {
    const longing = JSON.parse(readFileSync(join(pkgDir, "..", "longing", "package.json"), "utf8"));
    expect(Object.keys(longing.dependencies)).toContain("@chbrain/khai-engine-regret");
    expect(atoms.regret.manifest.engine).toBe("regret");
  });

  // The keystone runs from an open door to a shut one. It needs the limited pole at one end
  // -- the foreshortened horizon that closes opportunity -- and the inaction form at the
  // other, since those are the entries that survive into a short horizon and the ones the
  // closing acts on.
  it("keeps the members the keystone runs between", () => {
    expect(atoms["time-horizon"].manifest.expressions).toEqual({
      expansive: "position_expansive.md",
      limited: "position_limited.md",
    });
    expect(atoms.regret.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_commission.md", "process_inaction.md"]),
    );
  });

  // The time-horizon atom is a shorthand-root engine -- an `anchor` and named `expressions`,
  // no `members` array -- while regret carries a full member tree, so a consumer reading
  // these has to handle both shapes. The horizon bridge links the anchor and both poles.
  it("keeps the shorthand root the horizon bridge links", () => {
    const horizon = atoms["time-horizon"].manifest;
    expect(horizon.members).toBeUndefined();
    expect(horizon.anchor).toBe("position_time-horizon.md");
    expect(Array.isArray(atoms.regret.manifest.members)).toBe(true);
  });
});

describe("remainder: compose()", () => {
  it("composes every bridge root-first, carrying the remainder root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Remainder")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_remainder_closing.md" });
    expect(out.indexOf("# Process: Remainder\n")).toBeLessThan(
      out.indexOf("# Process: Remainder, the Closing"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
