// The nostalgia engine tests only what is nostalgia-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("nostalgia: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("nostalgia: manifest", () => {
  it("declares the nostalgia process engine and its anchor", () => {
    expect(manifest.engine).toBe("nostalgia");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("process_nostalgia.md");
  });

  it("declares the four functions the source documents", () => {
    const files = manifest.members.map((m) => m.file).sort();
    expect(files).toEqual([
      "process_connectedness.md",
      "process_continuity.md",
      "process_existential.md",
      "process_nostalgia.md",
      "process_positivity.md",
    ]);
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

describe("nostalgia: compose()", () => {
  const root = "Process: Nostalgia";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first, then the function`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
      expect(out.indexOf(root)).toBeLessThan(out.indexOf("Initiated by"));
    });
  }

  it("rejects an unknown function", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing function", () => {
    expect(() => compose({})).toThrow();
  });
});
