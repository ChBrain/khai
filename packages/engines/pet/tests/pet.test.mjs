// The pet engine tests only what is pet-specific: that the package conforms to
// the canon through the shared conformance kit (@chbrain/khai-tests), its
// manifest contract, the piece-engine shape, the twist and where it sits, and
// its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ANCHOR = "piece_pet.md";
const PROCESSES = ["process_the_acquiring.md", "process_the_arranging.md", "process_the_ending.md"];

describe("pet: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("pet: manifest", () => {
  it("declares a piece engine anchored on the animal", () => {
    expect(manifest.engine).toBe("pet");
    expect(manifest.type).toBe("piece");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ANCHOR);
    expect(roots[0].type).toBe("piece");
  });
  it("hangs one keeper and three processes flat beneath the anchor", () => {
    const children = manifest.members.filter((m) => m.parent === ANCHOR);
    expect(children.map((m) => m.file).sort()).toEqual(
      ["position_the_keeper.md", ...PROCESSES].sort(),
    );
    expect(children.filter((m) => m.type === "position").map((m) => m.file)).toEqual([
      "position_the_keeper.md",
    ]);
  });
  it("keeps the tree exactly one deep", () => {
    for (const m of manifest.members) {
      if (m.parent !== null) expect(m.parent).toBe(ANCHOR);
    }
  });
  it("wires the law and a persona at Projection", () => {
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

describe("pet: the twist lives in the anchor's Yearbook", () => {
  // The causation runs the way round nobody expects: the caring produces the
  // affection, not the other way about.
  it("names the dependence and the direction of the love", () => {
    const yearbook = flat(ANCHOR).split("## Yearbook")[1];
    expect(yearbook).toMatch(
      /A pet is kept alive by a dependence its keeper arranged, and arranging it is how the keeper came to love it/i,
    );
    expect(yearbook).toMatch(/The direction runs the way round nobody expects/i);
  });
  it("states Tuan's compound rather than opposing the two words", () => {
    expect(flat(ANCHOR)).toMatch(/Dominance and affection are not opposites here and never were/i);
    expect(flat(ANCHOR)).toMatch(
      /what dominance looks like when nothing in the arrangement resists it/i,
    );
  });
});

describe("pet: kinship vocabulary, ward conditions", () => {
  it("names both halves in the anchor's Apparent", () => {
    const a = flat(ANCHOR);
    expect(a).toMatch(
      /described in the vocabulary of kinship and lives in the conditions of a ward/i,
    );
  });
  it("keeps what the arrangement genuinely gives the household", () => {
    expect(flat(ANCHOR)).toMatch(/it is not a false one/i);
  });
});

describe("pet: the keeper's authority is total and unfelt", () => {
  it("gives them every route and notes none existed before", () => {
    const k = flat("position_the_keeper.md");
    expect(k).toMatch(/none of those routes existed before that person opened them/i);
  });
  it("orders a whole day without an order that could be refused", () => {
    expect(flat("position_the_keeper.md")).toMatch(
      /without ever issuing an order it could refuse/i,
    );
  });
  it("removes the neutral position", () => {
    expect(flat("position_the_keeper.md")).toMatch(
      /A keeper who stops deciding has not freed the animal, they have neglected it/i,
    );
  });
  it("closes on authority experienced as being chosen", () => {
    expect(flat("position_the_keeper.md")).toMatch(
      /The Keeper has complete authority and experiences it as being chosen/i,
    );
  });
});

describe("pet: the three processes", () => {
  it("makes the acquiring one-sided, and refuses to let rescue change that", () => {
    const a = flat("process_the_acquiring.md");
    expect(a).toMatch(/The Acquiring is a decision about a life, taken entirely on one side/i);
    expect(a).toMatch(/Rescue inverts the moral story and not the structure/i);
  });
  it("makes the arranging protective and dependence-producing at once", () => {
    const a = flat("process_the_arranging.md");
    expect(a).toMatch(
      /The Arranging protects the animal by removing its capacity to do without protection/i,
    );
    expect(a).toMatch(/every step in it is the right one/i);
  });
  it("keeps the ending a mercy and a decision", () => {
    const e = flat("process_the_ending.md");
    expect(e).toMatch(/no method exists for telling a merciful decision from a convenient one/i);
    expect(e).toMatch(/including from inside the person making it/i);
  });
});

describe("pet: nobody has to be cruel", () => {
  it("keeps the keeper good and the removals right", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The keeper is good\. Every removal was the right call\. The affection is real\./,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do make the keeper good/);
  });
});

describe("pet: what the engine refuses to over-claim", () => {
  it("keeps Haraway as a standing objection rather than answering her", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Haraway is the standing objection and is kept rather than answered/i);
    expect(refs).toMatch(/She is not a footnote here/i);
    // The engine says plainly that its own defence does not dispose of her case.
    expect(refs).toMatch(/that defence does not dispose of her case/i);
  });
  it("marks the spine as an essay rather than a study", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Tuan's book is an essay, not a study/i);
    expect(refs).toMatch(/the engine's twist inherits that status/i);
  });
  it("admits it cannot speak for the animal", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The engine cannot speak for the animal/i);
    expect(refs).toMatch(/preferences cannot be converted into consent/i);
  });
  it("says the piece grammar is the argument, and warns against reading it as endorsement", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /The piece grammar is the engine's own argument and is uncomfortable on purpose/i,
    );
    expect(refs).toMatch(/has read the engine backwards/i);
    // The loader carries the same warning, since that is where the shape is wired.
    expect(flat("index.mjs")).toMatch(/argument rather than an oversight/i);
  });
  it("refuses the reading that keeping a pet is wrong", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /keeping a pet is wrong, that keepers are exercising power deliberately/i,
    );
  });
});

describe("pet: the first engine with an animal in it", () => {
  it("says so, and names where animals had appeared before", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/This is khai's first engine with an animal in it/i);
    for (const prior of ["commons", "disgust", "totem"]) {
      expect(refs).toMatch(new RegExp(prior, "i"));
    }
  });
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The bond under threat \(attachment, tending, compassion\)/);
    expect(refs).toMatch(
      /The possession that carries a self \(extended-self, heirloom, investiture\)/,
    );
    expect(refs).toMatch(/The animal as resource \(commons, meal, collection\)/);
  });
});

describe("pet: compose()", () => {
  // A piece engine composes two links: the object, then what happens around it.
  it("composes every member beneath the anchor, object first", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1);
    expect(leaves).not.toContain(ANCHOR);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Piece: Pet");
      expect(out.includes("## Place")).toBe(true);
    }
  });
  it("gives a member a two-link chain: anchor, member", () => {
    expect(chains["process_the_ending.md"]).toEqual([ANCHOR, "process_the_ending.md"]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_naming.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
