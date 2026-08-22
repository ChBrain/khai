// The fermentation engine tests only what is fermentation-specific: that the
// package conforms to the canon through the shared conformance kit
// (@chbrain/khai-tests), its manifest contract, the four-movement shape, the
// two cargo types it wires, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_fermentation.md";
const MOVEMENTS = [
  "process_substrate_fermentation.md",
  "process_setting_fermentation.md",
  "process_succession_fermentation.md",
  "process_turn_fermentation.md",
];

describe("fermentation: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("fermentation: manifest", () => {
  it("declares the fermentation process tree with a single root", () => {
    expect(manifest.engine).toBe("fermentation");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- a vessel running, not a state", () => {
    for (const m of manifest.members) expect(m.type).toBe("process");
  });
  it("every non-root member names a parent that exists", () => {
    const files = new Set(manifest.members.map((m) => m.file));
    for (const m of manifest.members) {
      if (m.parent !== null) expect(files.has(m.parent)).toBe(true);
    }
  });
  it("wires one phenomenon on two cargo types, following decay's precedent", () => {
    // A ferment is a vessel and also a room that was warm enough, so the
    // engine attaches at Piece and at Place rather than at Persona.
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "piece",
      section: "Apparent",
      link: "expression",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "place",
      section: "Shown",
      link: "expression",
      level: "fail",
    });
    expect(manifest.requires.some((r) => r.on === "persona")).toBe(false);
  });
});

describe("fermentation: the four movements", () => {
  // The four run in order for one vessel and loop across many, since the turn
  // hands the next vessel its beginning.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("keeps the four movements in the order a vessel runs", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads).toEqual(MOVEMENTS);
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the setting's three conditions in the order they are applied", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_setting_fermentation.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_salt.md",
      "process_the_shut_air.md",
      "process_the_hurdles.md",
    ]);
  });
});

describe("fermentation: the twist lives at the root", () => {
  // Occupation rather than exclusion is a property of the whole arrangement.
  // The turn carries it downward.
  it("the root's Echo names occupation rather than exclusion", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /A ferment is not defended from rot; it is rotted first by something you chose/i,
    );
    expect(echo).toMatch(/Preservation here is occupation rather than exclusion/i);
  });
  it("the turn movement carries the same keystone", () => {
    expect(flat("process_turn_fermentation.md")).toMatch(
      /a ferment is not defended from rot; it is rotted first by something you chose/i,
    );
  });
  it("reads the engine on what was favoured rather than what was prevented", () => {
    expect(flat(ROOT)).toMatch(
      /Fermentation is read on what was favoured, never on what was prevented/i,
    );
  });
});

describe("fermentation: nothing is excluded at any stage", () => {
  it("keeps the spoilage organisms present throughout", () => {
    expect(flat(ROOT)).toMatch(/they are outrun rather than removed/i);
    expect(flat("process_the_wild_load.md")).toMatch(
      /The Wild Load is the whole cast, present from the beginning/i,
    );
  });
  it("makes doing nothing an active selection", () => {
    expect(flat("process_substrate_fermentation.md")).toMatch(
      /it will be fermented or it will be spoiled, and doing nothing selects the second/i,
    );
  });
  it("starts the process and the spoilage with the same cut", () => {
    expect(flat("process_the_wound.md")).toMatch(
      /The Wound starts the process and starts the spoilage together/i,
    );
  });
  it("makes the wanted products abandoned intermediates", () => {
    expect(flat("process_the_sugar.md")).toMatch(
      /The Sugar is spent badly on purpose, and the leavings are the food/i,
    );
  });
});

describe("fermentation: the setting rigs a contest rather than building a wall", () => {
  it("states the method at the movement head", () => {
    expect(flat("process_setting_fermentation.md")).toMatch(
      /The Setting does not defend the jar; it rigs the contest inside it/i,
    );
  });
  it("makes salt a price rather than a poison", () => {
    expect(flat("process_the_salt.md")).toMatch(/The Salt is a price rather than a poison/i);
  });
  it("makes the exclusion of air a withdrawal rather than a defence", () => {
    expect(flat("process_the_shut_air.md")).toMatch(
      /The Shut Air withdraws an advantage and grants nothing/i,
    );
  });
  it("keeps each hurdle mild and only jointly sufficient", () => {
    const h = flat("process_the_hurdles.md");
    expect(h).toMatch(/The Hurdles work together or not at all/i);
    expect(h).toMatch(/cannot spend that energy twice/i);
  });
});

