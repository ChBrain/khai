// The germination engine tests only what is germination-specific: that the
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

const ROOT = "process_germination.md";
const MOVEMENTS = [
  "process_pack_germination.md",
  "process_hold_germination.md",
  "process_cue_germination.md",
  "process_commit_germination.md",
];

describe("germination: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("germination: manifest", () => {
  it("declares the germination process tree with a single root", () => {
    expect(manifest.engine).toBe("germination");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- a suspension running, not a state", () => {
    for (const m of manifest.members) expect(m.type).toBe("process");
  });
  it("every non-root member names a parent that exists", () => {
    const files = new Set(manifest.members.map((m) => m.file));
    for (const m of manifest.members) {
      if (m.parent !== null) expect(files.has(m.parent)).toBe(true);
    }
  });
  it("wires one phenomenon on two cargo types, as the natural lane does", () => {
    // A seed is an object and also a patch of ground that was disturbed, so
    // the engine attaches at Piece and at Place rather than at Persona.
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

describe("germination: the four movements", () => {
  // The four run once per seed, and almost every seed stops at the second.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("keeps the four movements in the order a seed runs", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads).toEqual(MOVEMENTS);
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the cue's three signals in the order they are read", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_cue_germination.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_cold_passed.md",
      "process_the_smoke.md",
      "process_the_light_read.md",
    ]);
  });
});

describe("germination: the twist lives at the root", () => {
  // The irreversibility belongs to the whole arrangement. The commit carries it
  // downward.
  it("the root's Echo names the refusal and the one-way agreement", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /A seed spends nearly all of its life refusing to grow, and the one time it agrees there is no way back/i,
    );
    expect(echo).toMatch(/Dormancy is not sleep and not inactivity/i);
  });
  it("the commit movement carries the same keystone", () => {
    expect(flat("process_commit_germination.md")).toMatch(
      /a seed spends nearly all of its life refusing to grow, and the one time it agrees there is no way back/i,
    );
  });
  it("reads the engine on what was required rather than on what grew", () => {
    expect(flat(ROOT)).toMatch(/Germination is read on what was required, never on what grew/i);
  });
});

describe("germination: the pack is fixed before the conditions are known", () => {
  it("provisions once, by somebody who cannot see the conditions", () => {
    expect(flat("process_pack_germination.md")).toMatch(
      /The Pack is provisioned once, by somebody who cannot see the conditions/i,
    );
  });
  it("keeps the embryo alive and not resting", () => {
    expect(flat("process_the_embryo.md")).toMatch(/The Embryo waits without resting/i);
  });
  it("sets the budget before the distance is known", () => {
    expect(flat("process_the_store.md")).toMatch(
      /The Store is spent on a distance nobody measured in advance/i,
    );
  });
  it("makes the coat both the armour and the lock", () => {
    expect(flat("process_the_coat.md")).toMatch(
      /The Coat protects the seed from everything including its own future/i,
    );
  });
});

describe("germination: dormancy is an activity, not an absence", () => {
  it("states the block at the movement head", () => {
    const h = flat("process_hold_germination.md");
    expect(h).toMatch(/The Hold keeps the seed alive by keeping it from living/i);
    expect(h).toMatch(/Remove the block and the seed goes immediately/i);
  });
  it("makes the refusal something the seed is doing", () => {
    expect(flat("process_the_refusal.md")).toMatch(
      /The Refusal is something the seed is doing, not something being done to it/i,
    );
  });
  it("forces a forecast out of present conditions", () => {
    expect(flat("process_the_clock_unset.md")).toMatch(
      /The Clock Unset forces a forecast out of a thermometer/i,
    );
  });
  it("puts the hedge in the population rather than in any seed", () => {
    const b = flat("process_the_bank.md");
    expect(b).toMatch(/The Bank buys the line a future by spending nearly all of its members/i);
    expect(b).toMatch(/only visible from the population, which no seed occupies/i);
  });
});

