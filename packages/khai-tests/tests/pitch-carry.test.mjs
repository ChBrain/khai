import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
// Namespace import: pitchCarryErrors does not exist on main until the source
// lands, and a missing *named* import is a load-time crash even for a skipped
// suite. Reached through the namespace, the body only dereferences it when
// active.
import * as validate from "../src/validate.mjs";

// Dormant until the carry-check source lands on main: probe the source for the
// function under test (mirrors the casting.test.mjs convention). Until then
// these skip and the suite stays green.
const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const DORMANT = !readFileSync(join(srcDir, "validate.mjs"), "utf8").includes(
  "export function pitchCarryErrors",
);

describe.skipIf(DORMANT)("pitch carry: a multi-pitch Company explains itself", () => {
  let dir;

  beforeEach(() => {
    dir = join(tmpdir(), `khai-carry-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(dir, "plays", "danton"), { recursive: true });
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  const writePlay = (company) =>
    writeFileSync(
      join(dir, "plays", "danton", "play_danton.md"),
      `---
khai: play
title: "Danton"
---
# Play: Danton

## Company
${company}
`,
    );

  const errorsOf = (results) => results.flatMap((r) => r.errors);

  it("passes a single pitch cast bare: the default named, owing no more", () => {
    writePlay("- [The Terror](./pitch_terror.md)");
    expect(validate.pitchCarryErrors(dir)).toEqual([]);
  });

  it("fails a bare link in a multi-pitch Company, one error per bare line", () => {
    writePlay("- [The Terror](./pitch_terror.md)\n- [The Farce](./pitch_farce.md)");
    const errs = errorsOf(validate.pitchCarryErrors(dir));
    expect(errs.length).toBe(2);
    expect(errs[0]).toMatch(/unexplained carry/);
  });

  it("passes a multi-pitch Company whose every pitch line explains the carry", () => {
    writePlay(
      "- [The Terror](./pitch_terror.md): the default key, the run as written.\n" +
        "- [The Farce](./pitch_farce.md): takes the run when the director calls it light.",
    );
    expect(validate.pitchCarryErrors(dir)).toEqual([]);
  });

  it("fails only the bare line when the other is explained", () => {
    writePlay(
      "- [The Terror](./pitch_terror.md): the default key.\n- [The Farce](./pitch_farce.md)",
    );
    const errs = errorsOf(validate.pitchCarryErrors(dir));
    expect(errs.length).toBe(1);
    expect(errs[0]).toMatch(/pitch_farce/);
  });
});
