import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import * as arch from "../index.mjs";
import { checkPlay, readFrontmatter, PLAY_CHAPTERS, main } from "../checks/check_play.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, "..");
const script = join(pkgRoot, "checks", "check_play.mjs");

const validPlay = `---
khai: play
title: "Woyzeck"
description: "A poor man is possessed in body and soul."
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-06-05"
---

# Play: Woyzeck

## Estate

This production belongs to the house of Buechner.

## Name

The production runs under the name Woyzeck.

## Arc

A poor man is possessed in body and soul.

## Company

The closed cast.

## Triggers

The plots run in sequence.

## Stakes

What is fought over.

---

**Builder note (template only):**
Some note here.
`;

describe("check_play: the single source of the play's shape", () => {
  it("imports nothing but node, so a skill can ship it as is", () => {
    const src = readFileSync(script, "utf8");
    const imports = [...src.matchAll(/^import .* from "([^"]+)";/gm)].map((m) => m[1]);
    expect(imports.length).toBeGreaterThan(0);
    for (const i of imports) expect(i.startsWith("node:")).toBe(true);
  });

  it("its chapter list is the canon's: the play type and the re-export both read from it", () => {
    expect(PLAY_CHAPTERS).toEqual(arch.types.play.chapters);
    expect(arch.playChapters).toBe(PLAY_CHAPTERS);
    expect(arch.checkPlay).toBe(checkPlay);
  });

  it("a valid play has no finding, and so does the canon's own template", () => {
    expect(checkPlay(validPlay)).toEqual([]);
    expect(checkPlay(readFileSync(join(pkgRoot, "templates", "template_play.md"), "utf8"))).toEqual(
      [],
    );
  });
});

