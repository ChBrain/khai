import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_capability_theory.md",
  "process_capability_reach.md",
  "process_capability_guard.md",
];

describe("capability: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("capability: manifest", () => {
  it("declares a process composite on persona: a self-belief root over three bridges", () => {
    expect(manifest.engine).toBe("capability");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_capability.md");
  });

  it("hangs all three bridges off the capability root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_capability.md");
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
    // part of its self-belief in play, and the audit surfaces where it does not.
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

describe("capability: atoms", () => {
  it("re-exports the four self-belief engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual([
      "locus-of-control",
      "mindset",
      "self-efficacy",
      "self-handicapping",
    ]);
    expect(atoms.mindset.manifest.engine).toBe("mindset");
    expect(atoms["locus-of-control"].manifest.engine).toBe("locus-of-control");
    expect(atoms["self-efficacy"].manifest.engine).toBe("self-efficacy");
    expect(atoms["self-handicapping"].manifest.engine).toBe("self-handicapping");
  });
});

describe("capability: compose()", () => {
  it("composes every bridge root-first, carrying the capability root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Capability")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_capability_guard.md" });
    expect(out.indexOf("# Process: Capability\n")).toBeLessThan(
      out.indexOf("# Process: Capability, the Guard"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
