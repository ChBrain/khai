import { describe, it, expect } from "vitest";
// @ts-expect-error -- the canon export is plain ESM (no .d.ts); vitest runs it directly.
import { engineCard, wiresChapters } from "../index.mjs";

// The shape engineCard reads: an engine's package.json `khai` block. Kept
// synthetic here so the unit stays independent of any real engine; the live
// gender card is enforced cross-package by @chbrain/khai-tests.
const validManifest = {
  engine: "demo",
  type: "position",
  anchor: "position_demo.md",
  card: {
    wire: "where it attaches",
    issue: "what it offers",
    require: "what it asks back",
    enforce: "what it guarantees",
    setup: "how to wire it",
  },
};

describe("engineCard - the WIRES contract", () => {
  it("WIRES chapters are the engines type's chapters plus Setup", () => {
    expect(wiresChapters).toEqual(["Wire", "Issue", "Require", "Enforce", "Setup"]);
  });

  it("builds a normalized card from a valid manifest", () => {
    const card = engineCard(validManifest);
    expect(card.id).toBe("demo");
    expect(card.type).toBe("position");
    expect(card.anchor).toBe("position_demo.md");
    expect(card.mnemonic).toBe("WIRES");
    expect(card.chapters).toEqual(wiresChapters);
    expect(Object.keys(card.sections)).toEqual(wiresChapters);
    expect(card.sections.Wire).toBe("where it attaches");
    expect(card.sections.Setup).toBe("how to wire it");
  });

  it("trims chapter prose", () => {
    const card = engineCard({
      ...validManifest,
      card: { ...validManifest.card, wire: "  padded  " },
    });
    expect(card.sections.Wire).toBe("padded");
  });

  it("defaults type and anchor to null when absent", () => {
    const card = engineCard({ engine: "demo", card: validManifest.card });
    expect(card.type).toBeNull();
    expect(card.anchor).toBeNull();
  });

  it("throws when the manifest is not an object", () => {
    expect(() => engineCard(null)).toThrow(/manifest/);
  });

  it("throws when the engine slug is missing", () => {
    expect(() => engineCard({ card: validManifest.card })).toThrow(/manifest\.engine/);
  });

  it("throws when the card is missing", () => {
    expect(() => engineCard({ engine: "demo" })).toThrow(/manifest\.card is required/);
  });

  for (const chapter of ["wire", "issue", "require", "enforce", "setup"]) {
    it(`throws when card.${chapter} is empty`, () => {
      const card = { ...validManifest.card, [chapter]: "   " };
      expect(() => engineCard({ ...validManifest, card })).toThrow(new RegExp(`card\\.${chapter}`));
    });
  }

  it("throws on an unknown card key (the set is closed)", () => {
    const card = { ...validManifest.card, extra: "nope" };
    expect(() => engineCard({ ...validManifest, card })).toThrow(/unknown card key/);
  });
});
