// The post-traumatic-growth composite tests only what is composite-specific:
// canon conformance through the shared kit (which resolves the hard package
// links through the declared dependencies), the manifest contract, compose(),
// and that the atoms arrive with the package.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("post-traumatic-growth: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose + hard links)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("post-traumatic-growth: manifest", () => {
  it("declares the composite and its root", () => {
    expect(manifest.engine).toBe("post-traumatic-growth");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(3);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("process_post_traumatic_growth.md");
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

describe("post-traumatic-growth: the atoms arrive with the package", () => {
  it("re-exports the four dependency engines", () => {
    expect(Object.keys(atoms).sort()).toEqual(["identity", "meaning", "mortality", "narrative"]);
    for (const atom of Object.values(atoms)) {
      expect(typeof atom.compose).toBe("function");
      expect(atom.manifest.engine).toBeTruthy();
    }
  });
});

describe("post-traumatic-growth: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first`, () => {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Post-Traumatic Growth");
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_nope.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