describe("check_play: the frontmatter subset", () => {
  it("reads scalars, quoted values and one level of map", () => {
    const { data, unread } = readFrontmatter(validPlay);
    expect(unread).toEqual([]);
    expect(data.title).toBe("Woyzeck");
    expect(data.stamp).toEqual({ owner: "KAI HACKS AI", version: "v0.0.1", date: "2026-06-05" });
  });

  it("names a line it cannot read instead of guessing", () => {
    const beyond = validPlay.replace(
      "license: CC-BY-NC-SA-4.0",
      "license: CC-BY-NC-SA-4.0\ntags:\n  - one\n  - two",
    );
    const e = checkPlay(beyond);
    expect(e.some((x) => /beyond a play's subset/.test(x) && /- one/.test(x))).toBe(true);
  });

  it("finds a missing frontmatter, an unknown key, a wrong type, a missing stamp field, a bad provenance", () => {
    expect(checkPlay(validPlay.replace(/^---\n[\s\S]*?\n---\n/, ""))).toContain(
      "frontmatter missing: a play opens with a `---` block",
    );
    expect(checkPlay(validPlay.replace("license:", "licence:"))).toContain(
      "unknown frontmatter key: licence",
    );
    expect(checkPlay(validPlay.replace("khai: play", "khai: plot"))).toContain(
      'frontmatter khai must be "play", got "plot"',
    );
    expect(checkPlay(validPlay.replace('  date: "2026-06-05"\n', ""))).toContain(
      "stamp missing date",
    );
    expect(checkPlay(validPlay.replace("khai: play", "khai: play\nprovenance: guessed"))).toContain(
      'frontmatter "provenance" must be one of [sourced, free, unverified], got "guessed"',
    );
    expect(
      checkPlay(
        validPlay.replace('description: "A poor man is possessed in body and soul."\n', ""),
      ),
    ).toContain("frontmatter missing required key: description");
  });

  it("holds the title to the H1 name, or declared when the play is not in english", () => {
    expect(checkPlay(validPlay.replace('title: "Woyzeck"', 'title: "Wozzeck"'))).toContain(
      'frontmatter title/declared "Wozzeck" must match the H1 name "Woyzeck"',
    );
    const german = validPlay.replace("khai: play", "khai: play\nlanguage: german");
    expect(checkPlay(german)).toContain("frontmatter missing `declared` for non-english play");
    expect(
      checkPlay(german.replace("language: german", 'language: german\ndeclared: "Woyzeck"')),
    ).toEqual([]);
    expect(checkPlay(validPlay, { resolvedLanguage: "german" })).toContain(
      "frontmatter missing `declared` for non-english play",
    );
  });
});

describe("check_play: the H1 and the six chapters", () => {
  it("wants exactly one H1 that reads Play: <Name>", () => {
    expect(checkPlay(validPlay.replace("# Play: Woyzeck", "# Woyzeck"))).toContain(
      'H1 must read "# Play: <Name>", got "# Woyzeck"',
    );
    expect(
      checkPlay(validPlay.replace("The closed cast.", "The closed cast.\n\n# Another")),
    ).toContain("a khai file has exactly one H1 (#); found 2");
  });

  it("finds a missing, a foreign, a reordered and an empty chapter", () => {
    expect(checkPlay(validPlay.replace("## Stakes\n\nWhat is fought over.\n", ""))[0]).toMatch(
      /play chapters must be exactly/,
    );
    expect(checkPlay(validPlay.replace("## Stakes", "## Owner\n\nx\n\n## Stakes"))[0]).toMatch(
      /got \[Estate, Name, Arc, Company, Triggers, Owner, Stakes\]/,
    );
    const swapped = validPlay
      .replace("## Estate", "## Tmp")
      .replace("## Name", "## Estate")
      .replace("## Tmp", "## Name");
    expect(checkPlay(swapped)[0]).toMatch(/ENACTS/);
    expect(checkPlay(validPlay.replace("What is fought over.", "   "))).toEqual([
      'chapter "Stakes" is empty',
    ]);
  });

  it("a subchapter fills a chapter; a fenced ## is not a chapter; a closed ATX header reads clean", () => {
    expect(
      checkPlay(validPlay.replace("What is fought over.", "### The bread\n\nThe loaf.")),
    ).toEqual([]);
    expect(
      checkPlay(
        validPlay.replace("The closed cast.", "The closed cast.\n\n```md\n## Not a chapter\n```"),
      ),
    ).toEqual([]);
    expect(checkPlay(validPlay.replace("## Company", "## Company ##"))).toEqual([]);
  });

  it("the coda after a trailing rule is not a chapter, and an H2 after the rule means it was no coda", () => {
    expect(checkPlay(validPlay)).toEqual([]);
    const notCoda = validPlay.replace(
      "Some note here.",
      "Some note here.\n\n## Not a chapter either",
    );
    expect(checkPlay(notCoda)[0]).toMatch(/got \[.*Stakes, Not a chapter either\]/);
    const rule = validPlay.replace(
      "The closed cast.",
      "First.\n\n---\n\nSecond, after a rule inside the chapter.",
    );
    expect(checkPlay(rule)).toEqual([]);
  });

  it("holds the house bytes: no dash, no CRLF, no BOM, an LF at the end", () => {
    expect(checkPlay(validPlay.replace("The closed cast.", "The cast — closed."))).toContain(
      "en/em-dash present (use ' - ')",
    );
    expect(checkPlay(validPlay.replace(/\n/g, "\r\n"))).toContain("CRLF present");
    expect(checkPlay("﻿" + validPlay)).toContain("BOM present");
    expect(checkPlay(validPlay.trimEnd())).toContain("no LF at EOF");
  });
});

describe("check_play: the command", () => {
  it("prints ok per clean file, one line per finding otherwise, and exits by the count of red files", () => {
    const template = join(pkgRoot, "templates", "template_play.md");
    const r = spawnSync(process.execPath, [script, template], { encoding: "utf8" });
    expect(r.status).toBe(0);
    expect(r.stdout.trim()).toBe(`ok ${template}`);
    const bad = join(here, "fixtures", "invalid", "bad-encoding-em-dash.md");
    const b = spawnSync(process.execPath, [script, template, bad], { encoding: "utf8" });
    expect(b.status).toBe(1);
    expect(b.stderr).toMatch(
      new RegExp(`^${bad.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}: `, "m"),
    );
    const none = spawnSync(process.execPath, [script], { encoding: "utf8" });
    expect(none.status).toBe(2);
    expect(none.stderr).toMatch(/usage/);
  });

  it("main is callable in process with the same contract", () => {
    const logs: string[] = [];
    const errs: string[] = [];
    const code = main([join(pkgRoot, "templates", "template_play.md"), join(here, "nope.md")], {
      log: (l: string) => logs.push(l),
      error: (l: string) => errs.push(l),
    });
    expect(code).toBe(1);
    expect(logs).toHaveLength(1);
    expect(errs[0]).toMatch(/nope\.md: /);
  });
});
