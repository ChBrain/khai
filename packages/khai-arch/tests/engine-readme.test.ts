import { describe, it, expect } from "vitest";
// @ts-expect-error -- the canon export is plain ESM (no .d.ts); vitest runs it directly.
import { renderEngineReadme } from "../index.mjs";

// gender's shape: the legacy shorthand, with an em-dash in the description.
const genderPkg = {
  name: "@chbrain/khai-engine-gender",
  description: "khai engine content — the gender domain: gender as position.",
  license: "CC-BY-NC-4.0",
  khai: {
    engine: "gender",
    type: "position",
    anchor: "position_gender.md",
    expressions: { male: "position_male.md", female: "position_female.md" },
  },
};

// a members-based engine with an explicit title and a multi-type tree.
const languagePkg = {
  description: "the language domain",
  license: "CC-BY-NC-4.0",
  khai: {
    engine: "language",
    title: "Language",
    members: [
      { file: "process_using_language.md", type: "process" },
      {
        file: "position_business_english.md",
        type: "position",
        parent: "process_using_language.md",
      },
    ],
  },
};

describe("renderEngineReadme - generated, pointer-only README", () => {
  it("renders title, tagline, files (root marked anchor), pointer, license", () => {
    const out = renderEngineReadme(genderPkg);
    expect(out.startsWith("# Gender\n")).toBe(true);
    expect(out).toContain("single source of truth");
    expect(out).toContain("[gender](position_gender.md): position (anchor)");
    expect(out).toContain("[male](position_male.md): position");
    expect(out).toContain("[female](position_female.md): position");
    expect(out).toContain("[sources and attribution](REFERENCES.md)");
    expect(out).toContain("License: CC-BY-NC-4.0");
    expect(out.endsWith("\n")).toBe(true);
  });

  it("uses natural link text, never the technical filename", () => {
    // [gender](position_gender.md) injects meaning; [position_gender.md](...)
    // injects a noisy token an LLM reads literally. No link text may be a
    // filename (end in .md/.json) anywhere in the generated README.
    const out = renderEngineReadme(genderPkg);
    expect(out).toContain("[gender](position_gender.md)");
    expect(out).not.toMatch(/\[[^\]]*\.(md|json)\]\(/);
  });

  it("normalizes an em/en-dash in the tagline to a comma (house voice)", () => {
    const out = renderEngineReadme(genderPkg);
    expect(out).not.toMatch(/[–—]/);
    expect(out).not.toMatch(/\S - \S/); // no clause dash either
    expect(out).toContain("khai engine content, the gender domain");
  });

  it("is a pointer, not a copy: never reproduces card prose", () => {
    const withCard = {
      ...genderPkg,
      khai: {
        ...genderPkg.khai,
        card: { wire: "SECRET", issue: "x", require: "x", enforce: "x", setup: "x" },
      },
    };
    expect(renderEngineReadme(withCard)).not.toContain("SECRET");
  });

  it("uses an explicit title and renders a multi-type members tree", () => {
    const out = renderEngineReadme(languagePkg);
    expect(out.startsWith("# Language\n")).toBe(true);
    expect(out).toContain("[using language](process_using_language.md): process (anchor)");
    expect(out).toContain("[business english](position_business_english.md): position");
  });

  it("prefers khai.tagline over the package description", () => {
    const withTagline = {
      ...genderPkg,
      khai: { ...genderPkg.khai, tagline: "Gender as position: the read before a word." },
    };
    const out = renderEngineReadme(withTagline);
    expect(out).toContain("Gender as position: the read before a word.");
    expect(out).not.toContain("khai engine content");
  });

  it("throws without a khai block", () => {
    expect(() => renderEngineReadme({ description: "x" })).toThrow(/khai/);
  });
});
