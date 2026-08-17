import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_selfhood_measure.md",
  "process_selfhood_repair.md",
  "process_selfhood_anchor.md",
];

describe("selfhood: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("selfhood: manifest", () => {
  it("declares a process composite on persona: a self-concept root over three bridges", () => {
    expect(manifest.engine).toBe("selfhood");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_selfhood.md");
  });

  it("hangs all three bridges off the selfhood root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_selfhood.md");
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
    // working of its self-concept in play, and the audit surfaces where it does not.
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

describe("selfhood: atoms", () => {
  it("re-exports the four self-concept engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual([
      "possible-selves",
      "self-affirmation",
      "self-discrepancy",
      "self-verification",
    ]);
    expect(atoms["self-discrepancy"].manifest.engine).toBe("self-discrepancy");
    expect(atoms["possible-selves"].manifest.engine).toBe("possible-selves");
    expect(atoms["self-affirmation"].manifest.engine).toBe("self-affirmation");
    expect(atoms["self-verification"].manifest.engine).toBe("self-verification");
  });
});

describe("selfhood: compose()", () => {
  it("composes every bridge root-first, carrying the selfhood root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Selfhood")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_selfhood_anchor.md" });
    expect(out.indexOf("# Process: Selfhood\n")).toBeLessThan(
      out.indexOf("# Process: Selfhood, the Anchor"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
