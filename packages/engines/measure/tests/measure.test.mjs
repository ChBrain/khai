// The measure engine tests only what is measure-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, the four-movement shape, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_measure.md";
const MOVEMENTS = [
  "process_cut_measure.md",
  "process_warrant_measure.md",
  "process_turn_measure.md",
  "process_territory_measure.md",
];

describe("measure: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("measure: manifest", () => {
  it("declares the measure process tree with a single root", () => {
    expect(manifest.engine).toBe("measure");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- an operation being performed, not a state", () => {
    for (const m of manifest.members) expect(m.type).toBe("process");
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

describe("measure: the four movements", () => {
  // The tree is exactly two deep: root -> movement -> form. The movements run
  // together rather than in sequence -- once the cut has been made, the other
  // three are already operating.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("gives each movement three forms", () => {
    for (const head of MOVEMENTS) {
      const forms = manifest.members.filter((m) => m.parent === head);
      expect(forms, head).toHaveLength(3);
    }
  });
});

describe("measure: the twist lives at the root", () => {
  // Porter's claim is about the operation rather than about any one form, so it
  // belongs to the anchor. The territory carries it downward.
  it("the root's Echo names quantification as a technology of distrust", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /number is trusted in proportion to how little the people producing it are trusted/i,
    );
    expect(echo).toMatch(/cannot be undone by competence/i);
  });
  it("the territory movement carries the same keystone", () => {
    expect(flat("process_territory_measure.md")).toMatch(
      /trusted in proportion to how little the people producing it are trusted/i,
    );
  });
});

describe("measure: the case for measuring is made first", () => {
  // Without the positive case in every movement the engine reads as a complaint
  // about counting, which is neither the sources' claim nor true. The territory
  // in particular must concede what standardisation makes possible.
  it("the territory states the benefits before the cost", () => {
    const t = flat("process_simplification.md");
    expect(t).toMatch(/has to be said first and said fully/i);
    expect(t).toMatch(/public health, non-arbitrary taxation/i);
  });
  it("the cut concedes that the alternative is usually unaccountable rather than subtle", () => {
    expect(flat("process_cut_measure.md")).toMatch(
      /the alternative to a crude measure is usually not a subtle one but an unexaminable claim/i,
    );
  });
  it("the references refuse the anti-measurement reading", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/case \*\*for\*\* measurement is made first/i);
    expect(refs).toMatch(/should not be taken from this engine is that measurement is a mistake/i);
  });
});

describe("measure: what the engine refuses to over-claim", () => {
  // Historical and case-based material, not experiment. Scott is the most
  // contested source and Goodhart the least systematically measured, and the
  // references must name both rather than borrowing their fame as evidence.
  it("names Scott as the most contested source and states the objection", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/most contested source/i);
    expect(refs).toMatch(/case selection is weighted toward failures/i);
  });
  it("names Goodhart as an aphorism with little systematic measurement", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /aphorism with enormous anecdotal support and remarkably little systematic measurement/i,
    );
  });
  it("marks the residue claim as this engine's sharpening rather than the source's", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /this engine's sharpening of it, and should be read as such/i,
    );
  });
});

describe("measure: the boundary with money and legibility", () => {
  // Two words that collide with existing engines: money is the great
  // commensurating medium, and legibility is Lynch's sense rather than Scott's.
  it("delegates the general equivalent and names the legibility homonym", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The general equivalent \(money\)/);
    expect(refs).toMatch(/Lynch's sense of the word and not Scott's/);
    expect(refs).toMatch(/Measurement as a control form \(employment\)/);
  });
  it("names no currency and no city element among its members", () => {
    const foreign = ["money", "earmark", "path", "district", "landmark"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("measure: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Measure");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_goodhart.md"]).toEqual([
      ROOT,
      "process_turn_measure.md",
      "process_goodhart.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_metric.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
