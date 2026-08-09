import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_incubation.md", "process_illumination.md", "process_verification.md"];

describe("creativity: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("creativity: manifest", () => {
  it("declares a process composite: a creative-process root over three bridges", () => {
    expect(manifest.engine).toBe("creativity");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_creativity.md");
  });

  it("hangs all three bridges off the creativity root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_creativity.md");
    }
  });

  it("wires the law at fail and the cargo on plot/Tension, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The composite's cargo link is advisory, not a hard gate: a plot may link the
    // bridge its creative process stages, and the audit surfaces where it does not.
    expect(manifest.requires).toContainEqual({
      on: "plot",
      section: "Tension",
      link: "expression",
      level: "audit",
    });
    const cargo = manifest.requires.filter((r) => r.on !== "instructions");
    expect(cargo.map((r) => r.on)).toEqual(["plot"]);
  });
});

describe("creativity: atoms", () => {
  it("re-exports the four creative-cognition engines it wires, each loaded", () => {
    expect(Object.keys(atoms).sort()).toEqual([
      "analogy",
      "divergentThinking",
      "insight",
      "mindWandering",
    ]);
    expect(atoms.divergentThinking.manifest.engine).toBe("divergent-thinking");
    expect(atoms.mindWandering.manifest.engine).toBe("mind-wandering");
    expect(atoms.insight.manifest.engine).toBe("insight");
    expect(atoms.analogy.manifest.engine).toBe("analogy");
  });

  it("references decision, motivation, and imagination as neighbours, not wired atoms", () => {
    expect(atoms).not.toHaveProperty("decision");
    expect(atoms).not.toHaveProperty("motivation");
    expect(atoms).not.toHaveProperty("imagination");
    for (const on of ["decision", "motivation", "imagination"]) {
      expect(manifest.requires.some((r) => r.on === on)).toBe(false);
    }
  });
});

describe("creativity: compose()", () => {
  it("composes every bridge root-first, carrying the creativity root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Creativity")).toBe(true);
    }
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });
});
