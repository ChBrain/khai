// Unit tests for the branch-scope rule: classifyBranch, checkBranchScope (with
// the engine/<name> name-binding and a multi-lane SPLIT case), advise, and the
// resolveConfig validation of the branchScope section. Pure-core only — the
// CLI/git wiring is exercised in cli.test.mjs.

import { describe, it, expect } from "vitest";
import { classifyBranch, checkBranchScope, advise, resolveConfig, ConfigError } from "../index.mjs";

// Load the REAL repo config so the tests prove the live ownership contract
// (the same way the CLI loads it: parse khai-guard.config.json, resolveConfig).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const cfg = resolveConfig(
  JSON.parse(readFileSync(resolve(here, "../../../khai-guard.config.json"), "utf8")),
);

// Alias so the existing suites below keep reading the live config too.
const CONFIG = cfg;

describe("classifyBranch", () => {
  it("classifies each lane's prefix into its layer", () => {
    expect(classifyBranch("arch/new-axis", CONFIG)).toEqual({
      lane: "arch",
      layer: "architecture",
      unit: null,
    });
    expect(classifyBranch("governance/branch-scope", CONFIG)).toEqual({
      lane: "governance",
      layer: "governance",
      unit: null,
    });
    expect(classifyBranch("repo/tidy-readme", CONFIG)).toEqual({
      lane: "repo",
      layer: "infra",
      unit: null,
    });
    expect(classifyBranch("chore/bump", CONFIG)).toEqual({
      lane: "chore",
      layer: "general",
      unit: null,
    });
  });

  it("binds the engine unit from the <name> segment", () => {
    expect(classifyBranch("engine/gender/add-axis", CONFIG)).toEqual({
      lane: "engine",
      layer: "solution",
      unit: "gender",
    });
  });

  it("returns null for an unrecognized branch name", () => {
    expect(classifyBranch("claude/wip", CONFIG)).toBeNull();
    expect(classifyBranch("feature-x", CONFIG)).toBeNull();
    expect(classifyBranch("", CONFIG)).toBeNull();
    // engine without a <change> segment doesn't satisfy engine/*/*
    expect(classifyBranch("engine/gender", CONFIG)).toBeNull();
  });
});

describe("checkBranchScope", () => {
  it("passes when every path is in lane", () => {
    const r = checkBranchScope(
      "governance/branch-scope",
      ["packages/khai-guard/index.mjs", ".github/workflows/ci.yml", "khai-guard.config.json"],
      CONFIG,
    );
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
  });

  it("rejects an unrecognized branch name outright", () => {
    const r = checkBranchScope("claude/wip", ["packages/khai-guard/index.mjs"], CONFIG);
    expect(r.ok).toBe(false);
    expect(r.violations[0]).toContain("matches no lane");
  });

  it("flags an out-of-lane path and names the lane that owns it", () => {
    // A governance branch that reaches into an engine package.
    const r = checkBranchScope(
      "governance/branch-scope",
      ["packages/khai-guard/index.mjs", "packages/engines/gender/index.mjs"],
      CONFIG,
    );
    expect(r.ok).toBe(false);
    expect(r.violations.join("\n")).toContain("packages/engines/gender/index.mjs");
    expect(r.violations.join("\n")).toContain("engine/gender");
  });

  it("binds {name} so an engine branch may only touch its own engine dir", () => {
    const ok = checkBranchScope(
      "engine/gender/add-axis",
      ["packages/engines/gender/position_gender.md"],
      CONFIG,
    );
    expect(ok.ok).toBe(true);

    // Same branch reaching into a DIFFERENT engine is a violation — the name
    // binds gender, not orientation.
    const bad = checkBranchScope(
      "engine/gender/add-axis",
      ["packages/engines/orientation/index.mjs"],
      CONFIG,
    );
    expect(bad.ok).toBe(false);
    expect(bad.violations.join("\n")).toContain("engine/orientation");
  });

  it("rejects a governance-owned path on a general lane (deny-by-default)", () => {
    // The whole point of ownership: a chore/ branch must NOT be able to weaken
    // the gate by editing a governance-owned CI workflow.
    const r = checkBranchScope("chore/tidy", [".github/workflows/ci.yml"], cfg);
    expect(r.ok).toBe(false);
    expect(r.violations.join("\n")).toContain("governance");
  });

  it("locks the guard config to governance (a repo/ branch can't touch it)", () => {
    const r = checkBranchScope("repo/tidy", ["khai-guard.config.json"], cfg);
    expect(r.ok).toBe(false);
  });

  it("allows an unowned top-level file on a general lane", () => {
    const r = checkBranchScope("chore/tidy", ["README.md"], cfg);
    expect(r.ok).toBe(true);
  });

  it("waves shared metadata through on any lane", () => {
    const r = checkBranchScope(
      "arch/x",
      [".changeset/foo.md", "packages/khai-arch/index.mjs"],
      cfg,
    );
    expect(r.ok).toBe(true);
  });

  it("forbids a protected lane from straying onto an unowned path", () => {
    const r = checkBranchScope("arch/x", ["README.md"], cfg);
    expect(r.ok).toBe(false);
  });

  it("keeps the engine name-binding under ownership", () => {
    // engine/gender may not touch packages/engines/cultures/** (owned by
    // engine/cultures), but may touch its own dir.
    const cross = checkBranchScope(
      "engine/gender/x",
      ["packages/engines/cultures/position.md"],
      cfg,
    );
    expect(cross.ok).toBe(false);
    const own = checkBranchScope(
      "engine/gender/x",
      ["packages/engines/gender/position_male.md"],
      cfg,
    );
    expect(own.ok).toBe(true);
  });

  it("reports SPLIT REQUIRED across packages/khai-arch/** and .github/**", () => {
    // Both paths are foreign to a chore/ branch and owned by two distinct
    // protected lanes (arch + governance), so the set cannot live on one branch.
    const r = checkBranchScope(
      "chore/x",
      ["packages/khai-arch/index.mjs", ".github/workflows/ci.yml"],
      cfg,
    );
    expect(r.ok).toBe(false);
    expect(r.violations.join("\n")).toContain("SPLIT REQUIRED");
  });

  it("reports SPLIT REQUIRED when a single branch spans multiple lanes", () => {
    const r = checkBranchScope(
      "governance/branch-scope",
      [
        "packages/khai-guard/index.mjs", // in lane (governance)
        "packages/khai-arch/architecture/x.md", // arch lane
        "packages/engines/gender/index.mjs", // engine/gender lane
      ],
      CONFIG,
    );
    expect(r.ok).toBe(false);
    const text = r.violations.join("\n");
    expect(text).toContain("SPLIT REQUIRED");
    expect(text).toContain("architecture -> governance -> solution");
  });
});

