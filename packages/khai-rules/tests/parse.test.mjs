// Smoke coverage for the parser that moved into khai-rules with the rule
// atoms. The atoms are exercised in depth via khai-tests; this pins the parser
// directly in its new home so the package is not shipped untested.

import { describe, it, expect } from "vitest";
import { parseDoc, sectionBody } from "../index.mjs";

const DOC = `---
khai: position
---
# Position: Gender

## Title
Gender

## Has
A read the room assigns.

## Drives
Runs on the loss.

### note
an extension
`;

describe("parseDoc", () => {
  it("extracts frontmatter data", () => {
    const doc = parseDoc(DOC);
    expect(doc.ok).toBe(true);
    expect(doc.data.khai).toBe("position");
  });

  it("indexes headers with level and text in document order", () => {
    const doc = parseDoc(DOC);
    expect(doc.headers.map((h) => [h.level, h.text])).toEqual([
      [1, "Position: Gender"],
      [2, "Title"],
      [2, "Has"],
      [2, "Drives"],
      [3, "note"],
    ]);
  });

  it("reports a parse failure rather than throwing", () => {
    const doc = parseDoc("---\nkhai: [unclosed\n---\nbody\n");
    expect(doc.ok).toBe(false);
    expect(typeof doc.error).toBe("string");
  });
});

describe("sectionBody", () => {
  it("returns a section's lines up to the next same-or-shallower header", () => {
    const doc = parseDoc(DOC);
    expect(sectionBody(doc.body, "Has")).toEqual(["A read the room assigns.", ""]);
  });

  it("returns null for an absent section", () => {
    const doc = parseDoc(DOC);
    expect(sectionBody(doc.body, "Orders")).toBeNull();
  });
});
