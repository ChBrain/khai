import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_befalling_reading.md",
  "process_befalling_strain.md",
  "process_befalling_turn.md",
];

describe("befalling: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("befalling: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("befalling");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_befalling.md");
  });

  it("hangs all three bridges off the befalling root, in the order the accounting takes", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_befalling.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link how they have accounted for somebody
    // else's misfortune, and the audit surfaces where a play stages a suffering and never
    // says what the watchers made of it.
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

describe("befalling: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["attribution", "belief-in-a-just-world"]);
    expect(atoms.attribution.manifest.engine).toBe("attribution");
    expect(atoms["belief-in-a-just-world"].manifest.engine).toBe("belief-in-a-just-world");
  });

  it("wires a process atom and a position atom, both attached where the composite reads", () => {
    expect(atoms.attribution.manifest.type).toBe("process");
    expect(atoms["belief-in-a-just-world"].manifest.type).toBe("position");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // An engine belongs to as many composites as have a question for it. The squaring
  // composite wires this same attribution engine on a persona repairing their own account;
  // here it runs on somebody else's luck, and what is protected is a picture of the world
  // rather than a picture of oneself. This pins the shared wiring so the pair stays
  // deliberate rather than accidental.
  it("shares the attribution engine with the squaring composite", () => {
    const squaring = JSON.parse(
      readFileSync(join(pkgDir, "..", "squaring", "package.json"), "utf8"),
    );
    expect(Object.keys(squaring.dependencies)).toContain("@chbrain/khai-engine-attribution");
    expect(atoms.attribution.manifest.engine).toBe("attribution");
  });

  // The keystone runs a cause out of the placements that leave a misfortune unearned and
  // into the ones that do not, under a conviction that cannot take the first kind. It needs
  // all four placements at one end and both forms of the belief at the other.
  it("keeps the four placements the turn migrates across", () => {
    const files = atoms.attribution.manifest.members.map((m) => m.file);
    expect(files).toEqual(
      expect.arrayContaining([
        "process_chance.md",
        "process_circumstance.md",
        "process_effort.md",
        "process_disposition.md",
      ]),
    );
  });

  // The just-world atom is a shorthand-root engine: it declares an `anchor` and named
  // `expressions` instead of a `members` array, so a consumer reading its tree has to take
  // that shape into account. The strain bridge links all three files by name.
  it("keeps the shorthand root and both forms of the belief the strain presses on", () => {
    const jw = atoms["belief-in-a-just-world"].manifest;
    expect(jw.members).toBeUndefined();
    expect(jw.anchor).toBe("position_just_world_belief.md");
    expect(jw.expressions).toEqual({
      personal: "position_personal.md",
      general: "position_general.md",
    });
  });
});

describe("befalling: compose()", () => {
  it("composes every bridge root-first, carrying the befalling root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Befalling")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_befalling_turn.md" });
    expect(out.indexOf("# Process: Befalling\n")).toBeLessThan(
      out.indexOf("# Process: Befalling, the Turn"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
