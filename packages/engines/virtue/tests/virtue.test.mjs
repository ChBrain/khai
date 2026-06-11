// The virtue engine tests only what is virtue-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, and its compose() behavior. The kit's own drift
// detection is proved in @chbrain/khai-tests.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

// --- self-conformance: virtue certifies itself against the canon ----------
describe("virtue: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

// --- manifest contract ----------------------------------------------------
describe("virtue: manifest", () => {
  it("declares the virtue firing engine: a process root with fourteen pole positions", () => {
    expect(manifest.engine).toBe("virtue");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(15);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("process_virtue.md");
    expect(root.type).toBe("process");
    const poles = manifest.members.filter((m) => m.parent === "process_virtue.md");
    expect(poles).toHaveLength(14);
    expect(poles.every((m) => m.type === "position")).toBe(true);
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

// --- behavior: compose() carries the firing anchor upward ------------------
describe("virtue: compose()", () => {
  const root = "Process: Virtue";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: anchor first, then the pole`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
      expect(out.indexOf(root)).toBeLessThan(out.indexOf("## Has"));
    });
  }

  it("rejects an unknown pole", () => {
    expect(() => compose({ leaf: "position_courage.md" })).toThrow();
  });

  it("rejects a missing pole", () => {
    expect(() => compose({})).toThrow();
  });
});
