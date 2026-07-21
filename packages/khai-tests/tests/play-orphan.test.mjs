// The play-level orphan wall: a content instance that sits in a play directory
// but the play never lists (in its Company or Triggers) is a present-but-unlisted
// element, the engine orphan check lifted to the play. Conservative where there
// is nothing to measure against (a play that links nothing local is skipped), and
// a non-instance doc (no khai: frontmatter) is ignored.

import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { playOrphanErrors } from "../src/validate.mjs";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "validate.mjs");
const DORMANT = !readFileSync(SRC, "utf8").includes("playOrphanErrors");

const instance = (kind, name) =>
  `---
khai: ${kind}
title: "${name}"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-07-21"
---

# ${kind.charAt(0).toUpperCase() + kind.slice(1)}: ${name}

## Taxonomy
parent
`;

const PLAY = `---
khai: play
title: "X"
---
# Play: X

## Company
- The piece: [Piece](./piece_a.md).

## Triggers
- [Plot](./plot_a.md) fires.
`;

let dir;
afterEach(() => dir && rmSync(dir, { recursive: true, force: true }));

/** A temp house with plays/x/: the play file, plus whatever extra files given. */
function house(extra = {}, { play = PLAY } = {}) {
  dir = mkdtempSync(join(tmpdir(), "khai-play-orphan-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "t", version: "0.0.0" }));
  const pd = join(dir, "plays", "x");
  mkdirSync(pd, { recursive: true });
  writeFileSync(join(pd, "play_x.md"), play);
  writeFileSync(join(pd, "piece_a.md"), instance("piece", "A piece"));
  writeFileSync(join(pd, "plot_a.md"), instance("plot", "A plot"));
  for (const [file, body] of Object.entries(extra)) writeFileSync(join(pd, file), body);
  return dir;
}

const orphanErrors = (results) => results.flatMap((r) => r.errors ?? []);

describe.skipIf(DORMANT)("playOrphanErrors", () => {
  it("flags an instance the play never lists", () => {
    const errs = orphanErrors(
      playOrphanErrors(house({ "process_ghost.md": instance("process", "Ghost") })),
    );
    expect(errs).toHaveLength(1);
    expect(errs[0]).toContain("process_ghost.md");
  });

  it("passes when every instance is listed (Company + Triggers)", () => {
    expect(orphanErrors(playOrphanErrors(house()))).toEqual([]);
  });

  it("ignores a non-instance doc (no khai: frontmatter)", () => {
    expect(
      orphanErrors(playOrphanErrors(house({ "README.md": "# Notes\n\nJust prose.\n" }))),
    ).toEqual([]);
  });

  it("never flags the play file itself", () => {
    const errs = orphanErrors(playOrphanErrors(house()));
    expect(errs.join(" ")).not.toContain("play_x.md");
  });

  it("skips a play whose file links nothing local (nothing to measure against)", () => {
    const play = `---\nkhai: play\ntitle: "X"\n---\n# Play: X\n\n## Company\n\nNamed in prose only, no links.\n`;
    // piece_a and plot_a are unlisted, but the play declares no manifest, so skip.
    expect(orphanErrors(playOrphanErrors(house({}, { play })))).toEqual([]);
  });
});
