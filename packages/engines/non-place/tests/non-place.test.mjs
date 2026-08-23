// The non-place engine tests only what is non-place-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, the place-engine shape, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, anchor, expressions } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ANCHOR = "place_non_place.md";

describe("non-place: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("non-place: manifest", () => {
  it("declares the non-place place engine", () => {
    expect(manifest.engine).toBe("non-place");
    expect(manifest.type).toBe("place");
    expect(manifest.anchor).toBe(ANCHOR);
    expect(Object.keys(manifest.expressions).sort()).toEqual(["contract", "solitude", "transit"]);
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

describe("non-place: the twist lives in the anchor's Withheld", () => {
  // What the place withholds is any further claim on the persona, which is the
  // rest and the emptiness in one feature.
  it("names the verification discarded after the boundary", () => {
    const withheld = flat(ANCHOR).split("## Withheld")[1];
    expect(withheld).toMatch(
      /A non-place checks who you are in order to have no further use for it/i,
    );
    expect(withheld).toMatch(/The identity is verified precisely once, at the boundary/i);
  });
  it("gives the rest and the emptiness the same feature", () => {
    const withheld = flat(ANCHOR).split("## Withheld")[1];
    expect(withheld).toMatch(/being nobody in particular is a holiday from every determination/i);
    expect(withheld).toMatch(/will not have registered that they were ever in it/i);
  });
});

describe("non-place: the anchor is legible to a stranger and to nobody else", () => {
  it("puts the design brief in what is shown", () => {
    expect(flat(ANCHOR)).toMatch(
      /legibility to a stranger, which is the design brief and is achieved completely/i,
    );
  });
  it("holds nothing on behalf of a returning visitor", () => {
    expect(flat(ANCHOR)).toMatch(/because it has no concept of one/i);
  });
  it("offers the absence of obligation as the thing that matters", () => {
    expect(flat(ANCHOR)).toMatch(
      /the only public space in ordinary life where they are not somebody's neighbour/i,
    );
  });
});

describe("non-place: the three expressions", () => {
  it("makes transit a route that cannot be arrived at", () => {
    const t = flat("place_transit.md");
    expect(t).toMatch(/Any reason to be here other than not being here/i);
    expect(t).toMatch(/they are legitimately unoccupied/i);
  });
  it("makes the contract an entitlement without acquaintance", () => {
    const c = flat("place_contract.md");
    expect(c).toMatch(/Entitlement without acquaintance/i);
    expect(c).toMatch(/the relation was never with a person/i);
  });
  it("makes solitude a relief before it is an absence", () => {
    const s = flat("place_solitude.md");
    expect(s).toMatch(/Relief from being known/i);
    expect(s).toMatch(/there is nobody present for whom they are anybody/i);
  });
});

describe("non-place: nobody designed it to alienate", () => {
  it("keeps the indifference a consequence rather than an intention", () => {
    expect(flat(ANCHOR)).toMatch(/the indifference is a consequence rather than an intention/i);
    expect(flat("REFERENCES.md")).toMatch(
      /Nobody built it to alienate\. Every feature solves a real problem\./,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do make the design good/);
  });
});

describe("non-place: what the engine refuses to over-claim", () => {
  // A theoretical concept with a serious objection standing against it, and the
  // objection is kept rather than dropped.
  it("marks the source as an essay rather than a study", () => {
    expect(flat("REFERENCES.md")).toMatch(/Augé is an essay in anthropology, not a study/i);
  });
  it("keeps the strongest criticism and concedes it is probably right", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /The strongest criticism is that the category describes an intention rather than an experience, and it is probably right/i,
    );
    expect(refs).toMatch(/the users routinely defeat/i);
  });
  it("flags where the engine departs from its own source", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/This engine departs from its own source on the central valuation/i);
    expect(refs).toMatch(/a reader should not attribute it to him/i);
  });
  it("admits the similitude claim has weakened since 1992", () => {
    expect(flat("REFERENCES.md")).toMatch(/The similitude claim has weakened since 1992/i);
  });
  it("refuses the reading that these spaces are bad", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /these spaces are bad, that their designers are careless, or that a persona who likes them is missing something/i,
    );
  });
});

describe("non-place: the boundary with third-place and total-institution", () => {
  it("names third-place as its opposite number in both directions", () => {
    expect(flat(ANCHOR)).toMatch(
      /not the informal gathering place with regulars and standing, which is third-place's/i,
    );
    expect(flat("REFERENCES.md")).toMatch(/this engine is that engine's opposite number/i);
  });
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /The gathering place with regulars \(third-place, dwelling, hospitality\)/,
    );
    expect(refs).toMatch(/The threshold state \(liminality, rite, role-exit\)/);
    expect(refs).toMatch(/The enclosing institution \(total-institution, discipline, subjection\)/);
    expect(refs).toMatch(/one place demands\s*everything and the other demands nothing/i);
  });
  it("names no regular, threshold, or restoration expression of its own", () => {
    const files = [manifest.anchor, ...Object.values(manifest.expressions)];
    for (const f of ["regular", "threshold", "restor", "attach"]) {
      expect(files.some((x) => x.includes(f))).toBe(false);
    }
  });
});

describe("non-place: compose()", () => {
  for (const name of Object.keys(expressions)) {
    it(`composes ${name}: anchor first, then the expression`, () => {
      const out = compose({ expression: name });
      expect(out.startsWith(anchor)).toBe(true);
      expect(out).toContain(expressions[name]);
      expect(out.indexOf(anchor)).toBeLessThan(out.indexOf(expressions[name]));
    });
  }
  it("rejects an unknown expression", () => {
    expect(() => compose({ expression: "departure-lounge" })).toThrow();
  });
  it("rejects a missing expression", () => {
    expect(() => compose({})).toThrow();
  });
});
