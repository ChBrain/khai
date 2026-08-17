import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_blaze_kindling.md", "process_blaze_run.md", "process_blaze_renewal.md"];

describe("blaze: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("blaze: manifest", () => {
  it("declares a process composite on place: a fire-life root over three bridges", () => {
    expect(manifest.engine).toBe("blaze");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_blaze.md");
  });

  it("hangs all three bridges off the blaze root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_blaze.md");
    }
  });

  it("wires the law at fail and the cargo on place at Shown, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The composite's cargo link is advisory, not a hard gate: a play may link the
    // stage its fire's life is in, and the audit surfaces where it does not.
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

describe("blaze: atoms", () => {
  it("re-exports the two fire engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["combustion", "fire"]);
    expect(atoms.fire.manifest.engine).toBe("fire");
    expect(atoms.combustion.manifest.engine).toBe("combustion");
  });
});

describe("blaze: compose()", () => {
  it("composes every bridge root-first, carrying the blaze root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Blaze")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_blaze_renewal.md" });
    expect(out.indexOf("# Process: Blaze\n")).toBeLessThan(
      out.indexOf("# Process: Blaze, Renewal"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
