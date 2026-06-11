// The identity engine tests only what is identity-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, expressions } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("identity: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("identity: manifest", () => {
  it("declares the identity position engine with four statuses", () => {
    expect(manifest.engine).toBe("identity");
    expect(manifest.type).toBe("position");
    expect(manifest.anchor).toBe("position_identity.md");
    expect(Object.keys(manifest.expressions)).toHaveLength(4);
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

describe("identity: compose()", () => {
  for (const expression of Object.keys(expressions)) {
    it(`composes ${expression}: anchor first, then the status`, () => {
      const out = compose({ expression });
      expect(out.trimStart().split("\n")[0]).toBe("# Position: Identity");
      expect(out.includes("## Has")).toBe(true);
    });
  }
  it("rejects an unknown status", () => {
    expect(() => compose({ expression: "position_negotiated" })).toThrow();
  });
  it("rejects a missing status", () => {
    expect(() => compose({})).toThrow();
  });
});
