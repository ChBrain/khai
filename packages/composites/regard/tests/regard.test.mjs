import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_regard_nod.md", "process_regard_spotlight.md", "process_regard_blank.md"];

describe("regard: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("regard: manifest", () => {
  it("declares a process composite on persona: an answer root over three bridges", () => {
    expect(manifest.engine).toBe("regard");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_regard.md");
  });

  it("hangs all three bridges off the regard root, in order of attention given", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_regard.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The composite's cargo link is advisory, not a hard gate: a persona may link the
    // answer the room gave them, and the audit surfaces where a play shows a claim made
    // and never says what came back.
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

describe("regard: atoms", () => {
  it("re-exports the three answer engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["embarrassment", "ostracism", "recognition"]);
    expect(atoms.recognition.manifest.engine).toBe("recognition");
    expect(atoms.embarrassment.manifest.engine).toBe("embarrassment");
    expect(atoms.ostracism.manifest.engine).toBe("ostracism");
  });

  it("wires three process-typed atoms, so all three read as answers rather than states", () => {
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.type, name).toBe("process");
    }
  });

  // The seam is not asserted by this composite -- it is already declared inside the
  // recognition atom, whose encounter phase names three outcomes and only three. If that
  // member ever leaves the atom, the composite's warrant has moved and REFERENCES is stale.
  it("keeps the encounter phase the join rests on", () => {
    const files = atoms.recognition.manifest.members.map((m) => m.file);
    expect(files).toContain("process_encounter.md");
  });
});

describe("regard: compose()", () => {
  it("composes every bridge root-first, carrying the regard root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Regard")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_regard_blank.md" });
    expect(out.indexOf("# Process: Regard\n")).toBeLessThan(
      out.indexOf("# Process: Regard, the Blank"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
