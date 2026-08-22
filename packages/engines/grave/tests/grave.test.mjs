// The grave engine tests only what is grave-specific: that the package conforms
// to the canon through the shared conformance kit (@chbrain/khai-tests), its
// manifest contract, the piece-engine shape, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ANCHOR = "piece_grave.md";
const PROCESSES = ["process_the_burying.md", "process_the_visiting.md", "process_the_lapsing.md"];

describe("grave: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("grave: manifest", () => {
  it("declares a piece engine anchored on the plot itself", () => {
    expect(manifest.engine).toBe("grave");
    expect(manifest.type).toBe("piece");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ANCHOR);
    expect(roots[0].type).toBe("piece");
  });
  it("hangs one holder and three fates flat beneath the anchor", () => {
    // A piece engine is not a movement tree: the object is the anchor and the
    // members are what happens around it, each a direct child.
    const children = manifest.members.filter((m) => m.parent === ANCHOR);
    expect(children.map((m) => m.file).sort()).toEqual(
      ["position_next_of_kin.md", ...PROCESSES].sort(),
    );
    expect(children.filter((m) => m.type === "position").map((m) => m.file)).toEqual([
      "position_next_of_kin.md",
    ]);
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

describe("grave: the twist lives in the anchor's Yearbook", () => {
  // The object is what the whole engine turns on, so the keystone belongs to
  // the piece rather than to any of the three processes.
  it("names the one maintainable part of a death", () => {
    const yearbook = flat(ANCHOR).split("## Yearbook")[1];
    expect(yearbook).toMatch(
      /A grave is the only part of a death anybody can still maintain, which is why it is the part the living are judged on/i,
    );
    expect(yearbook).toMatch(/the plot can be weeded, and the weeding is visible/i);
  });
  it("states the asymmetry the twist produces", () => {
    expect(flat(ANCHOR)).toMatch(
      /a family that is grieving hard and living two hundred miles away keeps a worse grave/i,
    );
  });
});

describe("grave: the object is leased, distant, and not the dead person's", () => {
  it("keeps it a right for a term rather than owned earth", () => {
    const a = flat(ANCHOR);
    expect(a).toMatch(
      /a right of burial for a term, so this is the only property most people hold/i,
    );
    expect(a).toMatch(/pay for, visit, maintain, and can neither occupy nor sell/i);
  });
  it("reads the plot as an institution of the living", () => {
    expect(flat(ANCHOR)).toMatch(
      /Read as the dead person's place and built as an institution of the living/i,
    );
  });
  it("puts what is apparent on the survivors rather than on the person under it", () => {
    expect(flat(ANCHOR)).toMatch(/Passers-by read the plot before they read the stone/i);
  });
});

describe("grave: the next of kin holds a right and loses a privacy", () => {
  it("gives the position small absolute powers", () => {
    expect(flat("position_next_of_kin.md")).toMatch(
      /makes one relative the authority on how a shared loss is presented/i,
    );
  });
  it("puts the mourning on public display as groundskeeping", () => {
    expect(flat("position_next_of_kin.md")).toMatch(
      /Grief that would otherwise be nobody's business is on display in the form of groundskeeping/i,
    );
  });
  it("ends the holding without anybody being told", () => {
    expect(flat("position_next_of_kin.md")).toMatch(
      /the renewal notice goes to an address from twenty years ago/i,
    );
  });
});

describe("grave: the three fates", () => {
  it("fixes the address at the worst moment for choosing one", () => {
    expect(flat("process_the_burying.md")).toMatch(
      /The Burying fixes an address at the worst possible moment for choosing one/i,
    );
  });
  it("makes the visit out of tasks rather than out of standing still", () => {
    const v = flat("process_the_visiting.md");
    expect(v).toMatch(/The tasks are what makes the visit possible/i);
    expect(v).toMatch(/stands at a stone for four minutes and leaves/i);
    expect(v).toMatch(/The Visiting keeps the bond in the only material the bond has left/i);
  });
  it("assembles the ending out of innocent weeks", () => {
    expect(flat("process_the_lapsing.md")).toMatch(
      /The Lapsing is a verdict assembled out of individually innocent weeks/i,
    );
  });
});

describe("grave: nobody has to be neglectful", () => {
  it("refuses the negligent family and the decided abandonment", () => {
    expect(flat("process_the_lapsing.md")).toMatch(/Nobody neglected it\. Nobody decided to stop/);
    expect(flat("REFERENCES.md")).toMatch(
      /Nobody neglected it\. Nobody decided to stop\. The visits thinned and the years did the rest/,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do keep the lapsing innocent/);
  });
});

describe("grave: what the engine refuses to over-claim", () => {
  // History and ethnography with no experimental base, and the engine says so
  // rather than leaving a reader to discover it.
  it("marks Laqueur's thesis as a historical argument", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Laqueur's thesis is a historical argument, not a measurement/i);
    expect(refs).toMatch(/established by showing rather than by testing/i);
  });
  it("bounds the visiting account to the studies it came from", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The visiting movement rests on a small number of deep local studies/i,
    );
  });
  it("admits that it flattens variation by religion and region", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /Practice varies enormously by religion and region and the engine flattens it/i,
    );
  });
  it("names the gap where there is no grave at all", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The engine assumes there is a grave/i);
    expect(refs).toMatch(/which is a real gap/i);
  });
  it("separates the attested claim from a measured one", () => {
    expect(flat("REFERENCES.md")).toMatch(/The judged-on claim is attested rather than measured/i);
  });
  it("refuses the reading that visiting is neurotic or stopping is a failure", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /visiting is neurotic, that people who stop are failing anybody/i,
    );
  });
});

describe("grave: the boundary with grief, ritual, and heirloom", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The mourning itself \(grief, memory, lasting\)/);
    expect(refs).toMatch(/The rite \(ritual, rite of passage, ceremony\)/);
    expect(refs).toMatch(
      /The object that carries an identity \(heirloom, extended-self, totem, investiture\)/,
    );
    expect(refs).toMatch(/The institutional record \(document, legibility, register\)/);
  });
  it("hands the mourning and the rite back from inside the members", () => {
    expect(flat("process_the_visiting.md")).toMatch(
      /The internal bond that the visiting expresses is grief's/i,
    );
    expect(flat("process_the_burying.md")).toMatch(/The rite itself is ritual's/i);
  });
  it("names no mourning, funeral, or memorial member of its own", () => {
    const foreign = ["mourning", "funeral", "memorial", "shrine"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("grave: compose()", () => {
  // A piece engine composes two links: the object, then what happens around it.
  it("composes every member beneath the anchor, object first", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1);
    expect(leaves).not.toContain(ANCHOR);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Piece: Grave");
      expect(out.includes("## Place")).toBe(true);
    }
  });
  it("gives a member a two-link chain: anchor, member", () => {
    expect(chains["process_the_visiting.md"]).toEqual([ANCHOR, "process_the_visiting.md"]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_exhuming.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
