// checkTitle: the frontmatter `title` must be present and echo the H1 name
// ("# Type: Name"), so stripping the YAML loses nothing. This holds for every
// type -- the echo always targets the H1, never a `## Title` / `## Name` H2.

import { describe, it, expect } from "vitest";
import { parseDoc, checkTitle } from "../index.mjs";

const doc = (fm, body) => parseDoc(`---\n${fm}\n---\n\n${body}\n`);

describe("checkTitle: presence", () => {
  it("requires a title", () => {
    expect(checkTitle(doc("khai: position", "# Position: Male"), { type: "position" })).toEqual([
      "frontmatter missing `title`",
    ]);
  });

  it("rejects an empty title", () => {
    expect(
      checkTitle(doc('khai: position\ntitle: ""', "# Position: Male"), { type: "position" }),
    ).toEqual(["frontmatter missing `title`"]);
  });
});

describe("checkTitle: echoes the H1 name", () => {
  it("accepts a title that matches the H1 name", () => {
    expect(
      checkTitle(doc("khai: position\ntitle: Male", "# Position: Male"), { type: "position" }),
    ).toEqual([]);
  });

  it("accepts a multi-word H1 name (commas and all)", () => {
    expect(
      checkTitle(
        doc('khai: process\ntitle: "Speaking, Borrowed"', "# Process: Speaking, Borrowed"),
        { type: "process" },
      ),
    ).toEqual([]);
  });

  it("echoes the H1 for a persona too (Mara)", () => {
    expect(
      checkTitle(doc("khai: persona\ntitle: Mara", "# Persona: Mara"), { type: "persona" }),
    ).toEqual([]);
  });

  it("rejects a title that does not match the H1 name", () => {
    const errs = checkTitle(doc("khai: position\ntitle: Female", "# Position: Male"), {
      type: "position",
    });
    expect(errs.some((e) => e.includes('must match the H1 name "Male"'))).toBe(true);
  });
});

describe("checkTitle: a play echoes its H1, not `## Name`", () => {
  // The play's `## Name` carries the production's billed name -- a separate
  // concern. The title echo targets the H1, so a title that matches the H1 is
  // valid even when `## Name` says something else.
  const play = (title, h1Name, sectionName) =>
    doc(`khai: play\ntitle: ${title}`, `# Play: ${h1Name}\n\n## Name\n\n${sectionName}`);

  it("accepts a title matching the H1 even when `## Name` differs", () => {
    expect(
      checkTitle(play("Woyzeck", "Woyzeck", "The billed name, said in prose"), {
        type: "play",
      }),
    ).toEqual([]);
  });

  it("rejects a title that does not match the H1", () => {
    const errs = checkTitle(play("Hamlet", "Woyzeck", "Woyzeck"), { type: "play" });
    expect(errs.some((e) => e.includes('must match the H1 name "Woyzeck"'))).toBe(true);
  });
});
