import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_grain_latitude.md", "process_grain_bounds.md", "process_grain_worth.md"];

describe("grain: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("grain: manifest", () => {
  it("declares a process composite on persona: a settings root over three bridges", () => {
    expect(manifest.engine).toBe("grain");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_grain.md");
  });

  it("hangs all three bridges off the grain root, field then self then worth", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_grain.md");
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
    // settings it was formed along, and the audit surfaces where a play puts two
    // personas from different worlds in a room and reads the friction as character.
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

describe("grain: atoms", () => {
  it("re-exports the three setting engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual([
      "self-construal",
      "tightness-looseness",
      "worth-logic",
    ]);
    expect(atoms["tightness-looseness"].manifest.engine).toBe("tightness-looseness");
    expect(atoms["self-construal"].manifest.engine).toBe("self-construal");
    expect(atoms["worth-logic"].manifest.engine).toBe("worth-logic");
  });
});

describe("grain: compose()", () => {
  it("composes every bridge root-first, carrying the grain root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Grain")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_grain_worth.md" });
    expect(out.indexOf("# Process: Grain\n")).toBeLessThan(
      out.indexOf("# Process: Grain, the Worth"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
