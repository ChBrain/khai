// The hoarding composite tests only what is composite-specific: canon conformance
// through the shared kit (which resolves the hard package links through the
// declared dependencies), the manifest contract, compose(), and that the atoms
// arrive with the package.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("hoarding: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose + hard links)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("hoarding: manifest", () => {
  it("declares the composite and its root", () => {
    expect(manifest.engine).toBe("hoarding");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("process_hoarding.md");
  });

  // A movement quietly dropped or merged would lose the claim
  // the composite is built on, so the set is asserted rather than the count.
  it("carries the four movements as distinct positions", () => {
    const movements = manifest.members.filter((m) => m.parent === "process_hoarding.md");
    expect(movements.map((m) => m.file).sort()).toEqual([
      "position_behavioral_avoidance.md",
      "position_emotional_attachment.md",
      "position_excessive_acquisition.md",
      "position_information_processing.md",
    ]);
    for (const m of movements) expect(m.type).toBe("position");
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

describe("hoarding: the atoms arrive with the package", () => {
  it("re-exports the six dependency engines", () => {
    expect(Object.keys(atoms).sort()).toEqual([
      "categorization",
      "collection",
      "coping",
      "decision",
      "extended-self",
      "scarcity",
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

describe("hoarding: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first`, () => {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Hoarding");
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_nope.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
