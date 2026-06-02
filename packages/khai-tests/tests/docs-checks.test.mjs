import { describe, it, expect } from "vitest";
import { rules } from "../index.mjs";

const { checkLinkText, looseFiles } = rules;

describe("checkLinkText - link text must be a natural name, never a filename", () => {
  it("passes natural link text", () => {
    expect(checkLinkText("A [gender](position_gender.md) read.")).toEqual([]);
  });

  it("flags a filename as link text (the LLM reads it literally)", () => {
    const errs = checkLinkText("See [position_gender.md](position_gender.md).");
    expect(errs).toHaveLength(1);
    expect(errs[0]).toMatch(/is a filename/);
  });

  it("flags empty link text", () => {
    expect(checkLinkText("Here [](position_gender.md).")[0]).toMatch(/empty link text/);
  });

  it("flags a .json filename and a label equal to the target basename", () => {
    expect(checkLinkText("[package.json](package.json)")[0]).toMatch(/is a filename/);
    expect(checkLinkText("[REFERENCES.md](dir/REFERENCES.md)")[0]).toMatch(/is a filename/);
  });

  it("exempts external links", () => {
    expect(checkLinkText("[https://example.com](https://example.com)")).toEqual([]);
  });
});

describe("looseFiles - no file hangs loose (the Obsidian graph)", () => {
  const connected = [
    { name: "README.md", text: "[gender](position_gender.md) and [sources](REFERENCES.md)" },
    { name: "position_gender.md", text: "the anchor" },
    { name: "REFERENCES.md", text: "maps [gender](position_gender.md)" },
  ];

  it("returns nothing when every file is linked into one graph", () => {
    expect(looseFiles(connected)).toEqual([]);
  });

  it("returns a file that links to nothing and that nothing links to", () => {
    const withOrphan = [...connected, { name: "ORPHAN.md", text: "alone, no links" }];
    expect(looseFiles(withOrphan)).toEqual(["ORPHAN.md"]);
  });

  it("does not count backtick mentions as edges (why REFERENCES must link)", () => {
    const backticked = [
      { name: "README.md", text: "[gender](position_gender.md)" },
      { name: "position_gender.md", text: "the anchor" },
      { name: "REFERENCES.md", text: "maps `position_gender.md` in backticks, not a link" },
    ];
    expect(looseFiles(backticked)).toEqual(["REFERENCES.md"]);
  });
});
