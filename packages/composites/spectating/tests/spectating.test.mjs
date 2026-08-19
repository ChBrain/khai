import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_spectating_access.md",
  "process_spectating_siding.md",
  "process_spectating_carry.md",
];

describe("spectating: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("spectating: manifest", () => {
  it("declares a process composite on persona: a position root over three bridges", () => {
    expect(manifest.engine).toBe("spectating");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_spectating.md");
  });

  it("hangs all three bridges off the spectating root, in the order the teller sets", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_spectating.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The cargo link is advisory, not a hard gate: a persona receiving a story may link
    // what it is doing to them, and the audit surfaces where a production hands an
    // audience a verdict and never says what access produced it.
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

describe("spectating: atoms", () => {
  it("re-exports the three engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["allegiance", "dramatic-irony", "transportation"]);
    expect(atoms["dramatic-irony"].manifest.engine).toBe("dramatic-irony");
    expect(atoms.allegiance.manifest.engine).toBe("allegiance");
    expect(atoms.transportation.manifest.engine).toBe("transportation");
  });

  it("wires three process-typed atoms, all attached where the composite reads", () => {
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

  // An engine belongs to as many composites as have a question for it. The elsewhere
  // composite wires this same transportation engine as one of the ways a mind leaves the
  // room; here it is what a made story does once the audience is inside. This pins the
  // shared wiring so the pair stays deliberate rather than accidental.
  it("shares the transportation engine with the elsewhere composite", () => {
    const elsewhere = JSON.parse(
      readFileSync(join(pkgDir, "..", "elsewhere", "package.json"), "utf8"),
    );
    expect(Object.keys(elsewhere.dependencies)).toContain("@chbrain/khai-engine-transportation");
    expect(atoms.transportation.manifest.engine).toBe("transportation");
  });

  // The keystone runs from a distributed gap to a suspended check, so it needs the
  // foreknowledge that opens the gap at one end and the entry that closes the room at the
  // other. Lose either and the composite has no two ends to connect.
  it("keeps the members the keystone runs between", () => {
    expect(atoms["dramatic-irony"].manifest.members.map((m) => m.file)).toContain(
      "process_foreknowledge.md",
    );
    expect(atoms.transportation.manifest.members.map((m) => m.file)).toContain("process_entry.md");
  });
});

describe("spectating: compose()", () => {
  it("composes every bridge root-first, carrying the spectating root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Spectating")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_spectating_carry.md" });
    expect(out.indexOf("# Process: Spectating\n")).toBeLessThan(
      out.indexOf("# Process: Spectating, the Carry"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
