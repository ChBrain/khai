import { describe, it, expect } from "vitest";
// @ts-expect-error -- the canon export is plain ESM (no .d.ts); vitest runs it directly.
import { playCard, playChapters } from "../index.mjs";

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

describe("playCard - the ENACTS contract", () => {
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
