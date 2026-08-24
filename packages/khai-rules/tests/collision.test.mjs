// titleCollisions: within one scope, no two elements of DIFFERENT kinds may
// share a display title. A bare title must name one element, so a plot and a
// piece that both read "The Fall" name nothing determinate. Repetition WITHIN a
// kind (two personas) is a separate concern and is not flagged. Pure: the caller
// collects { file, kind, title } per scope and passes them in.

import { describe, it, expect } from "vitest";
import { titleCollisions } from "../index.mjs";

const el = (file, kind, title) => ({ file, kind, title });

describe("titleCollisions: cross-kind", () => {
  it("flags a title shared by two different kinds", () => {
    const out = titleCollisions([
      el("plot_fall.md", "plot", "The Fall"),
      el("piece_fall.md", "piece", "The Fall"),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toContain("The Fall");
    expect(out[0]).toContain("plot (plot_fall.md)");
    expect(out[0]).toContain("piece (piece_fall.md)");
  });

  it("catches a whole-phenomenon piece reusing the play title", () => {
    const out = titleCollisions([
      el("play_fall.md", "play", "The Fall"),
      el("piece_fall.md", "piece", "The Fall"),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toContain("play");
    expect(out[0]).toContain("piece");
  });

  it("matches titles case-insensitively", () => {
    const out = titleCollisions([
      el("plot_fall.md", "plot", "The Fall"),
      el("piece_fall.md", "piece", "the fall"),
    ]);
    expect(out).toHaveLength(1);
  });

  it("lists every colliding element when three kinds share a title", () => {
    const out = titleCollisions([
      el("plot_x.md", "plot", "X"),
      el("piece_x.md", "piece", "X"),
      el("place_x.md", "place", "X"),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toContain("plot");
    expect(out[0]).toContain("piece");
    expect(out[0]).toContain("place");
  });

  it("reports the untrimmed-but-clean title in the message", () => {
    const out = titleCollisions([
      el("a.md", "plot", "  The Fall  "),
      el("b.md", "piece", "The Fall"),
    ]);
    expect(out[0]).toContain('"The Fall"');
  });
});

describe("titleCollisions: what it does NOT flag", () => {
  it("ignores repetition within a single kind (two personas is the norm)", () => {
    expect(
      titleCollisions([
        el("persona_a.md", "persona", "Nicias"),
        el("persona_b.md", "persona", "Nicias"),
      ]),
    ).toEqual([]);
  });

  it("passes distinct titles across kinds", () => {
    expect(
      titleCollisions([
        el("persona_a.md", "persona", "Nicias"),
        el("plot_b.md", "plot", "The Fall"),
      ]),
    ).toEqual([]);
  });

  it("skips an element with an empty or whitespace-only title", () => {
    expect(
      titleCollisions([
        el("plot_x.md", "plot", ""),
        el("piece_x.md", "piece", "   "),
        el("place_x.md", "place", undefined),
      ]),
    ).toEqual([]);
  });
});

describe("titleCollisions: exemptions", () => {
  it("exempts an element by basename", () => {
    const out = titleCollisions(
      [
        el("playwright_instructions.md", "instructions", "Absorption"),
        el("process_absorption.md", "process", "Absorption"),
      ],
      { exempt: new Set(["playwright_instructions.md"]) },
    );
    expect(out).toEqual([]);
  });

  it("exempts an element by full path", () => {
    const out = titleCollisions(
      [
        el("guide/playwright_instructions.md", "instructions", "Absorption"),
        el("process_absorption.md", "process", "Absorption"),
      ],
      { exempt: new Set(["guide/playwright_instructions.md"]) },
    );
    expect(out).toEqual([]);
  });

  it("still flags a genuine collision when an unrelated file is exempt", () => {
    const out = titleCollisions(
      [el("plot_fall.md", "plot", "The Fall"), el("piece_fall.md", "piece", "The Fall")],
      { exempt: new Set(["playwright_instructions.md"]) },
    );
    expect(out).toHaveLength(1);
  });
});