describe("advise", () => {
  it("recommends a single checkout for a single-lane set", () => {
    const r = advise({ files: ["packages/khai-arch/architecture/canon.md"] }, CONFIG);
    expect(r.split).toBe(false);
    expect(r.lanes).toHaveLength(1);
    expect(r.lanes[0].lane).toBe("arch");
    expect(r.lanes[0].checkout).toContain("git checkout -b arch/<change> origin/main");
  });

  it("derives the engine checkout from the path's engine dir", () => {
    const r = advise({ files: ["packages/engines/gender/position_male.md"] }, CONFIG);
    expect(r.lanes[0].lane).toBe("engine");
    expect(r.lanes[0].unit).toBe("gender");
    expect(r.lanes[0].checkout).toContain("engine/gender/<change>");
  });

  it("splits a multi-lane set and orders it architecture -> governance -> solution", () => {
    const r = advise(
      {
        files: [
          "packages/engines/gender/index.mjs",
          "packages/khai-arch/architecture/x.md",
          "packages/khai-guard/index.mjs",
        ],
      },
      CONFIG,
    );
    expect(r.split).toBe(true);
    expect(r.lanes.map((l) => l.layer)).toEqual(["architecture", "governance", "solution"]);
    expect(r.lines.join("\n")).toContain("SPLIT REQUIRED");
  });

  it("lists paths no lane owns", () => {
    const r = advise({ files: ["docs/some-doc.md"] }, CONFIG);
    // docs/** is owned by no scoped lane (repo is top-level only, engines/arch
    // are package dirs). It surfaces as unowned, not silently lost.
    expect(r.unowned).toContain("docs/some-doc.md");
  });
});

describe("resolveConfig branchScope validation", () => {
  it("accepts a well-formed branchScope", () => {
    expect(() =>
      resolveConfig({
        branchScope: { lanes: [{ pattern: "arch/*", layer: "architecture", allow: ["a/**"] }] },
      }),
    ).not.toThrow();
  });

  it("rejects a non-array lanes", () => {
    expect(() => resolveConfig({ branchScope: { lanes: {} } })).toThrow(ConfigError);
  });

  it("rejects a lane missing pattern/layer/allow", () => {
    expect(() => resolveConfig({ branchScope: { lanes: [{ layer: "x", allow: [] }] } })).toThrow(
      ConfigError,
    );
    expect(() =>
      resolveConfig({ branchScope: { lanes: [{ pattern: "a/*", allow: [] }] } }),
    ).toThrow(ConfigError);
    expect(() =>
      resolveConfig({ branchScope: { lanes: [{ pattern: "a/*", layer: "x" }] } }),
    ).toThrow(ConfigError);
  });

  it("rejects a unit that points outside the pattern or has no {name} glob", () => {
    expect(() =>
      resolveConfig({
        branchScope: {
          lanes: [{ pattern: "engine/*/*", layer: "s", unit: 9, allow: ["{name}/**"] }],
        },
      }),
    ).toThrow(ConfigError);
    expect(() =>
      resolveConfig({
        branchScope: { lanes: [{ pattern: "engine/*/*", layer: "s", unit: 1, allow: ["x/**"] }] },
      }),
    ).toThrow(ConfigError);
  });
});
