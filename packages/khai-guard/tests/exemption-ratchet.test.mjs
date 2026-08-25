import { describe, it, expect } from "vitest";
import * as guard from "../index.mjs";

// Dormant until the source PR exporting the ratchet's two directions lands.
// Source and tests are separate PRs (the source/test gate), so a test PR cut
// from a main without the functions must import cleanly and skip.
const DORMANT = typeof guard.touchedExemptions !== "function";

const engine = (name, files) => ({ engine: name, files });

// The flat array is the original shape; the map is what lets the gate name the
// replacement. Both must behave identically everywhere except that naming.
const arrayCfg = {
  memberPolicy: {
    engines: ["packages/engines/*/package.json"],
    homonyms: ["trust"],
    grandfathered: ["guilt"],
  },
};
const mapCfg = {
  memberPolicy: {
    engines: ["packages/engines/*/package.json"],
    homonyms: { trust: { proposed: "faith_trust" } },
    grandfathered: { guilt: {} },
  },
};
const catalogue = [
  engine("faith", ["position_faith.md", "position_trust.md"]),
  engine("trust", ["process_trust.md"]),
  engine("caregiving", ["process_guilt.md"]),
  engine("anger", ["process_anger.md"]),
];

describe.skipIf(DORMANT)("exemptionStems", () => {
  it("reads the flat array shape", () => {
    expect(guard.exemptionStems(arrayCfg.memberPolicy, "homonyms")).toEqual(["trust"]);
  });

  it("reads the map shape as its keys", () => {
    expect(guard.exemptionStems(mapCfg.memberPolicy, "homonyms")).toEqual(["trust"]);
  });

  it("an absent or non-collection key is empty, never a throw", () => {
    expect(guard.exemptionStems({}, "homonyms")).toEqual([]);
    expect(guard.exemptionStems({ homonyms: "trust" }, "homonyms")).toEqual([]);
    expect(guard.exemptionStems(undefined, "homonyms")).toEqual([]);
  });
});

describe.skipIf(DORMANT)("exemptionMeta", () => {
  it("returns the record under the map shape", () => {
    expect(guard.exemptionMeta(mapCfg.memberPolicy, "homonyms", "trust")).toEqual({
      proposed: "faith_trust",
    });
  });

  it("returns null under the array shape, and for an unknown stem", () => {
    expect(guard.exemptionMeta(arrayCfg.memberPolicy, "homonyms", "trust")).toBeNull();
    expect(guard.exemptionMeta(mapCfg.memberPolicy, "homonyms", "nope")).toBeNull();
  });
});

describe.skipIf(DORMANT)("touchedExemptions", () => {
  it("stays silent when the diff is nowhere near a package", () => {
    expect(guard.touchedExemptions(catalogue, ["docs/BRANCHING.md"], mapCfg)).toEqual([]);
    expect(guard.touchedExemptions(catalogue, [], mapCfg)).toEqual([]);
  });

  it("stays silent when the diff touches an engine that holds no entry", () => {
    expect(
      guard.touchedExemptions(catalogue, ["packages/engines/anger/process_anger.md"], mapCfg),
    ).toEqual([]);
  });

  it("fires for the engine the diff is standing in, naming the file", () => {
    const notes = guard.touchedExemptions(
      catalogue,
      ["packages/engines/faith/REFERENCES.md"],
      mapCfg,
    );
    expect(notes).toHaveLength(1);
    expect(notes[0]).toContain("faith/position_trust.md");
    expect(notes[0]).toContain('"trust"');
  });

  it("names the proposed stem under the map shape", () => {
    const [note] = guard.touchedExemptions(
      catalogue,
      ["packages/engines/faith/REFERENCES.md"],
      mapCfg,
    );
    expect(note).toContain('rename it to "faith_trust"');
  });

  it("still fires under the array shape, without a name to offer", () => {
    const [note] = guard.touchedExemptions(
      catalogue,
      ["packages/engines/faith/REFERENCES.md"],
      arrayCfg,
    );
    expect(note).toContain("distinct stem");
    expect(note).not.toContain("rename it to");
  });

  it("covers grandfathered as well as homonyms", () => {
    const notes = guard.touchedExemptions(
      catalogue,
      ["packages/engines/caregiving/process_guilt.md"],
      mapCfg,
    );
    expect(notes).toHaveLength(1);
    expect(notes[0]).toContain("memberPolicy.grandfathered");
  });

  it("reads composite paths too, since composites carry members as well", () => {
    const withComposite = [...catalogue, engine("assent", ["process_trust.md"])];
    const notes = guard.touchedExemptions(
      withComposite,
      ["packages/composites/assent/process_trust.md"],
      mapCfg,
    );
    expect(notes.some((n) => n.includes("assent/process_trust.md"))).toBe(true);
  });

  it("says the rename is breaking and may change lane, because it always is", () => {
    const [note] = guard.touchedExemptions(
      catalogue,
      ["packages/engines/faith/REFERENCES.md"],
      mapCfg,
    );
    expect(note).toContain("bump:minor");
    expect(note).toContain("rename/<name>/<topic>");
  });

  it("no policy configured = nothing to offer", () => {
    expect(guard.touchedExemptions(catalogue, ["packages/engines/faith/x.md"], {})).toEqual([]);
  });
});

describe.skipIf(DORMANT)("homonymGrowth", () => {
  const base = { memberPolicy: { homonyms: ["a", "b"], grandfathered: ["g"] } };

  it("lets the list shrink, which is the whole point of a ratchet", () => {
    const head = { memberPolicy: { homonyms: ["a"], grandfathered: [] } };
    expect(guard.homonymGrowth(base, head)).toEqual({ ok: true, errors: [] });
  });

  it("passes an unchanged list", () => {
    expect(guard.homonymGrowth(base, base).ok).toBe(true);
  });

  it("refuses a bare addition, naming the stem and the rule", () => {
    const head = { memberPolicy: { homonyms: ["a", "b", "c"], grandfathered: ["g"] } };
    const r = guard.homonymGrowth(base, head);
    expect(r.ok).toBe(false);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]).toContain('"c"');
    expect(r.errors[0]).toContain("rule 7");
    expect(r.errors[0]).toContain("granted");
  });

  it("allows an addition that records its grant", () => {
    const head = {
      memberPolicy: {
        homonyms: { a: {}, b: {}, c: { granted: "maintainer, two sciences, neither renameable" } },
        grandfathered: ["g"],
      },
    };
    expect(guard.homonymGrowth(base, head)).toEqual({ ok: true, errors: [] });
  });

  it("watches grandfathered on the same terms", () => {
    const head = { memberPolicy: { homonyms: ["a", "b"], grandfathered: ["g", "h"] } };
    const r = guard.homonymGrowth(base, head);
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain("memberPolicy.grandfathered");
  });

  it("an empty baseline makes every entry look new — the caller owns that", () => {
    // Deliberate: the function compares honestly and does not guess. The CLI
    // hands it the HEAD config when no merge-base resolves (first push, shallow
    // clone), so the comparison is a no-op there rather than a wall of errors.
    expect(guard.homonymGrowth({}, base).ok).toBe(false);
    expect(guard.homonymGrowth(base, base).ok).toBe(true);
  });
});
