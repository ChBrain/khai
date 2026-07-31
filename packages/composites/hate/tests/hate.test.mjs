// The hate composite tests only what is composite-specific: canon conformance
// through the shared kit (which resolves the hard package links through the
// declared dependencies), the manifest contract, compose(), and that the atoms
// arrive with the package.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("hate: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose + hard links)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("hate: manifest", () => {
  it("declares the composite and its root plus three bridges", () => {
    expect(manifest.engine).toBe("hate");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_hate.md");
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(["process_boiling.md", "process_seething.md", "process_burning.md"]);
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

describe("hate: the atoms arrive with the package", () => {
  it("re-exports the three dependency engines", () => {
    expect(Object.keys(atoms).sort()).toEqual(["anger", "contempt", "disgust"]);
  });
});

describe("hate: compose()", () => {
  it("composes every bridge root-first, carrying the hate root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Hate")).toBe(true);
    }
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_nope.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
