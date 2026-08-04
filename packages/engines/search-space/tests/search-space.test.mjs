// The search-space engine tests only what is search-space-specific: that the
// package conforms to the canon through the shared conformance kit
// (@chbrain/khai-tests), its manifest contract, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("search-space: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("search-space: manifest", () => {
  it("declares the search-space place engine", () => {
    expect(manifest.engine).toBe("search-space");
    expect(manifest.type).toBe("place");
  });
});

describe("search-space: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes leaf ${leaf}`, () => {
      const out = compose({ leaf });
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "nonexistent.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
