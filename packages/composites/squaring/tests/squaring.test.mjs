import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_squaring_cause.md",
  "process_squaring_revision.md",
  "process_squaring_suspension.md",
];

describe("squaring: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("squaring: manifest", () => {
  it("declares a process composite on persona: an account root over three bridges", () => {
    expect(manifest.engine).toBe("squaring");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_squaring.md");
  });

  it("hangs all three bridges off the squaring root, in order of depth", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_squaring.md");
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
    // depth at which their account is being repaired, and the audit surfaces where a
    // play has a persona do something out of character and then simply carry on.
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

describe("squaring: atoms", () => {
  it("re-exports the three account-repairing engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["attribution", "dissonance", "moral-disengagement"]);
    expect(atoms.attribution.manifest.engine).toBe("attribution");
    expect(atoms.dissonance.manifest.engine).toBe("dissonance");
    expect(atoms["moral-disengagement"].manifest.engine).toBe("moral-disengagement");
  });
});

describe("squaring: compose()", () => {
  it("composes every bridge root-first, carrying the squaring root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Squaring")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_squaring_suspension.md" });
    expect(out.indexOf("# Process: Squaring\n")).toBeLessThan(
      out.indexOf("# Process: Squaring, the Suspension"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
