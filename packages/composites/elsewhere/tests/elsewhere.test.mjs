import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_elsewhere_conjured.md",
  "process_elsewhere_borrowed.md",
  "process_elsewhere_rebuilt.md",
];

describe("elsewhere: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("elsewhere: manifest", () => {
  it("declares a process composite on persona: a constructing root over three bridges", () => {
    expect(manifest.engine).toBe("elsewhere");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_elsewhere.md");
  });

  it("hangs all three bridges off the elsewhere root, in order of the guard", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_elsewhere.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The composite's cargo link is advisory, not a hard gate: a persona may link which
    // construction they are running, and the audit surfaces where a play treats a
    // persona's recollection as evidence.
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

describe("elsewhere: atoms", () => {
  it("re-exports the three constructive engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["imagination", "memory", "transportation"]);
    expect(atoms.imagination.manifest.engine).toBe("imagination");
    expect(atoms.transportation.manifest.engine).toBe("transportation");
    expect(atoms.memory.manifest.engine).toBe("memory");
  });
});

describe("elsewhere: compose()", () => {
  it("composes every bridge root-first, carrying the elsewhere root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Elsewhere")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_elsewhere_rebuilt.md" });
    expect(out.indexOf("# Process: Elsewhere\n")).toBeLessThan(
      out.indexOf("# Process: Elsewhere, the Rebuilt"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
