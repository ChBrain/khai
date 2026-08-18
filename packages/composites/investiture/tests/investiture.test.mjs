import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_investiture_held.md",
  "process_investiture_handed.md",
  "process_investiture_hallowed.md",
];

describe("investiture: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("investiture: manifest", () => {
  it("declares a process composite on persona: a charged-object root over three bridges", () => {
    expect(manifest.engine).toBe("investiture");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_investiture.md");
  });

  it("hangs all three bridges off the investiture root, in widening order", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_investiture.md");
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
    // width at which they hold a charged object, and the audit surfaces where a play
    // destroys, sells, or hands over a thing without reading whose identity was in it.
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

describe("investiture: atoms", () => {
  it("re-exports the three charged-object engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["extended-self", "heirloom", "totem"]);
    expect(atoms["extended-self"].manifest.engine).toBe("extended-self");
    expect(atoms.heirloom.manifest.engine).toBe("heirloom");
    expect(atoms.totem.manifest.engine).toBe("totem");
  });
});

describe("investiture: compose()", () => {
  it("composes every bridge root-first, carrying the investiture root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Investiture")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_investiture_hallowed.md" });
    expect(out.indexOf("# Process: Investiture\n")).toBeLessThan(
      out.indexOf("# Process: Investiture, the Hallowed"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
