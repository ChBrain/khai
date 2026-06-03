import { describe, it, expect } from "vitest";
import { parseChangeset, bumpScope } from "../index.mjs";

describe("parseChangeset", () => {
  it("parses quoted `package: level` lines from the frontmatter", () => {
    const text = `---\n"@scope/a": minor\n"@scope/b": patch\n---\n\nSummary.\n`;
    expect(parseChangeset(text)).toEqual([
      { package: "@scope/a", level: "minor" },
      { package: "@scope/b", level: "patch" },
    ]);
  });

  it("lowercases the level and ignores the body (a `key: value` in prose is not a bump)", () => {
    const text = `---\n"@scope/a": MAJOR\n---\n\n# Heading\nnote: this is prose, not a bump\n`;
    expect(parseChangeset(text)).toEqual([{ package: "@scope/a", level: "major" }]);
  });

  it("returns [] for an empty changeset or one with no frontmatter", () => {
    expect(parseChangeset(`---\n---\n\nempty\n`)).toEqual([]);
    expect(parseChangeset(`no frontmatter at all`)).toEqual([]);
  });
});

describe("bumpScope", () => {
  const one = (entries) => [{ file: ".changeset/x.md", entries }];

  it("is ok when every entry is patch (the default free level)", () => {
    const r = bumpScope(one([{ package: "a", level: "patch" }]));
    expect(r.ok).toBe(true);
    expect(r.escalations).toEqual([]);
    expect(r.highest).toBe(null);
  });

  it("flags a minor and names the escalation (file + package + level)", () => {
    const r = bumpScope(one([{ package: "a", level: "minor" }]));
    expect(r.ok).toBe(false);
    expect(r.highest).toBe("minor");
    expect(r.escalations).toEqual([{ file: ".changeset/x.md", package: "a", level: "minor" }]);
  });

  it("reports major as the highest when both minor and major are present", () => {
    const r = bumpScope([
      { file: ".changeset/a.md", entries: [{ package: "a", level: "minor" }] },
      { file: ".changeset/b.md", entries: [{ package: "b", level: "major" }] },
    ]);
    expect(r.highest).toBe("major");
    expect(r.escalations).toHaveLength(2);
  });

  it("respects a custom freeLevel: with minor free, only major escalates", () => {
    const config = { bumpScope: { freeLevel: "minor" } };
    const r = bumpScope(
      one([
        { package: "a", level: "minor" },
        { package: "b", level: "major" },
      ]),
      config,
    );
    expect(r.escalations).toEqual([{ file: ".changeset/x.md", package: "b", level: "major" }]);
    expect(r.highest).toBe("major");
  });

  it("is ok for no changesets at all", () => {
    expect(bumpScope([]).ok).toBe(true);
  });
});
