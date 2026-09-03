// The neighborhood-cycle composite tests only what is composite-specific: canon
// conformance through the shared kit (which resolves the hard package links
// through the declared dependencies), the manifest contract, compose(), and that
// the atoms arrive with the package.
//
// Rule 3's second PR, landing late: the composite shipped in #1087 with no tests
// of its own. untested-packages.test.mjs baselines it; the BASELINE row is pruned
// in a governance sweep, since this lane cannot reach that file.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("neighborhood-cycle: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose + hard links)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("neighborhood-cycle: manifest", () => {
  it("declares the composite and its root", () => {
    expect(manifest.engine).toBe("neighborhood-cycle");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("process_neighborhood_cycle.md");
  });

  // Three bridges, and the composite's question is not what the cycle does but
  // whom the return serves: turnover returns the place for capital, stewardship
  // for the people who held it through the fall, attrition for nobody. Decline
  // alone or return alone is not the cycle -- the arc is, and the three readings
  // of its ending are the whole content. Drop one and a count of three still
  // passes while the question the composite exists to ask is gone.
  it("carries the three bridges, every one of them a process", () => {
    const bridges = manifest.members.filter((m) => m.parent === "process_neighborhood_cycle.md");
    expect(bridges.map((m) => m.file).sort()).toEqual([
      "process_neighborhood_cycle_attrition.md",
      "process_neighborhood_cycle_stewardship.md",
      "process_neighborhood_cycle_turnover.md",
    ]);
    for (const m of bridges) expect(m.type).toBe("process");
  });

  // The audit rides place/Shown: a neighborhood cycle is read off the place
  // itself, not off a persona's trait or a plot's tension.
  it("declares the law (fail) and the place link (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "place",
      section: "Shown",
      link: "expression",
      level: "audit",
    });
  });
});

describe("neighborhood-cycle: the atoms arrive with the package", () => {
  // Decline, return, and the return's extractive form: the arc needs all three
  // or it is not an arc.
  it("re-exports the three dependency engines", () => {
    expect(Object.keys(atoms).sort()).toEqual(["dereliction", "gentrification", "reclamation"]);
    for (const atom of Object.values(atoms)) {
      expect(typeof atom.compose).toBe("function");
      expect(atom.manifest.engine).toBeTruthy();
    }
  });

  // The dependency graph is the citation graph: every atom re-exported here is
  // declared, so a hard link into it resolves for a consumer too.
  it("re-exports exactly what package.json declares", () => {
    const deps = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8")).dependencies;
    const engines = Object.keys(deps)
      .filter((d) => d.startsWith("@chbrain/khai-engine-"))
      .map((d) => d.replace("@chbrain/khai-engine-", ""))
      .sort();
    expect(Object.keys(atoms).sort()).toEqual(engines);
  });
});

describe("neighborhood-cycle: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first`, () => {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Neighborhood-Cycle");
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_nope.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
