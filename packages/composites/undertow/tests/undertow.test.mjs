import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_undertow_demand.md",
  "process_undertow_set.md",
  "process_undertow_tint.md",
];

describe("undertow: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("undertow: manifest", () => {
  it("declares a process composite on persona: a ground root over three bridges", () => {
    expect(manifest.engine).toBe("undertow");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_undertow.md");
  });

  it("hangs all three bridges off the undertow root, in order of locatability", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_undertow.md");
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
    // ground they are running from, and the audit surfaces where a play lets a verdict
    // stand without asking what the persona had eaten or slept.
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

describe("undertow: atoms", () => {
  it("re-exports the three ground engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["body", "mood", "temperament"]);
    expect(atoms.body.manifest.engine).toBe("body");
    expect(atoms.temperament.manifest.engine).toBe("temperament");
    expect(atoms.mood.manifest.engine).toBe("mood");
  });

  it("wires one process-typed atom over two position-typed ones", () => {
    expect(atoms.body.manifest.type).toBe("process");
    expect(atoms.temperament.manifest.type).toBe("position");
    expect(atoms.mood.manifest.type).toBe("position");
  });
});

describe("undertow: compose()", () => {
  it("composes every bridge root-first, carrying the undertow root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Undertow")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_undertow_tint.md" });
    expect(out.indexOf("# Process: Undertow\n")).toBeLessThan(
      out.indexOf("# Process: Undertow, the Tint"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
