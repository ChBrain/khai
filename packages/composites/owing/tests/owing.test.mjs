import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_owing_giving.md", "process_owing_owed.md", "process_owing_settling.md"];

describe("owing: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("owing: manifest", () => {
  it("declares a process composite on persona: an obligation root over three bridges", () => {
    expect(manifest.engine).toBe("owing");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_owing.md");
  });

  it("hangs all three bridges off the owing root, in order of exactness", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_owing.md");
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
    // degree of exactness the obligation has reached, and the audit surfaces where a
    // play moves value between two people without reading what it left behind.
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

describe("owing: atoms", () => {
  it("re-exports the three obligation engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["debt", "gift", "money"]);
    expect(atoms.gift.manifest.engine).toBe("gift");
    expect(atoms.debt.manifest.engine).toBe("debt");
    expect(atoms.money.manifest.engine).toBe("money");
  });
});

describe("owing: compose()", () => {
  it("composes every bridge root-first, carrying the owing root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Owing")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_owing_settling.md" });
    expect(out.indexOf("# Process: Owing\n")).toBeLessThan(
      out.indexOf("# Process: Owing, the Settling"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
