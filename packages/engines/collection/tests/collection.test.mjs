// The collection engine tests only what is collection-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, the piece-engine shape, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ANCHOR = "piece_collection.md";
const PROCESSES = ["process_hunting.md", "process_completing.md", "process_dispersal.md"];

describe("collection: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("collection: manifest", () => {
  it("declares a piece engine anchored on the object itself", () => {
    expect(manifest.engine).toBe("collection");
    expect(manifest.type).toBe("piece");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ANCHOR);
    expect(roots[0].type).toBe("piece");
  });
  it("hangs one keeper and three fates flat beneath the anchor", () => {
    // A piece engine is not a movement tree: the object is the anchor and the
    // members are what happens around it, each a direct child.
    const children = manifest.members.filter((m) => m.parent === ANCHOR);
    expect(children.map((m) => m.file).sort()).toEqual(
      ["position_collector.md", ...PROCESSES].sort(),
    );
    expect(children.filter((m) => m.type === "position").map((m) => m.file)).toEqual([
      "position_collector.md",
    ]);
    expect(
      children
        .filter((m) => m.type === "process")
        .map((m) => m.file)
        .sort(),
    ).toEqual([...PROCESSES].sort());
  });
  it("keeps the tree exactly one deep", () => {
    for (const m of manifest.members) {
      if (m.parent !== null) expect(m.parent).toBe(ANCHOR);
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

describe("collection: the twist lives at the anchor", () => {
  // For a piece engine the anchor's Yearbook carries the arc and the failure, so
  // the keystone sits there. The completing carries it downward.
  it("the anchor's Yearbook names the gap as the structure", () => {
    const y = flat(ANCHOR).split("## Yearbook")[1];
    expect(y).toMatch(/A collection is made of what is missing from it/i);
    expect(y).toMatch(/most wanted and least wanted at once/i);
  });
  it("the completing carries the same keystone", () => {
    expect(flat("process_completing.md")).toMatch(
      /a collection is made of what is missing from it/i,
    );
  });
  it("names the three failures and that only one is planned for", () => {
    expect(flat(ANCHOR)).toMatch(
      /completion, by dispersal, and by the collector's death, and only one of the three is ever planned for/i,
    );
  });
});

describe("collection: the criterion is the holding", () => {
  // What the collector actually keeps is the boundary, not the objects -- which
  // is why the position forecloses what it does and why dispersal is final.
  it("makes the criterion the larger half of what is held", () => {
    const c = flat("position_collector.md");
    expect(c).toMatch(/the objects are the smaller/i);
    expect(c).toMatch(/inventory of absences more detailed than their inventory of possessions/i);
  });
  it("forecloses use, completion, and an honest price", () => {
    const loses = flat("position_collector.md").split("## Loses")[1];
    expect(loses).toMatch(/forecloses ordinary use of the objects/i);
    expect(loses).toMatch(/forecloses being finished/i);
    expect(loses).toMatch(/not the figure the collector is holding/i);
  });
  it("ends the collection by unreadability rather than by loss", () => {
    const d = flat("process_dispersal.md");
    expect(d).toMatch(/The Dispersal takes nothing and ends everything/i);
    expect(d).toMatch(/existed nowhere but in the collector/i);
  });
});

describe("collection: the search is the activity", () => {
  it("charges the search's satisfaction to the object", () => {
    expect(flat("process_hunting.md")).toMatch(
      /The Hunting is the product and the objects are the receipts/i,
    );
  });
  it("keeps every refinement genuine rather than evasive", () => {
    const c = flat("process_completing.md");
    expect(c).toMatch(/None of it is experienced as evasion/i);
    expect(c).toMatch(/no way to tell an insight from a reprieve/i);
  });
});

describe("collection: nobody has to be unwell", () => {
  it("refuses the collector-as-symptom reading", () => {
    expect(flat("REFERENCES.md")).toMatch(/nobody has to be unwell for any of it to run/i);
    expect(flat("playwright_instructions.md")).toMatch(
      /Do keep the collector competent and good company/,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do not model hoarding here/);
  });
  it("separates collecting from hoarding on stated grounds", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /separates them on the criterion, the discard behaviour, and the impairment/i,
    );
  });
});

describe("collection: what the engine refuses to over-claim", () => {
  // A humanities engine with a thin empirical apron, and the proportions are
  // stated rather than blurred.
  it("marks Baudrillard as philosophy and declines the rest of his argument", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/"The System of Collecting" is philosophy/i);
    expect(refs).toMatch(/substitutes for a love object/i);
    expect(refs).toMatch(/readings, not findings, and the engine does not need them/i);
  });
  it("bounds the deferred-closure evidence to what it is", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/closest thing here to evidence for deferred closure/i);
    expect(refs).toMatch(/nobody has since tested the claim at scale/i);
  });
  it("names Muensterberger as the weakest source and rests no member on it", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/the weakest thing on this page/i);
    expect(refs).toMatch(/no member here rests on it/i);
  });
});

describe("collection: the boundary with the self, the line, and the object's wear", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The possession experienced as part of the self \(extended-self\)/);
    expect(refs).toMatch(/The object withheld from exchange for a lineage \(heirloom\)/);
    expect(refs).toMatch(/The object's material life \(object-cycle, wear, decay, restoration\)/);
    expect(refs).toMatch(
      /Wanting, rarity, and compulsion \(desire, scarcity, addiction, self-control\)/,
    );
  });
  it("states the boundary inside the anchor as well as the references", () => {
    expect(flat(ANCHOR)).toMatch(
      /not the possession experienced as part of the self, which is extended-self's/i,
    );
  });
  it("names no heirloom, wear, or hoard member of its own", () => {
    const foreign = ["heirloom", "heir", "wear", "decay", "hoard", "totem"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("collection: compose()", () => {
  // chains is keyed by true leaf only. In a flat piece engine every member but
  // the anchor is a leaf, so each composes as a two-link chain.
  it("composes every member below the anchor, anchor first", () => {
    const leaves = Object.keys(chains);
    expect(leaves.sort()).toEqual(["position_collector.md", ...PROCESSES].sort());
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Piece: Collection");
      expect(out.includes("## Load Bearing")).toBe(true);
    }
  });
  it("gives a member a two-link chain: anchor, member", () => {
    expect(chains["process_completing.md"]).toEqual([ANCHOR, "process_completing.md"]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_missing_one.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
