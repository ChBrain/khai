// The regime engine tests only what is regime-specific: that the package conforms
// to the canon through the shared conformance kit (@chbrain/khai-tests), its
// manifest contract, the six-axis shape, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const read = (file) => readFileSync(join(pkgDir, file), "utf8");

const ROOT = "position_regime.md";
const AXES = [
  "position_count_regime.md",
  "position_claim_regime.md",
  "position_constraint_regime.md",
  "position_holder_regime.md",
  "position_architecture_regime.md",
  "position_substitute_regime.md",
];

describe("regime: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("regime: manifest", () => {
  it("declares the regime position tree with a single root", () => {
    expect(manifest.engine).toBe("regime");
    expect(manifest.type).toBe("position");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a position -- the engine is a catalogue of standing arrangements, never of conduct", () => {
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

describe("regime: the six axes", () => {
  // The classificatory traditions ask different questions of the same arrangement,
  // so the tree is exactly two deep: root -> axis -> named type. An axis is not a
  // rival answer to another axis, and a type belongs to exactly one axis.
  it("hangs exactly six axis heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...AXES].sort());
  });
  it("puts every named type under an axis, never under the root or another type", () => {
    const axes = new Set(AXES);
    const types = manifest.members.filter((m) => m.file !== ROOT && !axes.has(m.file));
    expect(types.length).toBe(manifest.members.length - 1 - AXES.length);
    for (const m of types) expect(axes.has(m.parent)).toBe(true);
  });
  it("keeps every axis populated", () => {
    for (const axis of AXES) {
      const leaves = manifest.members.filter((m) => m.parent === axis);
      expect(leaves.length).toBeGreaterThan(0);
    }
  });
  it("keeps totalitarian on the constraint axis -- a distinct kind, not a degree of autocracy", () => {
    // Linz's cut: totalitarianism is defined by an ideology and a mobilised
    // participation, so it sits alongside the closed autocracy rather than beyond it.
    const t = manifest.members.find((m) => m.file === "position_totalitarian.md");
    expect(t.parent).toBe("position_constraint_regime.md");
  });
});

describe("regime: the twist lives at the root", () => {
  // The information problem is a property of the instrument rather than of any one
  // type -- every regime that controls speech pays for it in what it can learn --
  // so it belongs to the anchor and not to a leaf.
  it("the root's Loses is the regime's knowledge of what its subjects think", () => {
    const loses = read(ROOT).split("## Loses")[1].split("## Drives")[0];
    expect(loses).toMatch(/know what its own subjects think/i);
    expect(loses).toMatch(/scales with how well the instrument works/i);
  });
});

describe("regime: the boundary with politics", () => {
  // Regime is the board; the politics engine is the play on it. The same act costs
  // differently under each type, which is exactly why they are separate packages --
  // so no member of this engine may be a move a persona makes.
  it("names no conduct: no member file describes a political move", () => {
    const conduct = [
      "agenda_setting",
      "dimension_splitting",
      "scope_shifting",
      "coalition_building",
      "logrolling",
      "stalling",
      "rule_contest",
      "veto_point",
      "broker_seat",
      "bloc_hold",
      "mandate_claim",
      "outsider_stand",
    ];
    const files = manifest.members.map((m) => m.file);
    for (const move of conduct) {
      expect(files.some((f) => f.includes(move))).toBe(false);
    }
  });
  it("delegates conduct explicitly in the references", () => {
    const refs = read("REFERENCES.md").replace(/\s+/g, " ");
    expect(refs).toMatch(/Political conduct \(politics\)/);
    expect(refs).toMatch(/Regime is the board and politics is the play on it/);
  });
});

describe("regime: compose()", () => {
  // chains is keyed by true leaf only: the root and the six axis heads are carried
  // upward by whatever hangs below them and are not composable on their own.
  it("composes every named type: root first, then the axis, then the type", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - AXES.length);
    for (const axis of AXES) expect(leaves).not.toContain(axis);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Position: Regime");
      expect(out.includes("## Has")).toBe(true);
    }
  });
  it("gives a named type a three-link chain: root, axis, type", () => {
    expect(chains["position_competitive_authoritarian.md"]).toEqual([
      ROOT,
      "position_constraint_regime.md",
      "position_competitive_authoritarian.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "position_democracy.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});

describe("regime: the climate homonym", () => {
  // The climate engine owns a member also called regime -- the standing type of a
  // place's weather. Same word, different science, so the stem is whitelisted
  // rather than resolved, and the references say so where a reader will look.
  it("declares the homonym rather than leaving it to be discovered", () => {
    const refs = read("REFERENCES.md").replace(/\s+/g, " ");
    expect(refs).toMatch(/The standing type of a place's weather \(climate\)/);
    expect(refs).toMatch(/Same word, different science/);
  });
});
