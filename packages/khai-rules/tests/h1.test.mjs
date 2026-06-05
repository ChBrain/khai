// checkH1: the title line "# <Type>: <Name>", and exactly one of it. By design
// a khai instance carries a single first-level header; a second `#` is drift.

import { describe, it, expect } from "vitest";
import { parseDoc, checkH1 } from "../index.mjs";

const doc = (body) => parseDoc(`---\nkhai: position\n---\n\n${body}\n`);

describe("checkH1", () => {
  it("accepts a single, well-formed H1 and returns its name", () => {
    const { name, errors } = checkH1(doc("# Position: Male\n\n## Has\nx"), { type: "position" });
    expect(errors).toEqual([]);
    expect(name).toBe("Male");
  });

  it("flags a missing H1", () => {
    expect(checkH1(doc("## Has\nx"), { type: "position" }).errors).toContain(
      "missing H1 title line",
    );
  });

  it("flags a malformed H1", () => {
    const errs = checkH1(doc("# Male\n\n## Has\nx"), { type: "position" }).errors;
    expect(errs.some((e) => e.includes('H1 must read "# Position: <Name>"'))).toBe(true);
  });

  it("flags a second H1 (a khai file has exactly one)", () => {
    const errs = checkH1(doc("# Position: Male\n\n## Has\nx\n\n# Position: Other"), {
      type: "position",
    }).errors;
    expect(errs.some((e) => e.includes("exactly one H1"))).toBe(true);
  });
});
