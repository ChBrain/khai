// The anhedonia engine tests what an atom owns: canon conformance through the
// shared kit, the manifest contract, and compose(). No atoms block -- anhedonia
// declares no engine dependencies, which is the point of an atom.
//
// Rule 3's second PR, landing late: the engine shipped in #1436 with no tests of
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

describe("anhedonia: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("anhedonia: manifest", () => {
  it("declares a process root over three positions", () => {
    expect(manifest.engine).toBe("anhedonia");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_anhedonia.md");
  });

  // Three forms, and they are dissociable rather than three views of one flatness.
  // Anticipatory is Treadway & Zald's effort-based finding: the persona reports
  // the thing as desirable and cannot fund setting out. Consummatory is arrival
  // with nothing received -- flat, not negative, so it produces none of the signs
  // a bad experience would. Social is the one that removes the route back, since
  // company is what ordinarily interrupts the other two. Merge any pair and the
  // engine stops being able to say which one a persona is running, so the set is
  // asserted rather than the count.
  it("carries the three forms as distinct positions", () => {
    const forms = manifest.members.filter((m) => m.parent === "process_anhedonia.md");
    expect(forms.map((m) => m.file).sort()).toEqual([
      "position_anticipatory.md",
      "position_consummatory.md",
      "position_social_anhedonia.md",
    ]);
    for (const m of forms) expect(m.type).toBe("position");
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

  // An atom cites; it does not compose. A dependency on another engine would
  // make this a composite wearing an engine's name, and the one thing depression
  // needs from anhedonia is that it stays an atom it can hard-link into.
  it("declares no engine dependencies -- it is an atom", () => {
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    const engines = Object.keys(pkg.dependencies ?? {}).filter(
      (d) => d.startsWith("@chbrain/khai-engine-") || d.startsWith("@chbrain/khai-composite-"),
    );
    expect(engines).toEqual([]);
  });
});

describe("anhedonia: compose()", () => {
  it("composes every form root-first, carrying the anhedonia root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Anhedonia");
    }
  });

  it("puts the root before the form it carries", () => {
    const out = compose({ leaf: "position_social_anhedonia.md" });
    expect(out.indexOf("Process: Anhedonia")).toBeLessThan(out.indexOf("Position:"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "position_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
