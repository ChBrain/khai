import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as guard from "../index.mjs";

// Dormant until the source PR (the inverted content rule) lands: this tests-first
// PR rewrites the assertions to the new doctrine (a content add must carry a
// `minor` changeset), which contradict the old source. Probe the source for the
// new-behaviour sentinel so the suite stays green on a main that still forbids a
// changeset on a content add; once the source lands, these activate. (The
// source/test-split rule: tests first, dormant; source second.)
const srcPath = join(dirname(fileURLToPath(import.meta.url)), "..", "index.mjs");
const DORMANT = !readFileSync(srcPath, "utf8").includes("must carry a `minor` changeset");

const { changesetCheck, parseChanges, resolveConfig } = guard;

// A house's policy: adding a play file moves the play count, so such an addition
// must carry a `minor` changeset (the Version PR is the deploy gate; the reconcile
// clamps the minor to the count and resets the patch, so a `patch`/empty add would
// drift to 0.<count>.1). Every other change needs a changeset too.
const houseCfg = DORMANT
  ? {}
  : resolveConfig({ changesetPolicy: { countDrivenAdd: ["plays/*/play_*.md"] } });
const patchCs = [{ file: ".changeset/x.md", entries: [{ package: "@scope/a", level: "patch" }] }];
const minorCs = [{ file: ".changeset/m.md", entries: [{ package: "@scope/a", level: "minor" }] }];
const emptyCs = [{ file: ".changeset/e.md", entries: [] }];

const NUL = String.fromCharCode(0);
const TAB = String.fromCharCode(9);
const z = (...pairs) => pairs.flat().concat("").join(NUL);

describe.skipIf(DORMANT)("parseChanges", () => {
  it("keeps the status letter from a -z stream", () => {
    expect(parseChanges(z(["A", "plays/099z/play_z.md"]))).toEqual([
      { status: "A", path: "plays/099z/play_z.md" },
    ]);
  });

  it("reports a rename-into as an add of the destination", () => {
    // R<score> <src> <dst> in the -z stream.
    expect(
      parseChanges(["R090", "plays/old/play_a.md", "plays/new/play_a.md", ""].join(NUL)),
    ).toEqual([{ status: "A", path: "plays/new/play_a.md" }]);
  });

  it("parses the legacy tab-delimited line form", () => {
    expect(
      parseChanges(["A" + TAB + "plays/zz/play_z.md", "M" + TAB + "plays/zz/persona_q.md"]),
    ).toEqual([
      { status: "A", path: "plays/zz/play_z.md" },
      { status: "M", path: "plays/zz/persona_q.md" },
    ]);
  });

  it("returns [] for empty input", () => {
    expect(parseChanges("")).toEqual([]);
  });
});

describe.skipIf(DORMANT)("changesetCheck", () => {
  it("passes a new-play addition that carries a minor changeset", () => {
    const changed = parseChanges(
      z(["A", "plays/099z/play_z.md"], ["A", "plays/099z/persona_x.md"]),
    );
    const r = changesetCheck({ changed, changesets: minorCs, config: houseCfg });
    expect(r.ok).toBe(true);
    expect(r.addsCountDriven).toBe(true);
  });

  it("flags a new-play addition with NO changeset (must carry a minor)", () => {
    const changed = parseChanges(z(["A", "plays/099z/play_z.md"]));
    const r = changesetCheck({ changed, changesets: [], config: houseCfg });
    expect(r.ok).toBe(false);
    expect(r.violations[0]).toMatch(/must carry a `minor` changeset/);
  });

  it("flags a new-play addition carrying only a patch changeset (0.<count>.1 drift)", () => {
    const changed = parseChanges(z(["A", "plays/099z/play_z.md"]));
    const r = changesetCheck({ changed, changesets: patchCs, config: houseCfg });
    expect(r.ok).toBe(false);
    expect(r.violations[0]).toMatch(/drifts to `0\.<count>\.1`/);
  });

  it("flags a new-play addition carrying only an empty changeset", () => {
    const changed = parseChanges(z(["A", "plays/099z/play_z.md"]));
    const r = changesetCheck({ changed, changesets: emptyCs, config: houseCfg });
    expect(r.ok).toBe(false);
    expect(r.violations[0]).toMatch(/must carry a `minor` changeset/);
  });

  it("flags a new-play addition carrying a major changeset (a house stays 0.x)", () => {
    const changed = parseChanges(z(["A", "plays/099z/play_z.md"]));
    const majorCs = [
      { file: ".changeset/j.md", entries: [{ package: "@scope/a", level: "major" }] },
    ];
    const r = changesetCheck({ changed, changesets: majorCs, config: houseCfg });
    expect(r.ok).toBe(false);
    expect(r.violations[0]).toMatch(/major/);
  });

  it("flags a content edit with no changeset", () => {
    const changed = parseChanges(z(["M", "plays/001/pitch_dread.md"]));
    const r = changesetCheck({ changed, changesets: [], config: houseCfg });
    expect(r.ok).toBe(false);
    expect(r.violations[0]).toMatch(/no changeset found/);
  });

  it("passes a content edit that carries a changeset", () => {
    const changed = parseChanges(z(["M", "plays/001/pitch_dread.md"]));
    expect(changesetCheck({ changed, changesets: patchCs, config: houseCfg }).ok).toBe(true);
  });

  it("treats a play file MODIFY (not add) as a normal change needing a changeset", () => {
    // Editing an existing play does not move the play count, so it is not count-driven.
    const changed = parseChanges(z(["M", "plays/001/play_frog.md"]));
    expect(changesetCheck({ changed, changesets: [], config: houseCfg }).ok).toBe(false);
  });

  it("with no policy configured, requires a changeset for any change", () => {
    const changed = parseChanges(z(["A", "plays/099z/play_z.md"]));
    const r = changesetCheck({ changed, changesets: [], config: resolveConfig({}) });
    expect(r.ok).toBe(false);
    expect(r.addsCountDriven).toBe(false);
  });

  it("validates a malformed changesetPolicy as a config error", () => {
    expect(() => resolveConfig({ changesetPolicy: { countDrivenAdd: "plays/**" } })).toThrow(
      /countDrivenAdd/,
    );
  });
});
