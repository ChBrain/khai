import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_peopling_errand.md",
  "process_peopling_round.md",
  "process_peopling_loitering.md",
];

describe("peopling: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("peopling: manifest", () => {
  it("declares a process composite: a population root over three bridges", () => {
    expect(manifest.engine).toBe("peopling");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_peopling.md");
  });

  it("hangs all three bridges off the peopling root, in order of compulsion", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_peopling.md");
    }
  });

  it("wires the law at fail and the cargo on place at Shown, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The cargo link sits on place/Shown, the chapter all three atoms attach to, dropped
    // to audit: a place may say what grade of presence it holds, and the audit surfaces
    // where a play stages a public place and never says who is in it or why.
    expect(manifest.requires).toContainEqual({
      on: "place",
      section: "Shown",
      link: "expression",
      level: "audit",
    });
    const cargo = manifest.requires.filter((r) => r.on !== "instructions");
    expect(cargo.map((r) => r.on)).toEqual(["place"]);
  });
});

describe("peopling: atoms", () => {
  it("re-exports the three place engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["legibility", "social-time", "street-life"]);
    expect(atoms.legibility.manifest.engine).toBe("legibility");
    expect(atoms["social-time"].manifest.engine).toBe("social-time");
    expect(atoms["street-life"].manifest.engine).toBe("street-life");
  });

  // The composite reads a place through its occupants, so every atom must attach where it
  // does: at the place, on Shown. An atom that migrated to persona would be reading the
  // person instead, which is dwelling's and midst's territory, not this composite's.
  it("keeps every atom on the chapter it wires over", () => {
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.type, name).toBe("process");
      expect(atom.manifest.requires, name).toContainEqual({
        on: "place",
        section: "Shown",
        link: "expression",
        level: "fail",
      });
    }
  });
});

describe("peopling: compose()", () => {
  it("composes every bridge root-first, carrying the peopling root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Peopling")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_peopling_loitering.md" });
    expect(out.indexOf("# Process: Peopling\n")).toBeLessThan(
      out.indexOf("# Process: Peopling, the Loitering"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
