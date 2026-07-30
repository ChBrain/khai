// The bittersweet composite tests only what is composite-specific: canon
// conformance through the shared kit (which resolves the hard package links
// through the declared dependencies), the manifest contract, compose(), and
// that the atoms arrive with the package.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("bittersweet: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose + hard links)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("bittersweet: manifest", () => {
  it("declares the composite and its root", () => {
    expect(manifest.engine).toBe("bittersweet");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("process_bittersweet.md");
  });

  it("hangs all three bridges off the root", () => {
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_bittersweet.md");
    }
    expect(manifest.members.map((m) => m.file)).toEqual([
      "process_bittersweet.md",
      "process_bittersweet_mix.md",
      "process_bittersweet_turn.md",
      "process_bittersweet_meaning.md",
    ]);
  });

  it("declares the law (fail) and the persona link (audit)", () => {
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
      level: "audit",
    });
  });
});

describe("bittersweet: the atoms arrive with the package", () => {
  it("re-exports the two dependency engines", () => {
    expect(Object.keys(atoms).sort()).toEqual(["joy", "sadness"]);
    for (const atom of Object.values(atoms)) {
      expect(typeof atom.compose).toBe("function");
      expect(atom.manifest.engine).toBeTruthy();
    }
  });
});

describe("bittersweet: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first`, () => {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Bittersweet");
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_nope.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
