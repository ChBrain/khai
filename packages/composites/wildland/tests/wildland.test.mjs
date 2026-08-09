import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_wildland_upheaval.md",
  "process_wildland_wearing.md",
  "process_wildland_reclaiming.md",
];

describe("wildland: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("wildland: manifest", () => {
  it("declares a process composite on place: a land-life root over three bridges", () => {
    expect(manifest.engine).toBe("wildland");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_wildland.md");
  });

  it("hangs all three bridges off the wildland root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_wildland.md");
    }
  });

  it("wires the law at fail and a single piece... on place at Shown, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The composite's cargo link is advisory, not a hard gate: a play may link the
    // shape its land's life is in, and the audit surfaces where it does not.
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

describe("wildland: atoms", () => {
  it("re-exports the five land-forces it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual([
      "erosion",
      "fire",
      "geomorphology",
      "hydrology",
      "succession",
    ]);
    expect(atoms.geomorphology.manifest.engine).toBe("geomorphology");
    expect(atoms.erosion.manifest.engine).toBe("erosion");
    expect(atoms.hydrology.manifest.engine).toBe("hydrology");
    expect(atoms.fire.manifest.engine).toBe("fire");
    expect(atoms.succession.manifest.engine).toBe("succession");
  });

  it("references climate as the governing frame, not a wired atom", () => {
    expect(atoms).not.toHaveProperty("climate");
    expect(manifest.requires.some((r) => r.on === "climate")).toBe(false);
  });
});

describe("wildland: compose()", () => {
  it("composes every bridge root-first, carrying the wildland root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Wildland")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_wildland_reclaiming.md" });
    expect(out.indexOf("# Process: Wildland\n")).toBeLessThan(
      out.indexOf("# Process: Wildland, Reclaiming"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
