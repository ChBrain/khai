import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_striving_pull.md",
  "process_striving_stance.md",
  "process_striving_stay.md",
];

describe("striving: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("striving: manifest", () => {
  it("declares a process composite on persona: a striving-character root over three bridges", () => {
    expect(manifest.engine).toBe("striving");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_striving.md");
  });

  it("hangs all three bridges off the striving root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_striving.md");
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
    // disposition its striving shows, and the audit surfaces where it does not.
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

describe("striving: atoms", () => {
  it("re-exports the three striving dispositions it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["achievement-motive", "grit", "regulatory-focus"]);
    expect(atoms["achievement-motive"].manifest.engine).toBe("achievement-motive");
    expect(atoms["regulatory-focus"].manifest.engine).toBe("regulatory-focus");
    expect(atoms.grit.manifest.engine).toBe("grit");
  });
});

describe("striving: compose()", () => {
  it("composes every bridge root-first, carrying the striving root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Striving")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_striving_stay.md" });
    expect(out.indexOf("# Process: Striving\n")).toBeLessThan(
      out.indexOf("# Process: Striving, the Stay"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
