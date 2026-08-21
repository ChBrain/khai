// The meal engine tests only what is meal-specific: that the package conforms
// to the canon through the shared conformance kit (@chbrain/khai-tests), its
// manifest contract, the four-movement shape, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_meal.md";
const MOVEMENTS = [
  "process_the_table.md",
  "process_the_sharing.md",
  "process_order_meal.md",
  "process_bond_meal.md",
];

describe("meal: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("meal: manifest", () => {
  it("declares the meal process tree with a single root", () => {
    expect(manifest.engine).toBe("meal");
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

describe("meal: the four movements", () => {
  // The tree is exactly two deep: root -> movement -> form. The table classifies
  // before anybody arrives, the sharing is the mechanism, the order is the form,
  // and the bond is what is left.
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
  it("keeps the table's three forms in the order the edge is drawn", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_the_table.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_admitted.md",
      "process_the_excluded.md",
      "process_the_place_set.md",
    ]);
  });
  it("keeps the bond's three forms in the order the relation runs", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_bond_meal.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_belonging.md",
      "process_the_owed_return.md",
      "process_the_next_one.md",
    ]);
  });
});

describe("meal: the twist lives at the root", () => {
  // The bond being a by-product is a property of the whole operation rather than
  // of any one movement, so it belongs to the anchor. The bond carries it down.
  it("the root's Echo names the by-product", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/binds in proportion to how little it is about binding/i);
    expect(echo).toMatch(/the mandated team dinner fails/i);
  });
  it("the bond movement carries the same keystone", () => {
    expect(flat("process_bond_meal.md")).toMatch(
      /binds in proportion to how little it is about binding/i,
    );
  });
  it("the next one is where the relation is actually kept", () => {
    expect(flat("process_the_next_one.md")).toMatch(/where the relation is actually kept/i);
  });
});

describe("meal: the mechanism is the co-ingestion", () => {
  // The engine is not a theory of conversation. What does the work is that the
  // same object crosses the boundary of two bodies.
  it("keeps the sharing physical and belief-independent", () => {
    const s = flat("process_the_sharing.md");
    expect(s).toMatch(/crosses the boundary of the body and becomes the body/i);
    expect(s).toMatch(/The Sharing works on nobody's belief/i);
  });
  it("ties what may be eaten to who may be eaten with", () => {
    expect(flat("process_the_same_substance.md")).toMatch(
      /always at the same time a rule about who may be eaten with/i,
    );
  });
  it("makes the exclusion happen without anybody performing it", () => {
    expect(flat("process_the_excluded.md")).toMatch(/constituted by the meal having happened/i);
  });
});

describe("meal: nobody has to be working anybody", () => {
  it("refuses the host who manages the table and the hollow meal", () => {
    expect(flat("process_bond_meal.md")).toMatch(
      /stages the host as working the table has replaced the mechanism with a scheme/i,
    );
    expect(flat("playwright_instructions.md")).toMatch(
      /Do not stage the host as managing the table/,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do keep the pleasure real/);
  });
  it("keeps the exclusion arithmetic rather than judgement", () => {
    expect(flat("process_the_excluded.md")).toMatch(/mostly arithmetic rather than judgement/i);
  });
});

describe("meal: what the engine refuses to over-claim", () => {
  // The twist is the engine's central claim and its least evidenced one; the
  // experimental leg is small and is not what carries it.
  it("names its own twist as an inference rather than a measurement", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The twist is an inference and should be read as one/i);
    expect(refs).toMatch(/widely observed, easily recognised, and not measured/i);
  });
  it("holds the experimental leg loosely", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The experimental leg is small and should not be leaned on/i);
    expect(refs).toMatch(/consistent with the engine and they do not carry it/i);
  });
  it("takes Elias' manners without the theory of civilisation", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /takes the manners and leaves the theory of civilisation/i,
    );
  });
  it("refuses the reading that a meal is a technique", () => {
    expect(flat("REFERENCES.md")).toMatch(/shared eating is a technique to be deployed/i);
  });
});

describe("meal: the boundary with hospitality, the gift, and disgust", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The conversion of a stranger into a guest \(hospitality\)/);
    expect(refs).toMatch(/The transfer that binds by naming no price \(gift, owing\)/);
    expect(refs).toMatch(/The mouth's rejection of a contaminant \(disgust\)/);
    expect(refs).toMatch(/The rite that marks a passage \(ritual, liminality, passage\)/);
  });
  it("hands the binding transfer back to the gift engine from inside the member", () => {
    expect(flat("process_the_owed_return.md")).toMatch(
      /is the gift engine's, and why this engine borrows that logic rather than owning it/i,
    );
  });
  it("names no guest, gift, or rite form among its members", () => {
    const foreign = ["guest", "stranger", "gift", "rite", "hearth", "threshold"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("meal: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Meal");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_dividing.md"]).toEqual([
      ROOT,
      "process_the_sharing.md",
      "process_the_dividing.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_feast.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
