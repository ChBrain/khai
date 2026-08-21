// The photograph engine tests only what is photograph-specific: that the package
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

const ANCHOR = "piece_photograph.md";
const PROCESSES = ["process_the_taking.md", "process_the_showing.md", "process_the_outliving.md"];

describe("photograph: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("photograph: manifest", () => {
  it("declares a piece engine anchored on the image itself", () => {
    expect(manifest.engine).toBe("photograph");
    expect(manifest.type).toBe("piece");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ANCHOR);
    expect(roots[0].type).toBe("piece");
  });
  it("hangs one subject and three fates flat beneath the anchor", () => {
    // A piece engine is not a movement tree: the object is the anchor and the
    // members are what happens around it, each a direct child.
    const children = manifest.members.filter((m) => m.parent === ANCHOR);
    expect(children.map((m) => m.file).sort()).toEqual(
      ["position_pictured.md", ...PROCESSES].sort(),
    );
    expect(children.filter((m) => m.type === "position").map((m) => m.file)).toEqual([
      "position_pictured.md",
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

describe("photograph: the twist lives at the anchor", () => {
  // For a piece engine the anchor's Yearbook carries the arc and the failure, so
  // the keystone sits there. The taking carries it downward.
  it("the anchor's Yearbook names the substitution", () => {
    const y = flat(ANCHOR).split("## Yearbook")[1];
    expect(y).toMatch(
      /A photograph is taken to keep a moment and is the reason the moment is not kept/i,
    );
    expect(y).toMatch(/it is the only version left/i);
  });
  it("the taking carries the same keystone", () => {
    expect(flat("process_the_taking.md")).toMatch(
      /a photograph is taken to keep a moment and is the reason the moment is not kept/i,
    );
  });
  it("names the three failures at the anchor", () => {
    expect(flat(ANCHOR)).toMatch(
      /fails by being uncaptioned, by being unviewed, and by outliving everybody who could say who is in it/i,
    );
  });
});

describe("photograph: it certifies and cannot explain", () => {
  // Barthes' that-has-been is the engine's load-bearing claim: the image proves
  // presence and carries no account of itself, so the holder supplies one.
  it("keeps the certification separate from the description", () => {
    const a = flat(ANCHOR);
    expect(a).toMatch(/not evidence of what a moment was like; it is evidence that it was/i);
    expect(a).toMatch(/it says that this happened and cannot say what it was/i);
  });
  it("puts the caption in the holder's hands", () => {
    const s = flat("process_the_showing.md");
    expect(s).toMatch(/the same image serves a celebration and an accusation/i);
    expect(s).toMatch(
      /borrows the photograph's certainty for a statement the photograph did not make/i,
    );
  });
  it("ends with the certification outliving the account", () => {
    expect(flat("process_the_outliving.md")).toMatch(
      /The Outliving keeps the face and loses the name/i,
    );
  });
});

describe("photograph: the pictured do not hold their likeness", () => {
  it("forecloses recall, caption, and private ageing", () => {
    const loses = flat("position_pictured.md").split("## Loses")[1];
    expect(loses).toMatch(/forecloses control of the likeness/i);
    expect(loses).toMatch(/cannot recall the image/i);
    expect(loses).toMatch(/forecloses ageing privately/i);
  });
  it("puts the burden on whoever objects rather than on whoever takes", () => {
    expect(flat("position_pictured.md")).toMatch(
      /the burden of the exchange falls on whoever wants it not to happen/i,
    );
  });
});

describe("photograph: the cost is the delegating, not the camera", () => {
  // The literature's actual finding, not its headline: offloading impairs and
  // attentive photographing does not, so the member is written to the mechanism.
  it("writes the taking as offloading rather than distraction", () => {
    const t = flat("process_the_taking.md");
    expect(t).toMatch(/This is offloading rather than distraction/i);
    expect(t).toMatch(/the cost is not in the camera but in the delegating/i);
  });
  it("keeps the impulse to photograph a good one", () => {
    expect(flat("process_the_taking.md")).toMatch(
      /the photograph is genuinely worth having and the impulse is right/i,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do keep the taker ordinary/);
    expect(flat("playwright_instructions.md")).toMatch(/Do not claim the camera damages memory/);
  });
});

describe("photograph: what the engine refuses to over-claim", () => {
  // Two celebrated essays and one small experimental literature, with the
  // counter-finding kept and the popular version of it corrected.
  it("marks Barthes and Sontag as readings rather than findings", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Barthes and Sontag are readings, not findings/i);
    expect(refs).toMatch(/declining the rest, including Sontag's stronger line/i);
  });
  it("keeps the counter-finding and corrects the popular version", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/qualified in the opposite direction, and the engine states both/i);
    expect(refs).toMatch(/is not what the literature says/i);
    expect(refs).toMatch(/written to the mechanism and not to the headline/i);
  });
  it("names the digital shift as the engine's largest unknown", () => {
    expect(flat("REFERENCES.md")).toMatch(/The digital shift is the engine's largest unknown/i);
  });
  it("marks Bourdieu's particulars as dated", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /the structural claim about group affirmation travels, and the specific findings do not/i,
    );
  });
});

describe("photograph: the boundary with the self, the file, and memory", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The possession that is part of the self \(extended-self\)/);
    expect(refs).toMatch(/How memory works \(memory, the-unconscious\)/);
    expect(refs).toMatch(/The record an institution keeps \(document, legibility, measure\)/);
    expect(refs).toMatch(/The series and its gap \(collection\)/);
  });
  it("states the boundary inside the anchor as well as the references", () => {
    expect(flat(ANCHOR)).toMatch(
      /not the possession into which an identity has extended, which is extended-self's/i,
    );
  });
  it("names no heirloom, album, or memory member of its own", () => {
    const foreign = ["heirloom", "album", "memory", "nostalgia", "document"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("photograph: compose()", () => {
  // chains is keyed by true leaf only. In a flat piece engine every member but
  // the anchor is a leaf, so each composes as a two-link chain.
  it("composes every member below the anchor, anchor first", () => {
    const leaves = Object.keys(chains);
    expect(leaves.sort()).toEqual(["position_pictured.md", ...PROCESSES].sort());
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Piece: Photograph");
      expect(out.includes("## Load Bearing")).toBe(true);
    }
  });
  it("gives a member a two-link chain: anchor, member", () => {
    expect(chains["process_the_taking.md"]).toEqual([ANCHOR, "process_the_taking.md"]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_developing.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