describe("fermentation: the succession is self-driving and self-terminating", () => {
  it("has each population ended by its own product", () => {
    expect(flat("process_succession_fermentation.md")).toMatch(
      /The Succession runs itself and cannot hold still/i,
    );
  });
  it("makes the first organism the wrong one and necessary", () => {
    expect(flat("process_the_first_bloom.md")).toMatch(
      /The First Bloom is the wrong organism doing the necessary work/i,
    );
  });
  it("has the vessel manufacture its own protection, late", () => {
    const a = flat("process_the_acid_made.md");
    expect(a).toMatch(/The Acid Made is the vessel producing the condition that will protect it/i);
    expect(a).toMatch(
      /the days when the vessel is most exposed are the days when the least is defending it/i,
    );
  });
  it("makes the handover arranged by the outgoing tenant", () => {
    expect(flat("process_the_handover.md")).toMatch(
      /The Handover is a change of tenant arranged by the outgoing one/i,
    );
  });
});

describe("fermentation: the endpoint comes from outside the vessel", () => {
  it("puts the only judgement in the process outside it", () => {
    expect(flat("process_turn_fermentation.md")).toMatch(/The process has no endpoint of its own/i);
  });
  it("keeps the palate skilled and the boundary conventional", () => {
    expect(flat("process_the_line_drawn.md")).toMatch(
      /The Line Drawn is a real skill applied to a boundary the process does not contain/i,
    );
  });
  it("makes the arrest a pause rather than a conclusion", () => {
    expect(flat("process_the_arrest.md")).toMatch(
      /The Arrest chooses between a ferment that lasts and a ferment that is working/i,
    );
  });
  it("carries a population forward that is no longer the population", () => {
    expect(flat("process_the_next_jar.md")).toMatch(
      /The Next Jar continues a population that is no longer the population/i,
    );
  });
});

describe("fermentation: no organism is a villain", () => {
  it("refuses contamination and refuses the controlling practitioner", () => {
    expect(flat("process_turn_fermentation.md")).toMatch(
      /stages the ferment as an infection has replaced the mechanism with an accident/i,
    );
    expect(flat("REFERENCES.md")).toMatch(/Nothing was contaminated\. No organism is a villain\./);
    expect(flat("playwright_instructions.md")).toMatch(/Do make the failure geometric/);
  });
});

describe("fermentation: what the engine refuses to over-claim", () => {
  // A measured spine for once, so the caveats are about scope and about
  // safety rather than about the mechanism.
  it("names the succession as the firm ground", () => {
    expect(flat("REFERENCES.md")).toMatch(/The microbial succession is well characterised/i);
  });
  it("refuses to be read as a specification", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /nothing in this engine should be read as a specification/i,
    );
  });
  it("states in terms that it is not a food-safety guide", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/This engine is not a food-safety guide and must not be used as one/i);
    expect(refs).toMatch(/true of taste and false of toxicology/i);
    expect(refs).toMatch(/applies strictly to the palatable range and not to the safe one/i);
  });
  it("admits it flattens very different processes", () => {
    expect(flat("REFERENCES.md")).toMatch(/The engine flattens very different processes/i);
  });
  it("refuses the reading that spoilage is only an opinion", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /spoilage is only an opinion, that any jar left long enough becomes food/i,
    );
  });
});

describe("fermentation: the boundary with decay, wear, and combustion", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Matter losing its imposed order \(decay, erosion, palimpsest\)/);
    expect(refs).toMatch(/Degradation through use \(wear, ergonomics\)/);
    expect(refs).toMatch(/Transformation by heat \(combustion, fire, hearth\)/);
    expect(refs).toMatch(/The gathering that eats it \(meal, hospitality, appetite\)/);
  });
  it("names no rot, rust, or burning form among its members", () => {
    const foreign = ["rot", "rust", "burn", "patina", "crumble"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("fermentation: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Fermentation");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_hurdles.md"]).toEqual([
      ROOT,
      "process_setting_fermentation.md",
      "process_the_hurdles.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_mother.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
