// The depression composite tests only what is composite-specific: canon
// conformance through the shared kit (which resolves the hard package links
// through the declared dependencies), the manifest contract, compose(), and that
// the atoms arrive with the package.
//
// Rule 3's second PR, landing late: the composite shipped in #1439 and published
// at 0.1.1 with no tests of its own. untested-packages.test.mjs baselines it; the
// BASELINE row is pruned in a governance sweep, since this lane cannot reach that
// file.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("depression: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose + hard links)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("depression: manifest", () => {
  it("declares the composite and its root", () => {
    expect(manifest.engine).toBe("depression");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("process_depression.md");
  });

  // Three locks, not one mechanism seen three ways: Seligman's behavioural
  // lock-in, Beck's self-judgment lock-in, Nesse's vegetative lock-in. The
  // composite's whole claim is that they defend each other, so a movement
  // quietly dropped or merged would lose it. The set is asserted, not the count.
  //
  // Their types are asserted individually because they are not uniform, and the
  // difference carries the reading: helplessness is a process the persona runs,
  // worthlessness and melancholia are positions it occupies.
  it("carries the three movements, each at its own altitude", () => {
    const movements = manifest.members.filter((m) => m.parent === "process_depression.md");
    expect(movements.map((m) => [m.file, m.type]).sort()).toEqual([
      ["position_melancholia.md", "position"],
      ["position_worthlessness.md", "position"],
      ["process_learned_helplessness.md", "process"],
    ]);
  });

  it("declares the law (fail) and the persona link (audit)", () => {
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
      level: "audit",
    });
  });
});

describe("depression: the atoms arrive with the package", () => {
  it("re-exports the five dependency engines", () => {
    expect(Object.keys(atoms).sort()).toEqual([
      "anhedonia",
      "body",
      "rumination",
      "sadness",
      "self-esteem",
    ]);
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

describe("depression: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first`, () => {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Depression");
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_nope.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
