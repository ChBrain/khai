import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_object_cycle_upkeep.md",
  "process_object_cycle_discard.md",
  "process_object_cycle_treasure.md",
];

describe("object-cycle: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("object-cycle: manifest", () => {
  it("declares a process composite on piece: a life root over three bridges", () => {
    expect(manifest.engine).toBe("object-cycle");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_object_cycle.md");
  });

  it("hangs all three bridges off the object-cycle root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_object_cycle.md");
    }
  });

  it("wires the law at fail and the piece cargo at Apparent, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The composite's cargo link is advisory, not a hard gate: a play may link
    // the bridge its object's life is in, and the audit surfaces where it does not.
    expect(manifest.requires).toContainEqual({
      on: "piece",
      section: "Apparent",
      link: "expression",
      level: "audit",
    });
  });
});

describe("object-cycle: atoms", () => {
  it("re-exports the three engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["decay", "restoration", "wear"]);
    expect(atoms.wear.manifest.engine).toBe("wear");
    expect(atoms.decay.manifest.engine).toBe("decay");
    expect(atoms.restoration.manifest.engine).toBe("restoration");
  });
});

describe("object-cycle: compose()", () => {
  it("composes every bridge root-first, carrying the object-cycle root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Object-Cycle")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_object_cycle_treasure.md" });
    expect(out.indexOf("# Process: Object-Cycle\n")).toBeLessThan(
      out.indexOf("# Process: Object-Cycle, Treasure"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
