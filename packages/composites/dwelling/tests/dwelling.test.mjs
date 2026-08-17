import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_dwelling_gathered.md",
  "process_dwelling_restored.md",
  "process_dwelling_rooted.md",
];

describe("dwelling: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("dwelling: manifest", () => {
  it("declares a process composite on persona: a held-by-place root over three bridges", () => {
    expect(manifest.engine).toBe("dwelling");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_dwelling.md");
  });

  it("hangs all three bridges off the dwelling root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_dwelling.md");
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
    // way a place holds it, and the audit surfaces where it does not.
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

describe("dwelling: atoms", () => {
  it("re-exports the three sustaining-place engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual([
      "place-attachment",
      "restorative-environment",
      "third-place",
    ]);
    expect(atoms["third-place"].manifest.engine).toBe("third-place");
    expect(atoms["restorative-environment"].manifest.engine).toBe("restorative-environment");
    expect(atoms["place-attachment"].manifest.engine).toBe("place-attachment");
  });
});

describe("dwelling: compose()", () => {
  it("composes every bridge root-first, carrying the dwelling root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Dwelling")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_dwelling_rooted.md" });
    expect(out.indexOf("# Process: Dwelling\n")).toBeLessThan(
      out.indexOf("# Process: Dwelling, the Rooted"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
