// The artifice composite tests only what is composite-specific: canon
// conformance through the shared kit (which resolves the hard package links
// through the declared dependencies -- here, five engines), the manifest
// contract, compose(), and that all five atoms arrive with the package.

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

describe("artifice: the atoms are five design engines", () => {
  it("re-exports all five dependency engines", () => {
    expect(Object.keys(atoms).sort()).toEqual([
      "agency",
      "captology",
      "ergonomics",
      "guile",
      "usability",
    ]);
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
