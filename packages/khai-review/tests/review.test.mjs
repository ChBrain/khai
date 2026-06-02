import { describe, it, expect } from "vitest";
import { review, reviewCard, rubrics, mockJudge } from "../index.mjs";

describe("review - harness over a pluggable judge", () => {
  it("returns the judge's verdict + suggestion as a finding (flag)", async () => {
    const f = await review("this is really just filler", rubrics.conciseness, mockJudge);
    expect(f.verdict).toBe("flag");
    expect(f.rubric).toBe("conciseness");
    expect(typeof f.suggestion).toBe("string");
  });

  it("passes lean prose: no flag, no suggestion", async () => {
    const f = await review(
      "the room reads the body before a word.",
      rubrics.conciseness,
      mockJudge,
    );
    expect(f.verdict).toBe("pass");
    expect(f.suggestion).toBeNull();
    expect(f.reason).toBeNull();
  });

  it("is judge-agnostic: the injected judge drives the verdict", async () => {
    const alwaysFlag = async () => ({ verdict: "flag", suggestion: "x", reason: "r" });
    const alwaysPass = async () => ({ verdict: "pass" });
    expect((await review("anything", rubrics.conciseness, alwaysFlag)).verdict).toBe("flag");
    expect((await review("anything", rubrics.conciseness, alwaysPass)).verdict).toBe("pass");
  });

  it("validates its inputs", async () => {
    await expect(review(123, rubrics.conciseness, mockJudge)).rejects.toThrow(/prose/);
    await expect(review("x", null, mockJudge)).rejects.toThrow(/rubric/);
    await expect(review("x", rubrics.conciseness, null)).rejects.toThrow(/judge/);
  });
});

describe("reviewCard - rubrics over a card's chapters", () => {
  const manifest = {
    card: {
      wire: "the anchor declares the read.",
      issue: "two expressions, really just male and female.",
      require: "carried under Projection.",
      enforce: "the engine owns its tests.",
      setup: "declare the law once.",
    },
  };

  it("flags only the chapters the judge flags, tagged by location", async () => {
    const flags = await reviewCard(manifest, mockJudge);
    expect(flags).toHaveLength(1);
    expect(flags[0].where).toBe("card.issue");
    expect(flags[0].verdict).toBe("flag");
    expect(flags[0].suggestion).toContain("male and female");
  });

  it("returns nothing for a clean card (advisory, never throws on content)", async () => {
    expect(await reviewCard({ card: { wire: "clean prose here." } }, mockJudge)).toEqual([]);
  });
});
