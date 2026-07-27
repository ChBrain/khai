// The crosstalk composite tests only what is composite-specific: canon
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

describe("crosstalk: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose + hard links)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("crosstalk: manifest", () => {
  it("declares the composite and its root plus three bridges", () => {
    expect(manifest.engine).toBe("crosstalk");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_crosstalk.md");
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(["process_mismatch.md", "process_loop.md", "process_impasse.md"]);
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

describe("crosstalk: the atoms arrive with the package", () => {
  it("re-exports the three dependency engines", () => {
    expect(Object.keys(atoms).sort()).toEqual(["accommodation", "framing", "grounding"]);
    for (const atom of Object.values(atoms)) {
      expect(typeof atom.compose).toBe("function");
      expect(atom.manifest.engine).toBeTruthy();
    }
  });
});

describe("crosstalk: compose()", () => {
  const root = "Process: Crosstalk";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the bridge`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
      expect(out.indexOf(root)).toBeLessThan(out.indexOf("Initiated by"));
    });
  }

  it("rejects an unknown bridge", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing bridge", () => {
    expect(() => compose({})).toThrow();
  });
});
