import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  classify,
  resolveConfig,
  parseNameStatus,
  DEFAULT_CONFIG,
  ConfigError,
} from "../index.mjs";

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

describe("classify (bucket overlap)", () => {
  // When source and test globs intersect, a single path matches both and
  // the verdict is ambiguous. classify must surface those paths in `both`
  // so the CLI can fail as a config error instead of a phantom "mixed".
  const cfg = resolveConfig({
    source: ["packages/**"],
    test: ["packages/*/tests/**"],
  });

  it("reports paths that match both buckets", () => {
    const r = classify(["packages/x/tests/a.test.ts"], cfg);
    expect(r.both).toEqual(["packages/x/tests/a.test.ts"]);
  });

  it("a non-overlapping config never populates `both`", () => {
    expect(classify(["src/a.ts", "tests/a.test.ts"]).both).toEqual([]);
  });
});

describe("resolveConfig (validation)", () => {
  it("null / undefined yields the defaults", () => {
    expect(resolveConfig()).toBe(DEFAULT_CONFIG);
    expect(resolveConfig(null)).toBe(DEFAULT_CONFIG);
  });

  it("rejects a non-object config", () => {
    expect(() => resolveConfig([])).toThrow(ConfigError);
    expect(() => resolveConfig("src/**")).toThrow(ConfigError);
  });

  it("rejects source / test that are not glob arrays", () => {
    expect(() => resolveConfig({ source: "src/**" })).toThrow(ConfigError);
    expect(() => resolveConfig({ test: [1, 2] })).toThrow(ConfigError);
  });

  it("rejects a non-boolean exemptRenames and non-string defaultRef", () => {
    expect(() => resolveConfig({ exemptRenames: "yes" })).toThrow(ConfigError);
    expect(() => resolveConfig({ defaultRef: 5 })).toThrow(ConfigError);
  });

  it("accepts a well-formed override", () => {
    const cfg = resolveConfig({ source: ["a/**"], test: ["b/**"], exemptRenames: false });
    expect(cfg.source).toEqual(["a/**"]);
    expect(cfg.exemptRenames).toBe(false);
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

  it("includes deletions (D) and type changes (T) by their path", () => {
    // Deleting a source file IS a source change; a typechange likewise.
    expect(parseNameStatus(["D\tsrc/gone.ts", "T\tsrc/link.ts"])).toEqual([
      "src/gone.ts",
      "src/link.ts",
    ]);
  });
});

// parseNameStatus must also read the NUL-delimited `-z` stream the CLI now
// feeds it, so paths with odd bytes survive verbatim (PR #272). Dormant until
// the source fix lands on main -- probe index.mjs for the `-z` JSDoc it adds,
// per the cli.test.mjs convention.
const Z_DORMANT = !readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "index.mjs"),
  "utf8",
).includes("NUL-delimited");

describe.skipIf(Z_DORMANT)("parseNameStatus - NUL-delimited (-z) stream", () => {
  // git diff --name-status -z emits status\0path\0 (status\0src\0dst\0 for a
  // rename), terminated by a trailing NUL.
  const z = (...records) => records.map((r) => r.join("\0")).join("\0") + "\0";

  it("parses modified and added paths from a -z stream", () => {
    expect(parseNameStatus(z(["M", "src/a.ts"], ["A", "tests/b.test.ts"]))).toEqual([
      "src/a.ts",
      "tests/b.test.ts",
    ]);
  });

  it("exempts R100 and judges a rename-with-edit by its destination", () => {
    expect(
      parseNameStatus(
        z(["R100", "src/old.ts", "src/new.ts"], ["R096", "old.ts", "tests/new.test.ts"]),
      ),
    ).toEqual(["tests/new.test.ts"]);
  });

  it("preserves a non-ASCII path and an embedded-tab path verbatim", () => {
    // These are exactly the paths the default tab/newline format would C-quote
    // or split apart, making them match no lane and silently pass the gate.
    expect(parseNameStatus(z(["M", "café.txt"], ["A", "packages/has\ttab.md"]))).toEqual([
      "café.txt",
      "packages/has\ttab.md",
    ]);
  });

  it("honors exemptRenames:false on a -z rename", () => {
    expect(parseNameStatus(z(["R100", "old", "new"]), { exemptRenames: false })).toEqual(["new"]);
  });
});
