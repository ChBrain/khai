// The extended-self engine tests only what is extended-self-specific: that the
// package conforms to the canon through the shared conformance kit
// (@chbrain/khai-tests), its manifest contract, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("extended-self: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("extended-self: manifest", () => {
  it("declares the extended-self engine rooted on a piece over a position and two processes", () => {
    expect(manifest.engine).toBe("extended-self");
    expect(manifest.type).toBe("piece");
    expect(manifest.members).toHaveLength(4);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("piece_extended_self.md");

    const byType = (t) => manifest.members.filter((m) => m.type === t).map((m) => m.file);
    expect(byType("piece")).toEqual(["piece_extended_self.md"]);
    expect(byType("position")).toEqual(["position_possessor.md"]);
    expect(byType("process")).toEqual(["process_appropriation.md", "process_dispossession.md"]);
  });

  it("every non-root member hangs off the extended-self piece", () => {
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("piece_extended_self.md");
    }
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

describe("extended-self: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: piece root first`, () => {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Piece: Extended Self");
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_nope.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
