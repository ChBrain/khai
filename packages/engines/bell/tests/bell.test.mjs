// The bell engine tests only what is bell-specific: that the package conforms
// to the canon through the shared conformance kit (@chbrain/khai-tests), its
// manifest contract, the piece-engine shape, the two cargo types it wires, and
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

const ANCHOR = "piece_bell.md";
const PROCESSES = ["process_the_casting.md", "process_the_ringing.md", "process_the_earshot.md"];

describe("bell: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("bell: manifest", () => {
  it("declares a piece engine anchored on the cast object", () => {
    expect(manifest.engine).toBe("bell");
    expect(manifest.type).toBe("piece");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ANCHOR);
    expect(roots[0].type).toBe("piece");
  });
  it("hangs one ringer and three fates flat beneath the anchor", () => {
    const children = manifest.members.filter((m) => m.parent === ANCHOR);
    expect(children.map((m) => m.file).sort()).toEqual(
      ["position_the_ringer.md", ...PROCESSES].sort(),
    );
    expect(children.filter((m) => m.type === "position").map((m) => m.file)).toEqual([
      "position_the_ringer.md",
    ]);
  });
  it("keeps the tree exactly one deep", () => {
    for (const m of manifest.members) {
      if (m.parent !== null) expect(m.parent).toBe(ANCHOR);
    }
  });
  it("wires one phenomenon on two cargo types, not on a persona", () => {
    // A bell is an object with a name and a date, and also a settlement that
    // shares a clock, so it attaches at Piece and at Place.
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

describe("bell: the twist lives in the anchor's Yearbook", () => {
  // The service and the power are one property, which belongs to the object
  // rather than to any of the three processes.
  it("names the same fact doing both jobs", () => {
    const yearbook = flat(ANCHOR).split("## Yearbook")[1];
    expect(yearbook).toMatch(
      /Nobody can decline a bell, which is why it is a service and why it is a claim/i,
    );
    expect(yearbook).toMatch(/the value and the power are the identical property/i);
  });
  it("explains the historical fights from the twist rather than from malice", () => {
    expect(flat(ANCHOR)).toMatch(/not because anybody doubted their value/i);
  });
});

describe("bell: the object is public, expensive, and unused by anybody", () => {
  it("makes it the most expensive object and the least used", () => {
    const a = flat(ANCHOR);
    expect(a).toMatch(/the most expensive object a small community owns and the least used/i);
  });
  it("presents as heritage and operates as a channel", () => {
    expect(flat(ANCHOR)).toMatch(
      /the object presents itself as heritage and operates as a channel/i,
    );
  });
  it("ends by becoming a complaint rather than by wearing out", () => {
    expect(flat(ANCHOR)).toMatch(/ends not by wearing out but by becoming a complaint/i);
  });
});

describe("bell: the ringer holds a narrow permission and a wide instrument", () => {
  it("gives the position an authorisation rather than the object", () => {
    expect(flat("position_the_ringer.md")).toMatch(
      /What they hold is not the bell .* but the authorisation to sound it/i,
    );
  });
  it("removes any private version of the act", () => {
    expect(flat("position_the_ringer.md")).toMatch(/There is no small version of this act/i);
  });
  it("closes on the smallest authority over the largest audience", () => {
    expect(flat("position_the_ringer.md")).toMatch(
      /The Ringer holds the smallest possible authority over the largest possible audience/i,
    );
  });
});

describe("bell: the three fates", () => {
  it("fixes a voice in an afternoon for four hundred years", () => {
    expect(flat("process_the_casting.md")).toMatch(
      /The Casting fixes a voice in an afternoon and issues it for four hundred years/i,
    );
  });
  it("makes the ringing a broadcast with no channel back", () => {
    const r = flat("process_the_ringing.md");
    expect(r).toMatch(/The Ringing is a broadcast with no way to switch it off/i);
    expect(r).toMatch(/the absence of any channel back/i);
  });
  it("makes the earshot a real community with an arbitrary edge", () => {
    const e = flat("process_the_earshot.md");
    expect(e).toMatch(/The Earshot is a real community with an arbitrary edge/i);
    expect(e).toMatch(/coincides with no administrative line/i);
  });
});

describe("bell: nobody has to be imposing on anybody", () => {
  it("keeps the service real and the ringer ordinary", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The alarm found everybody\. The hour was free\. The ringer was neither pious nor tyrannical/,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do let the alarm work first/);
  });
});

describe("bell: what the engine refuses to over-claim", () => {
  // A good archival base and a correspondingly narrow one, and a regime that
  // has substantially ended.
  it("marks the source as documented and local", () => {
    expect(flat("REFERENCES.md")).toMatch(/Corbin's account is documented and local/i);
  });
  it("admits it generalises from one century and one country", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The engine generalises from one century and one country/i,
    );
  });
  it("says the regime it describes has substantially ended", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The regime the engine describes has substantially ended/i);
    expect(refs).toMatch(/the subject of a noise complaint/i);
  });
  it("flags the unrefusable-channel reading as its own extension", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The unrefusable-channel reading is the engine's own extension/i);
    expect(refs).toMatch(/not something he says in those terms/i);
  });
  it("refuses the reading that bells are instruments of domination", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /bells are instruments of domination, that the people who rang them were exercising power deliberately/i,
    );
  });
});

describe("bell: the boundary with soundscape and social-time", () => {
  it("names the soundmark boundary from inside the anchor", () => {
    expect(flat(ANCHOR)).toMatch(
      /not the auditory field of a place with its keynote and its soundmarks, which is soundscape's/i,
    );
  });
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The auditory field \(soundscape, sensorium, smellscape\)/);
    expect(refs).toMatch(/The shared clock \(social-time, chronos, kairos\)/);
    expect(refs).toMatch(/The institutional record \(document, register, legibility\)/);
    expect(refs).toMatch(/The rite it accompanies \(ritual, meal, grave, grief\)/);
  });
  it("names no keynote, soundmark, or clock member of its own", () => {
    const foreign = ["keynote", "soundmark", "clock", "silence"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("bell: compose()", () => {
  // A piece engine composes two links: the object, then what happens around it.
  it("composes every member beneath the anchor, object first", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1);
    expect(leaves).not.toContain(ANCHOR);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Piece: Bell");
      expect(out.includes("## Place")).toBe(true);
    }
  });
  it("gives a member a two-link chain: anchor, member", () => {
    expect(chains["process_the_ringing.md"]).toEqual([ANCHOR, "process_the_ringing.md"]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_tolling.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