describe("germination: the cues certify something adjacent", () => {
  it("names the proxy structure at the movement head", () => {
    expect(flat("process_cue_germination.md")).toMatch(
      /The Cue reads a reliable stand-in for a fact it has no access to/i,
    );
  });
  it("requires a season to have happened rather than a condition to be met", () => {
    expect(flat("process_the_cold_passed.md")).toMatch(
      /The Cold Passed certifies a season by requiring one to have happened/i,
    );
  });
  it("reads the residue rather than the fire, and hands the fire back", () => {
    const s = flat("process_the_smoke.md");
    expect(s).toMatch(/The Smoke is a precise signal for a brief opening/i);
    expect(s).toMatch(
      /The fire that produced it, and the cone that opens in it, are combustion's/i,
    );
  });
  it("measures depth and competition with one instrument", () => {
    expect(flat("process_the_light_read.md")).toMatch(
      /The Light Read measures depth and competition with the same instrument/i,
    );
  });
});

describe("germination: the commitment is one-way", () => {
  it("hides the threshold inside an ordinary process", () => {
    expect(flat("process_the_imbibition.md")).toMatch(
      /The Imbibition looks the same on both sides of the point of no return/i,
    );
  });
  it("spends a fixed store on an unmeasured distance", () => {
    expect(flat("process_the_one_shot.md")).toMatch(
      /The One Shot spends a fixed store on an unmeasured distance/i,
    );
  });
  it("makes the arrival a loss of every option", () => {
    expect(flat("process_the_after.md")).toMatch(
      /The After is the end of every option the seed had/i,
    );
  });
});

describe("germination: nothing has malfunctioned", () => {
  it("refuses the accident reading and the choosing seed", () => {
    expect(flat("process_commit_germination.md")).toMatch(
      /stages the germination as a failure has replaced the mechanism with an accident/i,
    );
    expect(flat("REFERENCES.md")).toMatch(/Nothing failed\. The cue was read correctly\./);
    expect(flat("playwright_instructions.md")).toMatch(/Do stage the refusal as work/);
  });
});

describe("germination: what the engine refuses to over-claim", () => {
  // Firm physiology, so the caveats are about scope and about the vocabulary
  // the khai grammar forces on a plant.
  it("names the mechanism as measured rather than argued", () => {
    expect(flat("REFERENCES.md")).toMatch(/The mechanism is measured, not argued/i);
  });
  it("admits the four-movement shape flattens the dormancy classes", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Species variation is enormous and the engine flattens it/i);
    expect(refs).toMatch(/germinate on water alone/i);
  });
  it("marks the bank's hedge as an interpretation", () => {
    expect(flat("REFERENCES.md")).toMatch(/The seed-bank hedge is an evolutionary interpretation/i);
  });
  it("warns that its own vocabulary is deliberately wrong", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The engine's vocabulary is deliberately wrong/i);
    expect(refs).toMatch(/there is no decision anywhere in this process/i);
    expect(refs).toMatch(/A reader who takes the language literally will get the biology wrong/i);
  });
  it("refuses the reading that dormancy is a failure to grow", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /dormancy is a failure to grow, that a seed is inert, or that germination is a beginning/i,
    );
  });
});

describe("germination: the boundary with decay, fermentation, and combustion", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Matter losing its imposed order \(decay, erosion, palimpsest\)/);
    expect(refs).toMatch(/Directed spoilage \(fermentation\)/);
    expect(refs).toMatch(/Fire and what it opens \(combustion, fire\)/);
    expect(refs).toMatch(/The plant after the first leaf \(the world\)/);
  });
  it("names no rot, fire, or growth form among its members", () => {
    const foreign = ["rot", "fire", "burn", "growth", "flower"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("germination: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Germination");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_refusal.md"]).toEqual([
      ROOT,
      "process_hold_germination.md",
      "process_the_refusal.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_radicle.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
