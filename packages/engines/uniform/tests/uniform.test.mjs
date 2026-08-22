// The uniform engine tests only what is uniform-specific: that the package
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

const ANCHOR = "piece_uniform.md";
const PROCESSES = ["process_the_issuing.md", "process_the_wearing.md", "process_the_taking_off.md"];

describe("uniform: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("uniform: manifest", () => {
  it("declares a piece engine anchored on the garment itself", () => {
    expect(manifest.engine).toBe("uniform");
    expect(manifest.type).toBe("piece");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ANCHOR);
    expect(roots[0].type).toBe("piece");
  });
  it("hangs one wearer and three fates flat beneath the anchor", () => {
    // A piece engine is not a movement tree: the object is the anchor and the
    // members are what happens around it, each a direct child.
    const children = manifest.members.filter((m) => m.parent === ANCHOR);
    expect(children.map((m) => m.file).sort()).toEqual(
      ["position_the_wearer.md", ...PROCESSES].sort(),
    );
    expect(children.filter((m) => m.type === "position").map((m) => m.file)).toEqual([
      "position_the_wearer.md",
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

describe("uniform: the twist lives in the anchor's Yearbook", () => {
  // Both directions run on one substitution, which is a property of the object
  // rather than of any of the three processes.
  it("names the licence and the constraint as one movement", () => {
    const yearbook = flat(ANCHOR).split("## Yearbook")[1];
    expect(yearbook).toMatch(
      /A uniform lets its wearer do what they could not and stops them doing what they could/i,
    );
    expect(yearbook).toMatch(/they arrive together in one bag/i);
  });
  it("grounds both directions in the substitution of an office for a person", () => {
    expect(flat(ANCHOR)).toMatch(/the garment substitutes an office for a person/i);
  });
});

describe("uniform: the object is issued, not owned", () => {
  it("keeps it a loan for the duration of the post", () => {
    expect(flat(ANCHOR)).toMatch(/It is almost never owned/i);
    expect(flat("process_the_issuing.md")).toMatch(
      /The Issuing dresses the persona in something that is not theirs/i,
    );
  });
  it("states what it holds up before what it costs", () => {
    const a = flat(ANCHOR);
    expect(a).toMatch(/What it holds up is that this one may act/i);
    expect(a).toMatch(/nobody asks any of them for a reason/i);
  });
  it("separates what is read from what actually shows", () => {
    expect(flat(ANCHOR)).toMatch(
      /somebody has been vouched for by an institution and is currently answerable to it/i,
    );
  });
});

describe("uniform: the wearer is protected and published by one thing", () => {
  it("gives the position an authority nobody granted personally", () => {
    expect(flat("position_the_wearer.md")).toMatch(/An authority nobody granted them personally/i);
  });
  it("puts praise and blame on the office rather than the person", () => {
    expect(flat("position_the_wearer.md")).toMatch(
      /a rudeness is the service being rude, a kindness is the service being kind/i,
    );
  });
  it("closes the position on the same-thing formulation", () => {
    expect(flat("position_the_wearer.md")).toMatch(
      /The Wearer is protected by the same thing that publishes them/i,
    );
  });
});

describe("uniform: the three fates", () => {
  it("closes the ordinary channel for saying something about yourself", () => {
    expect(flat("process_the_issuing.md")).toMatch(
      /the ordinary channel through which people say something about themselves is closed/i,
    );
  });
  it("supplies an authority and withdraws a person", () => {
    const w = flat("process_the_wearing.md");
    expect(w).toMatch(/The Wearing supplies an authority and withdraws a person/i);
    expect(w).toMatch(/the member of the public needs a function, not an acquaintance/i);
  });
  it("keeps the standard running after the garment stops", () => {
    const t = flat("process_the_taking_off.md");
    expect(t).toMatch(/The Taking Off removes the garment and none of the standard/i);
    expect(t).toMatch(/an admission that the office does not switch off when the clothing does/i);
  });
});

describe("uniform: nobody has to be abusing anything", () => {
  it("keeps the licence useful and the standard one wearers hold anyway", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The wearer wanted the office\. The licence is what makes the work possible\./,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do let the licence work first/);
  });
});

describe("uniform: what the engine refuses to over-claim", () => {
  // A sociological spine with no measurement under it, and one famous study
  // declined on purpose rather than quietly omitted.
  it("marks the spine as an essay rather than a study", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Joseph and Alex is an essay, not a study/i);
    expect(refs).toMatch(/persuades by showing rather than by testing/i);
  });
  it("declines the Stanford prison study explicitly and says why", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The engine declines the most famous evidence in this area on purpose/i);
    expect(refs).toMatch(/its evidentiary status has collapsed/i);
    expect(refs).toMatch(/treat its absence as deliberate/i);
  });
  it("makes no deindividuation claim and hands the area back", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /belongs to \*\*crowd\*\* and \*\*conformity\*\* rather than here|deindividuation literature is genuinely contested/i,
    );
    expect(flat("REFERENCES.md")).toMatch(
      /The engine deliberately makes no deindividuation claim/i,
    );
  });
  it("admits the common core is thinner than any single case", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The engine flattens enormous variation/i);
    expect(refs).toMatch(/thinner than any one of those cases/i);
  });
  it("refuses the reading that uniforms are instruments of control", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /uniforms are instruments of control, that wearers are diminished by them/i,
    );
  });
});

describe("uniform: the boundary with total-institution and presentation", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /The stripping at the door \(total-institution, socialization, liminality\)/,
    );
    expect(refs).toMatch(/The managed front \(presentation, face, backstage, self-monitoring\)/);
    expect(refs).toMatch(
      /The object carrying an identity \(extended-self, heirloom, totem, investiture\)/,
    );
    expect(refs).toMatch(/The insider's speech \(register, membership, social-identity\)/);
  });
  it("names the mortification boundary from inside the anchor", () => {
    expect(flat(ANCHOR)).toMatch(
      /not the stripping of a self at the door of a closed institution, which is total-institution's/i,
    );
  });
  it("names no front, badge, or mortification member of its own", () => {
    const foreign = ["front", "badge", "mortif", "stigma", "rank"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("uniform: compose()", () => {
  // A piece engine composes two links: the object, then what happens around it.
  it("composes every member beneath the anchor, object first", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1);
    expect(leaves).not.toContain(ANCHOR);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Piece: Uniform");
      expect(out.includes("## Place")).toBe(true);
    }
  });
  it("gives a member a two-link chain: anchor, member", () => {
    expect(chains["process_the_wearing.md"]).toEqual([ANCHOR, "process_the_wearing.md"]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_insignia.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
