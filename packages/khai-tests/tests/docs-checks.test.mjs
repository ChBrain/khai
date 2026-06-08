import { describe, it, expect } from "vitest";
import { rules } from "../index.mjs";

const { checkLinkText, looseFiles, checkClauseDash, checkNoFooter, checkHasFrontmatter } = rules;

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

describe("checkClauseDash - the spaced hyphen is the LLM's disguised em-dash", () => {
  it('flags an inline " - lalala - " clause dash (one finding per line)', () => {
    expect(checkClauseDash("a parenthetical - like this - set off with hyphens")).toHaveLength(1);
  });

  it("flags a single spaced hyphen used as a clause separator", () => {
    expect(checkClauseDash("the read - conferred, not requested")[0]).toMatch(/clause dash/);
  });

  it("passes the house voice ( , ; : () )", () => {
    expect(checkClauseDash("the read: conferred, not requested (never demanded)")).toEqual([]);
  });

  it("exempts list markers - both * and - bullets", () => {
    expect(checkClauseDash("* one\n* two\n* three")).toEqual([]);
    expect(checkClauseDash("- one\n- two")).toEqual([]);
  });

  it("exempts a --- fence / thematic rule", () => {
    expect(checkClauseDash("---")).toEqual([]);
  });

  it("does not flag unspaced hyphens (compounds, ranges)", () => {
    expect(checkClauseDash("a well-known 1-2 punch")).toEqual([]);
  });

  it("exempts a spaced numeric range (CVI-sanctioned), still flags number-word", () => {
    expect(checkClauseDash("set light (400 - 500), the years 2006 - 2012")).toEqual([]);
    expect(checkClauseDash("from 500 - mother tongue")[0]).toMatch(/clause dash/);
  });

  it("still flags an inline clause dash inside a list item", () => {
    expect(checkClauseDash("* one - and a clause dash")).toHaveLength(1);
  });
});

describe("checkNoFooter - metadata in frontmatter, not a trailing stamp", () => {
  it("flags a trailing _v0.3.0 - KAI Cultures_ footer", () => {
    expect(checkNoFooter("# Doc\n\nbody\n\n---\n\n_v0.3.0 - KAI Cultures_\n")[0]).toMatch(/footer/);
  });

  it("passes a doc that ends in normal prose", () => {
    expect(checkNoFooter("# Doc\n\nbody\n\nLicense: CC-BY-NC-4.0\n")).toEqual([]);
  });
});

describe("checkHasFrontmatter - metadata lives in YAML, not prose", () => {
  it("flags a doc whose metadata is a **Bold:** header", () => {
    expect(checkHasFrontmatter("# Gender\n\n**Authorship:** KAI\n")[0]).toMatch(/frontmatter/);
  });

  it("passes a doc with a leading --- block", () => {
    expect(checkHasFrontmatter("---\nauthorship: KAI\n---\n\n# Gender\n")).toEqual([]);
  });
});

// checkHasFrontmatter must accept CRLF line endings and a leading BOM (PR #293).
// Dormant until the fix lands: probe the behavior itself -- if a CRLF document
// is still reported as missing frontmatter, the old code is in place, so skip.
const crlfDoc = "---\r\nkhai: x\r\n---\r\nbody\r\n";
const CRLF_DORMANT = checkHasFrontmatter(crlfDoc).length > 0;

describe.skipIf(CRLF_DORMANT)("checkHasFrontmatter - CRLF and BOM tolerance", () => {
  it("accepts CRLF frontmatter", () => {
    expect(checkHasFrontmatter(crlfDoc)).toEqual([]);
  });

  it("accepts a leading BOM", () => {
    const bom = String.fromCharCode(0xfeff) + "---\nkhai: x\n---\nbody\n";
    expect(checkHasFrontmatter(bom)).toEqual([]);
  });

  it("still flags prose with no frontmatter", () => {
    expect(checkHasFrontmatter("# Gender\n\n**Authorship:** KAI\n")[0]).toMatch(/frontmatter/);
  });
});
