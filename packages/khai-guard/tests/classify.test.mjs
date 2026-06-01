import { describe, it, expect } from "vitest";
import { classify, resolveConfig, parseNameStatus, DEFAULT_CONFIG } from "../index.mjs";

describe("classify (default config)", () => {
  it("source-only is not mixed", () => {
    expect(classify(["src/a.ts", "public/x.svg"]).mixed).toBe(false);
  });

  it("test-only is not mixed", () => {
    expect(classify(["tests/a.test.ts", ".github/workflows/ci.yml"]).mixed).toBe(false);
  });

  it("source + test is mixed, and reports both sides", () => {
    const r = classify(["src/a.ts", "tests/a.test.ts"]);
    expect(r.mixed).toBe(true);
    expect(r.source).toEqual(["src/a.ts"]);
    expect(r.test).toEqual(["tests/a.test.ts"]);
  });

  it("docs / neither-bucket changes are not mixed", () => {
    expect(classify(["README.md", "docs/x.md", "package.json"]).mixed).toBe(false);
  });

  it("treats CI workflows and git hooks as the verifier (test) layer", () => {
    expect(classify([".husky/pre-push"]).test).toEqual([".husky/pre-push"]);
    expect(classify([".github/workflows/ci.yml"]).test.length).toBe(1);
    // ...and mixing a workflow with product source trips it.
    expect(classify(["src/a.ts", ".github/workflows/ci.yml"]).mixed).toBe(true);
  });
});

describe("classify (overridden config)", () => {
  const cfg = resolveConfig({
    source: ["packages/*/architecture/**"],
    test: ["packages/*/tests/**"],
  });

  it("uses the consumer's buckets", () => {
    expect(
      classify(
        ["packages/khai-arch/architecture/plot.md", "packages/khai-arch/tests/x.test.ts"],
        cfg,
      ).mixed,
    ).toBe(true);
  });

  it("paths outside the overridden buckets are inert", () => {
    // src/** is the default source bucket but NOT in this config.
    expect(classify(["src/a.ts"], cfg).mixed).toBe(false);
    expect(classify(["src/a.ts"], cfg).source).toEqual([]);
  });

  it("override is per-key (exemptRenames default survives)", () => {
    expect(cfg.exemptRenames).toBe(DEFAULT_CONFIG.exemptRenames);
  });
});

describe("parseNameStatus", () => {
  it("exempts pure renames (R100) and copies (C100)", () => {
    const out = parseNameStatus(["R100\tsrc/old.ts\tsrc/new.ts", "M\tsrc/a.ts"]);
    expect(out).toEqual(["src/a.ts"]);
  });

  it("judges a rename-with-edit by its destination path", () => {
    expect(parseNameStatus(["R096\told.ts\ttests/new.test.ts"])).toEqual(["tests/new.test.ts"]);
  });

  it("includes modified + added paths", () => {
    expect(parseNameStatus(["M\tsrc/a.ts", "A\ttests/b.test.ts"])).toEqual([
      "src/a.ts",
      "tests/b.test.ts",
    ]);
  });

  it("can be told NOT to exempt renames", () => {
    expect(parseNameStatus(["R100\told\tnew"], { exemptRenames: false })).toEqual(["new"]);
  });

  it("ignores blank lines", () => {
    expect(parseNameStatus(["", "M\ta", "   "])).toEqual(["a"]);
  });
});
