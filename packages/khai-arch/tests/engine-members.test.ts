import { describe, it, expect } from "vitest";
// @ts-expect-error -- the canon export is plain ESM (no .d.ts); vitest runs it directly.
import { engineMembers, compositionOrder, engineCard } from "../index.mjs";

// gender's shape: the legacy { type, anchor, expressions } shorthand.
const shorthand = {
  engine: "gender",
  type: "position",
  anchor: "position_gender.md",
  expressions: { male: "position_male.md", female: "position_female.md" },
};

// a multi-type ladder: a process root, one channel, one width leaf, plus a
// sibling position member -- the language-like shape, depth 3.
const ladder = {
  engine: "language",
  members: [
    { file: "process_using_language.md", type: "process" },
    { file: "process_speaking.md", type: "process", parent: "process_using_language.md" },
    { file: "process_speaking_worn.md", type: "process", parent: "process_speaking.md" },
    { file: "position_business_english.md", type: "position", parent: "process_using_language.md" },
  ],
};

describe("engineMembers - normalize to a typed composition tree", () => {
  it("desugars the { anchor, expressions } shorthand to root + children", () => {
    expect(engineMembers(shorthand)).toEqual([
      { file: "position_gender.md", type: "position", parent: null },
      { file: "position_male.md", type: "position", parent: "position_gender.md" },
      { file: "position_female.md", type: "position", parent: "position_gender.md" },
    ]);
  });

  it("accepts an explicit, multi-type members list", () => {
    const m = engineMembers(ladder);
    expect(m).toHaveLength(4);
    expect(m.find((x: { file: string }) => x.file === "position_business_english.md")?.type).toBe(
      "position",
    );
    expect(m.find((x: { file: string }) => x.file === "process_speaking_worn.md")?.parent).toBe(
      "process_speaking.md",
    );
  });

  it("throws on an unknown member type", () => {
    expect(() =>
      engineMembers({ engine: "x", members: [{ file: "a.md", type: "bogus" }] }),
    ).toThrow(/unknown type/);
  });

  it("throws on a dangling parent", () => {
    expect(() =>
      engineMembers({
        engine: "x",
        members: [
          { file: "a.md", type: "position" },
          { file: "b.md", type: "position", parent: "missing.md" },
        ],
      }),
    ).toThrow(/not a member/);
  });

  it("throws unless there is exactly one root", () => {
    expect(() =>
      engineMembers({
        engine: "x",
        members: [
          { file: "a.md", type: "position" },
          { file: "b.md", type: "position" },
        ],
      }),
    ).toThrow(/exactly one root/);
  });

  it("throws on a duplicate member file", () => {
    expect(() =>
      engineMembers({
        engine: "x",
        members: [
          { file: "a.md", type: "position" },
          { file: "a.md", type: "position", parent: "a.md" },
        ],
      }),
    ).toThrow(/duplicate member/);
  });
});

describe("compositionOrder - carry the anchor upward", () => {
  it("yields [anchor, expression] for a depth-1 engine", () => {
    expect(compositionOrder(shorthand)).toEqual({
      "position_male.md": ["position_gender.md", "position_male.md"],
      "position_female.md": ["position_gender.md", "position_female.md"],
    });
  });

  it("yields [root, channel, width] chains for a ladder, leaves only", () => {
    const order = compositionOrder(ladder);
    expect(order["process_speaking_worn.md"]).toEqual([
      "process_using_language.md",
      "process_speaking.md",
      "process_speaking_worn.md",
    ]);
    expect(order["position_business_english.md"]).toEqual([
      "process_using_language.md",
      "position_business_english.md",
    ]);
    // intermediate nodes (root, channel) are not leaves -> not emitted
    expect(order["process_speaking.md"]).toBeUndefined();
    expect(order["process_using_language.md"]).toBeUndefined();
  });
});

describe("engineCard - type/anchor from the root member", () => {
  const card = { wire: "w", issue: "i", require: "r", enforce: "e", setup: "s" };

  it("derives type/anchor from the root when not given explicitly", () => {
    const c = engineCard({ ...ladder, card });
    expect(c.type).toBe("process");
    expect(c.anchor).toBe("process_using_language.md");
  });

  it("explicit type/anchor still win (legacy shorthand)", () => {
    const c = engineCard({ ...shorthand, card });
    expect(c.type).toBe("position");
    expect(c.anchor).toBe("position_gender.md");
  });
});
