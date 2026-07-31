// The love-hate composite tests only what is composite-specific: canon
// conformance through the shared kit (which resolves the hard package links
// through the declared dependencies -- here, two composites), the manifest
// contract, compose(), and that the atoms arrive with the package.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("love-hate: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose + hard links)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("love-hate: manifest", () => {
  it("declares the composite and its root plus three bridges", () => {
    expect(manifest.engine).toBe("love-hate");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_love_hate.md");
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual([
      "process_love_hate_holding.md",
      "process_love_hate_turn.md",
      "process_love_hate_bind.md",
    ]);
  });

  it("declares the law (fail) and the plot link (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "plot",
      section: "Tension",
      link: "expression",
      level: "audit",
    });
  });
});

describe("love-hate: the atoms are themselves composites", () => {
  it("re-exports the two dependency composites", () => {
    expect(Object.keys(atoms).sort()).toEqual(["hate", "love"]);
  });
});

describe("love-hate: compose()", () => {
  it("composes every bridge root-first, carrying the love-hate root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Love-Hate")).toBe(true);
    }
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_nope.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
