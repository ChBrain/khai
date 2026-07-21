// The robustness wrapper: a finding is confirmed only on a K-of-N consensus, an
// optional skeptic (refute-by-default) can veto it, and a factual (anchored)
// rubric must be handed a retrieved source or it cannot confirm. The judge is
// injected, so these run with deterministic stubs and no model.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { reviewRobust, skepticRubric } from "../index.mjs";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "index.mjs");
const DORMANT = !readFileSync(SRC, "utf8").includes("reviewRobust");

const R = { id: "r", instruction: "the criterion" };
const flag = { verdict: "flag", suggestion: "tighter", reason: "why" };
const pass = { verdict: "pass" };

const always = (v) => async () => v;
// A judge that answers one way on the base rubric and another as the skeptic
// (the skeptic rubric id ends with ":skeptic").
const split =
  (base, skeptic) =>
  async ({ rubric }) =>
    rubric.id.endsWith(":skeptic") ? skeptic : base;

describe.skipIf(DORMANT)("reviewRobust: consensus", () => {
  it("confirms on K of N flags", async () => {
    const out = await reviewRobust("p", R, always(flag), { n: 3, k: 2 });
    expect(out.confirmed).toBe(true);
    expect(out.verdict).toBe("flag");
    expect(out.votes).toBe(3);
    expect(out.suggestion).toBe("tighter");
  });

  it("does not confirm below the threshold", async () => {
    const out = await reviewRobust("p", R, always(pass), { n: 3, k: 2 });
    expect(out.confirmed).toBe(false);
    expect(out.verdict).toBe("pass");
    expect(out.votes).toBe(0);
    expect(out.suggestion).toBeNull();
  });

  it("counts a split vote against the threshold", async () => {
    // two flags, one pass, across three calls
    let i = 0;
    const judge = async () => (i++ < 2 ? flag : pass);
    expect((await reviewRobust("p", R, judge, { n: 3, k: 2 })).confirmed).toBe(true);
    i = 0;
    expect((await reviewRobust("p", R, judge, { n: 3, k: 3 })).confirmed).toBe(false);
  });
});

describe.skipIf(DORMANT)("reviewRobust: skeptic veto", () => {
  it("drops a confirmed finding the skeptic refutes (skeptic flag = refuted)", async () => {
    const out = await reviewRobust("p", R, always(flag), { n: 1, k: 1, skeptic: true });
    expect(out.confirmed).toBe(false);
  });

  it("keeps a finding the skeptic cannot refute (skeptic pass)", async () => {
    const out = await reviewRobust("p", R, split(flag, pass), { n: 1, k: 1, skeptic: true });
    expect(out.confirmed).toBe(true);
  });

  it("never runs the skeptic when consensus already fails", async () => {
    let skepticCalls = 0;
    const judge = async ({ rubric }) => {
      if (rubric.id.endsWith(":skeptic")) skepticCalls++;
      return pass;
    };
    await reviewRobust("p", R, judge, { n: 3, k: 2, skeptic: true });
    expect(skepticCalls).toBe(0);
  });
});

describe.skipIf(DORMANT)("reviewRobust: source anchoring", () => {
  const AR = { id: "cite", instruction: "match the source", anchored: true };

  it("cannot confirm a factual rubric with no source", async () => {
    const out = await reviewRobust("p", AR, always(flag), { n: 3, k: 1 });
    expect(out.confirmed).toBe(false);
    expect(out.reason).toMatch(/unanchored/);
  });

  it("confirms a factual rubric once a source is supplied", async () => {
    const out = await reviewRobust("p", AR, always(flag), { n: 3, k: 2, source: "the source" });
    expect(out.confirmed).toBe(true);
  });

  it("puts the retrieved source in front of the passage for the judge", async () => {
    let seen = "";
    const judge = async ({ prose }) => {
      seen = prose;
      return pass;
    };
    await reviewRobust("the passage", AR, judge, { n: 1, k: 1, source: "SRC-TEXT" });
    expect(seen).toContain("SRC-TEXT");
    expect(seen).toContain("the passage");
  });
});

describe.skipIf(DORMANT)("reviewRobust: guards", () => {
  it("rejects k greater than n", async () => {
    await expect(reviewRobust("p", R, always(flag), { n: 2, k: 3 })).rejects.toThrow(/k/);
  });

  it("rejects a non-positive n", async () => {
    await expect(reviewRobust("p", R, always(flag), { n: 0, k: 1 })).rejects.toThrow(/n/);
  });

  it("rejects a missing judge", async () => {
    await expect(reviewRobust("p", R, null, { n: 1, k: 1 })).rejects.toThrow(/judge/);
  });
});

describe.skipIf(DORMANT)("skepticRubric", () => {
  it("derives a :skeptic id, carries anchored, and embeds the base criterion", () => {
    const s = skepticRubric({ id: "cite", instruction: "match the source", anchored: true });
    expect(s.id).toBe("cite:skeptic");
    expect(s.anchored).toBe(true);
    expect(s.instruction).toContain("match the source");
    expect(s.instruction).toMatch(/refut/i);
  });
});
