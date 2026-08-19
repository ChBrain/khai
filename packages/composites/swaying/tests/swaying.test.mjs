import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_swaying_case.md", "process_swaying_kick.md", "process_swaying_give.md"];

describe("swaying: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("swaying: manifest", () => {
  it("declares a process composite on persona: an attempt root over three bridges", () => {
    expect(manifest.engine).toBe("swaying");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_swaying.md");
  });

  it("hangs all three bridges off the swaying root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_swaying.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The cargo link is advisory, not a hard gate: a persona may link what is happening to
    // the position between them, and the audit surfaces where a play stages an attempt to
    // move somebody and never says what the attempting did.
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

describe("swaying: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["persuasion", "reactance"]);
    expect(atoms.persuasion.manifest.engine).toBe("persuasion");
    expect(atoms.reactance.manifest.engine).toBe("reactance");
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

  // The give bridge works on the kick and leaves the case untouched, which needs the
  // reactance atom to model the pushback in forms the subtraction can actually reach:
  // the position held harder and the discouraged option gaining value. Lose either and
  // the third bridge has nothing to be subtracting from.
  it("keeps the reactance forms the give bridge subtracts from", () => {
    const r = atoms.reactance.manifest.members.map((m) => m.file);
    expect(r).toContain("process_defiance.md");
    expect(r).toContain("process_allure.md");
  });
});

describe("swaying: compose()", () => {
  it("composes every bridge root-first, carrying the swaying root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Swaying")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_swaying_give.md" });
    expect(out.indexOf("# Process: Swaying\n")).toBeLessThan(
      out.indexOf("# Process: Swaying, the Give"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
