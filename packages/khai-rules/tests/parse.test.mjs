// Smoke coverage for the parser that moved into khai-rules with the rule
// atoms. The atoms are exercised in depth via khai-tests; this pins the parser
// directly in its new home so the package is not shipped untested.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
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

// Fence-aware parsing (PR #267): a heading inside a fenced code block is a code
// sample, not structure. Dormant until the source fix lands on main -- probe
// the source for the helper the fix introduces, per the cli.test.mjs convention.
const FENCE_DORMANT = !readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "parse.mjs"),
  "utf8",
).includes("function fencedLines");

describe.skipIf(FENCE_DORMANT)("fenced code blocks", () => {
  const FENCED = `---
khai: position
---
# Position: Gender

## Has
The frontmatter format looks like:
\`\`\`md
## Drives
this is sample text, not a real section
\`\`\`
More prose after the sample.

## Owner
- owner: kai
`;

  it("parseDoc does not index a heading inside a code fence", () => {
    const doc = parseDoc(FENCED);
    expect(doc.headers.map((h) => [h.level, h.text])).toEqual([
      [1, "Position: Gender"],
      [2, "Has"],
      [2, "Owner"],
    ]);
  });

  it("sectionBody keeps a fenced heading in the body, not as a section break", () => {
    const doc = parseDoc(FENCED);
    const body = sectionBody(doc.body, "Has");
    // The fenced "## Drives" line is retained as content...
    expect(body.some((l) => l.includes("## Drives"))).toBe(true);
    // ...and the prose after the fence is still part of the section...
    expect(body.some((l) => l.includes("More prose after the sample."))).toBe(true);
    // ...but the real "## Owner" header still ends it.
    expect(body.some((l) => l.includes("- owner: kai"))).toBe(false);
  });

  it("sectionBody returns null for a heading that only appears fenced", () => {
    const doc = parseDoc(FENCED);
    expect(sectionBody(doc.body, "Drives")).toBeNull();
  });

  it("treats a tilde fence the same as a backtick fence", () => {
    const doc = parseDoc(`# Title: X

## Has
~~~
## Drives
fenced
~~~
`);
    expect(doc.headers.map((h) => h.text)).toEqual(["Title: X", "Has"]);
  });

  it("an unclosed fence runs to end of document", () => {
    const doc = parseDoc(`# Title: X

## Has
\`\`\`
## Drives
never closed
`);
    expect(doc.headers.map((h) => h.text)).toEqual(["Title: X", "Has"]);
  });
});
