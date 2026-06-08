import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as arch from "../index.mjs";

const DORMANT = typeof arch.playCard !== "function";
const playCard = arch.playCard;
const playChapters = arch.playChapters;

const validPlay = `---
khai: play
title: "Woyzeck"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-06-05"
---

# Play: Woyzeck

## Estate

Diese Produktion gehört zu dem Hause Büchner.

## Name

Die Produktion läuft unter dem Namen Woyzeck.

## Arc

Ein armer Mensch wird an Leib und Seele besessen.

## Company

Die geschlossene Besetzung.

## Triggers

Die Handlungen laufen in einer Folge ab.

## Stakes

Worum gerungen wird.

---

**Builder note (template only):**
Some note here.
`;

describe.skipIf(DORMANT)("playCard - the ENACTS contract", () => {
  it("playChapters are the ENACTS chapters in order", () => {
    expect(playChapters).toEqual(["Estate", "Name", "Arc", "Company", "Triggers", "Stakes"]);
  });

  it("builds a normalized play card from valid markdown", () => {
    const card = playCard(validPlay);
    expect(card.mnemonic).toBe("ENACTS");
    expect(card.chapters).toEqual(playChapters);
    expect(Object.keys(card.sections)).toEqual(playChapters);
    expect(card.sections.Estate.body).toContain("Diese Produktion gehört zu dem Hause Büchner.");
    expect(card.sections.Stakes.body).toContain("Worum gerungen wird.");
    expect(card.coda).toContain("Builder note (template only)");
  });

  it("throws when play text is missing or empty", () => {
    // @ts-expect-error -- testing javascript type safety
    expect(() => playCard(null)).toThrow(/play text is required/);
    expect(() => playCard("   ")).toThrow(/play text is required/);
  });

  it("throws when a chapter is missing", () => {
    const broken = validPlay.replace("## Stakes\n\nWorum gerungen wird.", "");
    expect(() => playCard(broken)).toThrow(/play chapters must be exactly/);
  });

  it("throws when chapters are out of order", () => {
    const broken = validPlay
      .replace("## Estate", "## Temp")
      .replace("## Name", "## Estate")
      .replace("## Temp", "## Name");
    expect(() => playCard(broken)).toThrow(/play chapters must be exactly/);
  });

  it("throws when a chapter is empty", () => {
    const broken = validPlay.replace("Worum gerungen wird.", "   ");
    expect(() => playCard(broken)).toThrow(/chapter "Stakes" is empty/);
  });
});

// The coda is the trailing block after a final `---` rule. A `---` thematic rule
// inside a chapter body, or a `---` inside a fenced code block, must NOT be
// mistaken for the coda boundary and truncate the chapters (PR #275). Dormant
// until the fence-aware splitCoda lands on main -- probe index.mjs for it, per
// the cli.test.mjs convention.
const CODA_DORMANT = !readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "index.mjs"),
  "utf8",
).includes("function splitCoda");

describe.skipIf(CODA_DORMANT)("playCard - coda vs intra-chapter and fenced rules", () => {
  it("a `---` rule inside a chapter body does not truncate the chapters", () => {
    const intra = validPlay.replace(
      "Ein armer Mensch wird an Leib und Seele besessen.",
      "Erster Teil.\n\n---\n\nZweiter Teil nach der Linie.",
    );
    const card = playCard(intra);
    expect(card.chapters).toEqual(playChapters);
    expect(card.sections.Arc.body).toContain("---");
    expect(card.coda).toContain("Builder note (template only)");
  });

  it("a `---` inside a fenced code block does not truncate the chapters", () => {
    const fenced = validPlay.replace(
      "Ein armer Mensch wird an Leib und Seele besessen.",
      "Beispiel:\n\n```yaml\nkhai: x\n---\nfoo: bar\n```",
    );
    const card = playCard(fenced);
    expect(card.chapters).toEqual(playChapters);
    expect(card.coda).toContain("Builder note (template only)");
  });

  it("still peels a genuine trailing coda", () => {
    expect(playCard(validPlay).coda).toContain("Builder note (template only)");
  });
});
