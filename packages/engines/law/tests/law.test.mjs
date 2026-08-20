// The law engine tests only what is law-specific: that the package conforms to
// the canon through the shared conformance kit (@chbrain/khai-tests), its
// manifest contract, the four-axis shape, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const read = (file) => readFileSync(join(pkgDir, file), "utf8");
const flat = (file) => read(file).replace(/\s+/g, " ");

const ROOT = "position_law.md";
const AXES = [
  "position_making_law.md",
  "position_failing_law.md",
  "position_standing_law.md",
  "position_gap_law.md",
];

describe("law: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("law: manifest", () => {
  it("declares the law position tree with a single root", () => {
    expect(manifest.engine).toBe("law");
    expect(manifest.type).toBe("position");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a position -- legality is a standing condition, never conduct", () => {
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

describe("law: the four axes", () => {
  // The tree is exactly two deep: root -> axis -> named form. The axes are not
  // alternatives; a legal order has a reading on all four at once.
  it("hangs exactly four axis heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...AXES].sort());
  });
  it("puts every named form under an axis, never under the root or another form", () => {
    const axes = new Set(AXES);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !axes.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - AXES.length);
    for (const m of forms) expect(axes.has(m.parent)).toBe(true);
  });
  it("carries all eight of Fuller's routes to not-law, no more and no fewer", () => {
    // The eight are a closed set: Fuller's argument is that these are the distinct
    // ways a rule system fails, so adding a ninth or dropping one is a real edit.
    const eight = manifest.members
      .filter((m) => m.parent === "position_failing_law.md")
      .map((m) => m.file);
    expect(eight.sort()).toEqual(
      [
        "position_administered_otherwise.md",
        "position_contradictory_rule.md",
        "position_impossible_rule.md",
        "position_no_rules.md",
        "position_retroactive_rule.md",
        "position_unintelligible_rule.md",
        "position_unpublished_rule.md",
        "position_unstable_rule.md",
      ].sort(),
    );
  });
  it("carries exactly Ewick & Silbey's three standings", () => {
    const three = manifest.members
      .filter((m) => m.parent === "position_standing_law.md")
      .map((m) => m.file);
    expect(three.sort()).toEqual([
      "position_against_the_law.md",
      "position_before_the_law.md",
      "position_with_the_law.md",
    ]);
  });
});

describe("law: what the engine refuses to over-claim", () => {
  // Fuller's eight are procedural, and the axis says so itself rather than
  // leaving a reader to infer that a compliant rule system is a decent one.
  it("the failing axis concedes that an efficient tyranny can satisfy all eight", () => {
    expect(flat("position_failing_law.md")).toMatch(/efficient tyranny can satisfy all eight/);
  });
  // The twist is an inference from a small, relational, repeated setting to legal
  // sanction in general, and the references must say so.
  it("the references name the twist's weakest leg rather than burying it", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/weakest single claim/i);
    expect(refs).toMatch(/Tyler/);
  });
});

describe("law: the twist lives at the root", () => {
  // Pricing is a property of enforceability itself, not of any one form, so it
  // belongs to the anchor and not to a leaf.
  it("the root's Loses is the inability to forbid without pricing", () => {
    const loses = flat(ROOT).split("## Loses")[1].split("## Drives")[0];
    expect(loses).toMatch(/without also pricing/);
    expect(loses).toMatch(/conversion runs one way/);
  });
});

describe("law: the boundary with regime and politics", () => {
  // Regime is the arrangement that decides, politics is the deciding, law is what
  // the deciding produces and how it reaches a persona.
  it("delegates the arrangement and the conduct explicitly", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Who rules, and how \(regime, politics\)/);
    expect(refs).toMatch(
      /regime is the arrangement, law is what the deciding produces and how it reaches a persona/i,
    );
  });
  it("names no regime type and no political move among its members", () => {
    const foreign = ["democracy", "autocracy", "monarchy", "agenda", "logrolling", "veto"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("law: compose()", () => {
  // chains is keyed by true leaf only: the root and the four axis heads are
  // carried upward by whatever hangs below them.
  it("composes every named form: root first, then the axis, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - AXES.length);
    for (const axis of AXES) expect(leaves).not.toContain(axis);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Position: Law");
      expect(out.includes("## Has")).toBe(true);
    }
  });
  it("gives a named form a three-link chain: root, axis, form", () => {
    expect(chains["position_dead_letter.md"]).toEqual([
      ROOT,
      "position_gap_law.md",
      "position_dead_letter.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "position_statute.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
