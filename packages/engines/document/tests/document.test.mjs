// The document engine tests only what is document-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("document: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("document: manifest", () => {
  it("declares the document engine rooted on a piece", () => {
    expect(manifest.engine).toBe("document");
    expect(manifest.type).toBe("piece");
    expect(manifest.members).toHaveLength(4);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("piece_document.md");
  });

  it("declares both enforceable wiring altitudes, each at its level", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "persona",
      section: "Projection",
      link: "expression",
      level: "fail",
    });
  });
});

describe("document: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: anchor first`, () => {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Piece: Document");
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_nope.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
