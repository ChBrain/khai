import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
// Namespace import: voiceEchoWarnings does not exist on main until the source
// lands, and a missing *named* import is a load-time crash even for a skipped
// suite. Reached through the namespace, the body only dereferences it when
// active.
import * as validate from "../src/validate.mjs";

// Dormant until the two-tunings source lands on main: probe the source for the
// function under test (mirrors the casting.test.mjs convention). Until then
// these skip and the suite stays green.
const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const DORMANT = !readFileSync(join(srcDir, "validate.mjs"), "utf8").includes(
  "export function voiceEchoWarnings",
);

const warningsOf = (results) => results.flatMap((r) => r.warnings ?? []);

describe.skipIf(DORMANT)("casting coverage: a pitch keys the run, it is not cast", () => {
  let dir;

  beforeEach(() => {
    dir = join(tmpdir(), `khai-tunings-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(dir, "plays", "danton"), { recursive: true });
    // A Company that fields a persona, a place, and the pitch the play is keyed
    // to. The plot casts only the persona: the place is a true dead entry, the
    // pitch is the normal shape of a keyed production.
    writeFileSync(
      join(dir, "plays", "danton", "play_danton.md"),
      `---
khai: play
title: "Danton"
---
# Play: Danton

## Company
- [Danton](./persona_danton.md) at [the Convention](./place_convention.md).
- Keyed to [The Terror](./pitch_terror.md).
`,
    );
    writeFileSync(
      join(dir, "plays", "danton", "plot_arrest.md"),
      `---
khai: plot
---
## Taxonomy
[Danton](./play_danton.md): a plot.

## Action
[Danton](./persona_danton.md) is taken.
`,
    );
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("does not warn a pitch no plot casts", () => {
    const warns = warningsOf(validate.castingCoverageErrors(dir));
    expect(warns.some((w) => /pitch_terror/.test(w))).toBe(false);
  });

  it("still warns a non-pitch Company element no plot casts", () => {
    const warns = warningsOf(validate.castingCoverageErrors(dir));
    expect(warns.some((w) => /place_convention/.test(w))).toBe(true);
  });
});

describe.skipIf(DORMANT)("voice echo: two plays must not share one register", () => {
  let dir;

  const writePlay = (id, voice) => {
    mkdirSync(join(dir, "plays", id), { recursive: true });
    writeFileSync(
      join(dir, "plays", id, `play_${id}.md`),
      `---
khai: play
title: "${id}"
${voice == null ? "" : `voice: "${voice}"\n`}---
# Play: ${id}
`,
    );
  };

  beforeEach(() => {
    dir = join(tmpdir(), `khai-voices-${process.pid}-${Math.random().toString(36).slice(2)}`);
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("warns on a register stamped twice", () => {
    writePlay("danton", "Grave and measured on the surface, underneath the terror rising");
    writePlay("marat", "Grave and measured on the surface, underneath the terror rising fast");
    const warns = warningsOf(validate.voiceEchoWarnings(dir));
    expect(warns.length).toBe(1);
    expect(warns[0]).toMatch(/voice echoes .*play_marat/);
  });

  it("passes distinct registers, a shared coda notwithstanding", () => {
    writePlay("danton", "Grave and measured, the tribunal certain of its arithmetic. No dashes.");
    writePlay("marat", "Feverish and intimate, a bath drawn against the skin's fire. No dashes.");
    expect(warningsOf(validate.voiceEchoWarnings(dir))).toEqual([]);
  });

  it("ignores a play that declares no voice", () => {
    writePlay("danton", "Grave and measured on the surface, underneath the terror rising");
    writePlay("marat", null);
    expect(warningsOf(validate.voiceEchoWarnings(dir))).toEqual([]);
  });

  it("honours a caller's threshold", () => {
    writePlay("danton", "Grave and measured on the surface, the terror rising");
    writePlay("marat", "Grave and measured beneath the surface, a hunger rising");
    const strict = warningsOf(validate.voiceEchoWarnings(dir, { threshold: 0.2 }));
    const loose = warningsOf(validate.voiceEchoWarnings(dir, { threshold: 0.95 }));
    expect(strict.length).toBe(1);
    expect(loose).toEqual([]);
  });
});
