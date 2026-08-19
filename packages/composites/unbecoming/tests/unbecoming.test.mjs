import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_unbecoming_read.md",
  "process_unbecoming_shortfall.md",
  "process_unbecoming_penalty.md",
];

describe("unbecoming: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("unbecoming: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("unbecoming");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_unbecoming.md");
  });

  it("hangs all three bridges off the unbecoming root, in the order the room applies them", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_unbecoming.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link the role they stand in and the read the
    // room brings to it, and the audit surfaces where a play has a persona disliked for
    // doing their job and never says what the disliking was made of.
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

describe("unbecoming: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["gender", "role"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires two position atoms, both attached where the composite reads", () => {
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.type, name).toBe("position");
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // Both atoms are shorthand-root engines -- an `anchor` plus named `expressions`, no
  // `members` array -- so a consumer reading these trees must not expect a members list at
  // all. Neither bridge can link a member file, and both link expressions by name instead.
  it("wires two shorthand-root engines, and keeps the expressions the bridges link", () => {
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.members, name).toBeUndefined();
    }
    expect(atoms.role.manifest.anchor).toBe("position_role.md");
    expect(atoms.role.manifest.expressions).toEqual({
      congruent: "position_congruent.md",
      incongruent: "position_incongruent.md",
      overloaded: "position_overloaded.md",
      ambiguous: "position_ambiguous.md",
    });
    expect(atoms.gender.manifest.anchor).toBe("position_gender.md");
    expect(atoms.gender.manifest.expressions).toEqual({
      male: "position_male.md",
      female: "position_female.md",
    });
  });

  // The keystone is a scissors: falling short of the role disqualifies, meeting it
  // penalises. Both blades close on the same expression -- role's incongruent form is what
  // the shortfall bridge reads in advance of conduct and what the penalty bridge reads in
  // the conduct itself -- so losing it would leave the composite with nothing to run on.
  it("keeps the incongruent expression both blades close on", () => {
    expect(atoms.role.manifest.expressions.incongruent).toBe("position_incongruent.md");
  });

  // The joining is Eagly & Karau, and the role atom already carries it in its own Origin
  // table -- this composite stages what that atom names rather than importing a warrant of
  // its own for the join. Pinned so a future edit to the atom's references cannot quietly
  // strand the composite's spine.
  it("keeps the joining source in the role atom's own references", () => {
    const refs = readFileSync(join(pkgDir, "..", "..", "engines", "role", "REFERENCES.md"), "utf8");
    expect(refs).toContain("Role Congruity Theory");
    expect(refs).toContain("Eagly");
  });
});

describe("unbecoming: compose()", () => {
  it("composes every bridge root-first, carrying the unbecoming root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Unbecoming")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_unbecoming_penalty.md" });
    expect(out.indexOf("# Process: Unbecoming\n")).toBeLessThan(
      out.indexOf("# Process: Unbecoming, the Penalty"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
