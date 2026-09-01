// docs/BRANCHING.md is where AGENTS.md sends a reader for "the full table", and
// it is a second copy of khai-guard.config.json's lane list. A second copy of a
// truth drifts, and this one had: it documented EIGHT of seventeen lanes, so
// composite, skills, methods, stage, review, plays, tour, examples and
// dependabot were reachable only by running `khai-guard advise` and reading what
// came back. The governance row had separately fallen six paths behind, which
// meant an author planning a change against the table was told a governed path
// was unowned and then refused by the guard.
//
// Regenerating it fixed the day and nothing else, so this holds it: the config
// is the source, the doc must carry every lane in it, and every concrete path it
// grants.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const config = JSON.parse(readFileSync(join(repoRoot, "khai-guard.config.json"), "utf8"));
const doc = readFileSync(join(repoRoot, "docs", "BRANCHING.md"), "utf8");

const lanes = config.branchScope?.lanes ?? [];
// The lanes table only; prose elsewhere in the doc mentions lanes in passing and
// would let a missing row pass on an unrelated sentence.
const table = doc.slice(doc.indexOf("| Branch pattern"), doc.indexOf("\n\n`<change>`"));

// The config writes an engine's own directory as `{name}`; the doc reads better
// as `<name>`. One substitution, declared, rather than a fuzzy match.
const asDocumented = (p) => p.replace(/\{name\}/g, "<name>");

describe("docs/BRANCHING.md against khai-guard.config.json", () => {
  // An equality gate over an empty collection is green for the wrong reason, and
  // both halves can be empty here: a config that failed to parse, or a table
  // slice that missed.
  it("reads a config with lanes and a table to check them against", () => {
    expect(lanes.length).toBeGreaterThan(10);
    expect(table.length).toBeGreaterThan(200);
  });

  it("documents every lane the config declares", () => {
    const undocumented = lanes
      .map((l) => l.pattern)
      .filter((p) => !table.includes("`" + p.split("/")[0] + "/"));
    expect(
      undocumented,
      "a lane the guard enforces and the table does not name is one an author " +
        "can only discover by being refused",
    ).toEqual([]);
  });

  it("documents every path a lane grants", () => {
    const missing = [];
    for (const lane of lanes)
      for (const path of lane.allow ?? [])
        if (!table.includes("`" + asDocumented(path) + "`"))
          missing.push(`${lane.pattern}: ${path}`);
    expect(missing, "the table grants less than the guard does").toEqual([]);
  });

  it("names no lane the config does not have", () => {
    const known = new Set(lanes.map((l) => l.pattern.split("/")[0]));
    const rows = [...table.matchAll(/^\| `([a-z-]+)\//gm)].map((m) => m[1]);
    expect(rows.length, "no rows parsed: the table shape moved").toBeGreaterThan(10);
    expect([...new Set(rows)].filter((r) => !known.has(r))).toEqual([]);
  });
});
