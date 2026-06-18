import { describe, it, expect } from "vitest";
import * as guard from "../index.mjs";

// Dormant until the source PR (changesetCheck + parseChanges) lands: a tests-first
// PR cut from a main that does not yet export them would otherwise fail to import.
// Once the source is on main, these activate. (The source/test-split rule.)
const DORMANT = typeof guard.changesetCheck !== "function";

const { changesetCheck, parseChanges, resolveConfig } = guard;

// A house's policy: adding a play file is what the play-count build versions on,
// so such an addition needs no changeset; everything else does.
const houseCfg = DORMANT
  ? {}
  : resolveConfig({ changesetPolicy: { countDrivenAdd: ["plays/*/play_*.md"] } });
const patchCs = [{ file: ".changeset/x.md", entries: [{ package: "@scope/a", level: "patch" }] }];

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
  it("passes a new-play addition with no changeset (version is count-driven)", () => {
    const changed = parseChanges(
      z(["A", "plays/099z/play_z.md"], ["A", "plays/099z/persona_x.md"]),
    );
    const r = changesetCheck({ changed, changesets: [], config: houseCfg });
    expect(r.ok).toBe(true);
    expect(r.addsCountDriven).toBe(true);
  });

  it("flags a new-play addition that ALSO carries a changeset (patch drift)", () => {
    const changed = parseChanges(z(["A", "plays/099z/play_z.md"]));
    const r = changesetCheck({ changed, changesets: patchCs, config: houseCfg });
    expect(r.ok).toBe(false);
    expect(r.violations[0]).toMatch(/play-count driven/);
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
