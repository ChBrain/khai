import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_appetite_given.md",
  "process_appetite_taken.md",
  "process_appetite_made.md",
];

describe("appetite: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("appetite: manifest", () => {
  it("declares a process composite on persona: a requirement root over three bridges", () => {
    expect(manifest.engine).toBe("appetite");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_appetite.md");
  });

  it("hangs all three bridges off the appetite root, in order of provenance", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_appetite.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The composite's cargo link is advisory, not a hard gate: a persona may link where
    // the must driving them came from, and the audit surfaces where a play gives a
    // persona a compulsion and never says whether it was theirs.
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

describe("appetite: atoms", () => {
  it("re-exports the three requirement engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["addiction", "motivation", "needs"]);
    expect(atoms.needs.manifest.engine).toBe("needs");
    expect(atoms.motivation.manifest.engine).toBe("motivation");
    expect(atoms.addiction.manifest.engine).toBe("addiction");
  });
});

describe("appetite: compose()", () => {
  it("composes every bridge root-first, carrying the appetite root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Appetite")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_appetite_made.md" });
    expect(out.indexOf("# Process: Appetite\n")).toBeLessThan(
      out.indexOf("# Process: Appetite, the Made"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
