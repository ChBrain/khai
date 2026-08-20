// The risk engine tests only what is risk-specific: that the package conforms to
// the canon through the shared conformance kit (@chbrain/khai-tests), its
// manifest contract, the three-axis shape, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "position_risk.md";
const AXES = ["position_dread_risk.md", "position_unknown_risk.md", "position_divergence_risk.md"];

describe("risk: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("risk: manifest", () => {
  it("declares the risk position tree with a single root", () => {
    expect(manifest.engine).toBe("risk");
    expect(manifest.type).toBe("position");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a position -- a sizing is a standing reading, never conduct", () => {
    for (const m of manifest.members) expect(m.type).toBe("position");
  });
  it("every non-root member names a parent that exists", () => {
    const files = new Set(manifest.members.map((m) => m.file));
    for (const m of manifest.members) {
      if (m.parent !== null) expect(files.has(m.parent)).toBe(true);
    }
  });
  it("declares both enforceable wiring altitudes, each at its level", () => {
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
});

describe("risk: the psychometric shape", () => {
  // The tree is exactly two deep: root -> axis -> feature. Slovic's finding is that
  // the features load together onto factors, which is why they are grouped rather
  // than listed as parallel leaves.
  it("hangs exactly three axis heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...AXES].sort());
  });
  it("puts every feature under an axis, never under the root or another feature", () => {
    const axes = new Set(AXES);
    const features = manifest.members.filter((m) => m.file !== ROOT && !axes.has(m.file));
    expect(features.length).toBe(manifest.members.length - 1 - AXES.length);
    for (const m of features) expect(axes.has(m.parent)).toBe(true);
  });
  it("keeps dread the larger factor, as the paradigm found it", () => {
    const count = (axis) => manifest.members.filter((m) => m.parent === axis).length;
    expect(count("position_dread_risk.md")).toBeGreaterThan(count("position_unknown_risk.md"));
  });
  it("keeps the expert's count inside the engine rather than above it", () => {
    // The count is a member of the divergence axis, not the engine's correction:
    // expert and lay judgment measure different quantities, and treating either as
    // the correction of the other is what makes the argument unresolvable.
    const count = manifest.members.find((m) => m.file === "position_expert_count.md");
    expect(count.parent).toBe("position_divergence_risk.md");
    expect(flat("position_expert_count.md")).toMatch(/different quantity/);
  });
});

describe("risk: the twist lives at the root", () => {
  // Non-correctability is a property of what the sizing is made of, not of any one
  // feature, so it belongs to the anchor.
  it("the root's Loses is the inability to be corrected by its own numbers", () => {
    const loses = flat(ROOT).split("## Loses")[1].split("## Drives")[0];
    expect(loses).toMatch(/corrected by its own numbers/);
    expect(loses).toMatch(/more.{0,20}polarisation/i);
  });
});

describe("risk: what the engine refuses to over-claim", () => {
  // The paradigm is factor-analytic work on aggregated mean ratings, and the eleven
  // features are the field's reading of what clusters, not eleven separately
  // demonstrated mechanisms. The references must say so.
  it("names the aggregation limit on the paradigm", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/factor-analytic work on aggregated mean ratings/i);
    expect(refs).toMatch(/interpretive labels placed on loadings/i);
  });
  // The identity reading is the weakest leg and invites misuse; it is kept a
  // distinct member precisely so a play does not apply it to every disagreement.
  it("names the identity reading as the weakest and most contested leg", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/weakest and most contested leg is the identity reading/i);
    expect(flat("playwright_instructions.md")).toMatch(/Do use the identity reading sparingly/);
  });
});

describe("risk: the boundary with the feeling and the frequency", () => {
  // Risk is a sizing, not an emotion and not a frequency estimate. Those live in
  // anxiety/fear/apprehension/hope and in availability respectively.
  it("delegates the feeling and the frequency explicitly", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The feeling of a threat \(anxiety, fear, apprehension, hope\)/);
    expect(refs).toMatch(/Judging how often something happens \(availability\)/);
    expect(refs).toMatch(/Risk is a \*\*sizing\*\* and not a feeling/);
  });
  it("names no emotion and no bias among its members", () => {
    const foreign = ["anxiety", "fear", "dread.md", "zero_risk", "compensation", "victim"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("risk: compose()", () => {
  // chains is keyed by true leaf only: the root and the three axis heads are
  // carried upward by whatever hangs below them.
  it("composes every feature: root first, then the axis, then the feature", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - AXES.length);
    for (const axis of AXES) expect(leaves).not.toContain(axis);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Position: Risk");
      expect(out.includes("## Has")).toBe(true);
    }
  });
  it("gives a feature a three-link chain: root, axis, feature", () => {
    expect(chains["position_involuntary.md"]).toEqual([
      ROOT,
      "position_dread_risk.md",
      "position_involuntary.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "position_hazard.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
