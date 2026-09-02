// The disability engine tests what an atom owns: canon conformance through the
// shared kit, the manifest contract, and compose(). No atoms block -- disability
// declares no engine dependencies, which is the point of an atom.
//
// Rule 3's second PR, landing late: the engine shipped in #1378 with no tests of
// its own. untested-packages.test.mjs baselines it; the BASELINE row is pruned in
// a governance sweep, since this lane cannot reach that file.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("disability: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("disability: manifest", () => {
  // A position root, not a process. Disability is a standing the room issues,
  // not something the persona does -- and the engine's whole argument depends on
  // that: the misfit is relational, so the thing being modelled is where the
  // persona is put, not how they behave.
  it("declares a position root", () => {
    expect(manifest.engine).toBe("disability");
    expect(manifest.type).toBe("position");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("position_disability.md");
  });

  // One place and three processes, and the split is the reading. The standard is
  // a place -- a built world that presents as neutral and is a specification, so
  // it is a thing the persona walks into rather than a thing that happens. The
  // other three happen: the misfit is the encounter, the ask is the remedy and
  // its price, the retrofit is the admission by a route that announces itself.
  // A member's type quietly changed would move it between "the world is like
  // this" and "this occurs", so the pairs are asserted, not just the files.
  it("carries one place and three processes under the standing", () => {
    const under = manifest.members.filter((m) => m.parent === "position_disability.md");
    expect(under.map((m) => [m.file, m.type]).sort()).toEqual([
      ["place_the_standard.md", "place"],
      ["process_the_ask.md", "process"],
      ["process_the_misfit.md", "process"],
      ["process_the_retrofit.md", "process"],
    ]);
  });

  // Both altitudes are fail, and the persona one is the unusual half: most
  // engines audit the Projection link. Here an unnamed link is an error, because
  // a persona cast into this standing without declaring it is the exact silence
  // the engine exists to refuse.
  it("declares both wiring altitudes at fail, the persona link included", () => {
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

  // An atom cites; it does not compose. A dependency on another engine would
  // make this a composite wearing an engine's name.
  it("declares no engine dependencies -- it is an atom", () => {
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    const engines = Object.keys(pkg.dependencies ?? {}).filter(
      (d) => d.startsWith("@chbrain/khai-engine-") || d.startsWith("@chbrain/khai-composite-"),
    );
    expect(engines).toEqual([]);
  });
});

describe("disability: compose()", () => {
  it("composes every member root-first, carrying the disability root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Position: Disability");
    }
  });

  // The place is carried the same way the processes are: the standing comes
  // first, then the world that issues it.
  it("puts the standing before the standard that issues it", () => {
    const out = compose({ leaf: "place_the_standard.md" });
    expect(out.indexOf("Position: Disability")).toBeLessThan(out.indexOf("Place:"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
