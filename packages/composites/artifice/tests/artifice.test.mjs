// The artifice composite tests only what is composite-specific: canon
// conformance through the shared kit (which resolves the hard package links
// through the declared dependencies -- here, six engines), the manifest
// contract, compose(), and that all six atoms arrive with the package.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "piece_artifice_concord.md",
  "piece_artifice_extraction.md",
  "piece_artifice_discord.md",
];

describe("artifice: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose + hard links)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("artifice: manifest", () => {
  it("declares the composite and its root plus three bridges", () => {
    expect(manifest.engine).toBe("artifice");
    expect(manifest.type).toBe("piece");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("piece_artifice.md");
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("piece_artifice.md");
    }
  });

  it("declares the law (fail) and the piece link at Load Bearing (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "piece",
      section: "Load Bearing",
      link: "expression",
      level: "audit",
    });
  });
});

describe("artifice: the atoms are six design engines", () => {
  it("re-exports all six dependency engines", () => {
    expect(Object.keys(atoms).sort()).toEqual([
      "agency",
      "captology",
      "choice-architecture",
      "ergonomics",
      "guile",
      "usability",
    ]);
  });

  // The sixth force is the one an object cannot be without: five of the atoms
  // read something a maker may simply not have done, and choice-architecture
  // reads a setting that exists whether or not anyone set it. That asymmetry is
  // what the composite's three bridges were re-cut around, so pin the atom's own
  // shape here -- a piece engine over an arrangement root and four facets.
  it("wires the arrangement atom as a piece engine over four facets", () => {
    const ca = atoms["choice-architecture"].manifest;
    expect(ca.engine).toBe("choice-architecture");
    expect(ca.type).toBe("piece");
    expect(ca.members.find((m) => m.parent === null).file).toBe("piece_choice_architecture.md");
    expect(ca.members.filter((m) => m.parent !== null).map((m) => m.file)).toEqual([
      "piece_preset.md",
      "piece_sludge.md",
      "piece_ordering.md",
      "piece_assortment.md",
    ]);
  });

  it("keeps every atom on the piece type, so all six read on one object", () => {
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.type, name).toBe("piece");
    }
  });
});

describe("artifice: compose()", () => {
  it("composes every bridge root-first, carrying the artifice root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Piece: Artifice")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "piece_artifice_extraction.md" });
    expect(out.indexOf("# Piece: Artifice\n")).toBeLessThan(
      out.indexOf("# Piece: Artifice, Extraction"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "piece_nope.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
