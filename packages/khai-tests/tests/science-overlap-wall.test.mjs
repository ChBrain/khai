// The shared-work wall, held over this repo: khai owns the concept
// (findOverlaps / findUnresolvedNamesakes, packages/khai-tests/src/overlap.mjs),
// and this file is where the house holds the line, the same split the kit's own
// doc comment describes -- "the kit computes, the house holds the line."
//
// The rule (see AGENTS.md "One phenomenon, one engine"): the same scholar
// across different units is expected and is most of the index; the same
// (scholar, work) carrying the spine of two units is a finding. Two exits keep
// that honest, both declared in workPolicy in khai-guard.config.json:
//
//   canon   -- a field's foundational text, legitimately shared by several
//              engines each staging a different mechanism (Judgment under
//              Uncertainty across anchoring/availability/bias/decision/
//              representativeness; A Theory of Cognitive Dissonance across
//              belief/bias/dissonance; and so on -- seeded by this PR).
//   aliases -- left empty; nothing here needs the stem escape hatch.
//
// What canon does NOT cover is left as a genuine finding, and the wall below
// holds those at a ratcheted BASELINE rather than zero: differentiation and
// triangulation duplicate three whole Bowen family-therapy works between them
// (Family Evaluation, Family Therapy in Clinical Practice, Families and Family
// Therapy) -- that is spine-sharing, not canon, and is left for the maintainer
// to resolve per AGENTS.md's own worked example. The rest of BASELINE is the
// same shape at smaller scale: a narrow paper one unit owns and a sibling unit
// leans on ("owned by X engine; used here"), which reads as reuse rather than
// a field's root shared by genuinely different mechanisms, so it was left off
// canon rather than risk disabling the wall for that work forever (a wrong
// canon entry is silent and permanent; a baseline entry is reversible).
//
// The ratchet: new overlaps fail loudly (a real regression -- an author who
// hit this should mark contrast, extend the incumbent, run
// `node packages/khai-tests/src/cli.mjs science overlap .` before authoring,
// or ask the maintainer to canon the work), and removals are free (fixing
// a finding costs nothing here). A BASELINE entry no longer reported is
// WARNED about, never failed on: the baselines live in the governance lane
// while the fixes that shrink them ride engine lanes, and a wall that turns
// red on a fix made from a lane that cannot prune it is the axis lesson the
// Misfits house already learned -- a rule that cannot be obeyed from the
// branch it binds is a rule about the branch. Pruning stale entries is a
// governance sweep, prompted by the warning, not forced by a red main.
import { describe, it, expect } from "vitest";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findOverlaps, findUnresolvedNamesakes } from "../index.mjs";
import { collectUnits } from "../src/overlap.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

// `overlap.key` strings (`Scholar :: work-stem`), sorted -- the shape
// findOverlaps() itself sorts by. Regenerate with:
//   node packages/khai-tests/src/cli.mjs science overlap . --json
// after seeding a new canon entry or resolving a finding below.
const BASELINE = [
  "Bowen :: family evaluation",
  "Bowen :: family therapy in clinical practice",
  "Frederick :: hedonic adaptation",
  "Galanter :: why the haves come out ahead",
  "Haidt :: the righteous mind",
  "Highhouse :: stubborn reliance on intuition and subjectivity",
  "Hochschild :: the managed heart commercialization of human",
  "Kerr :: family evaluation",
  "Kopytoff :: the cultural biography of things",
  "Lerner :: the belief in a just world",
  "Loewenstein :: hedonic adaptation",
  "Lyell :: principles of geology",
  "Minuchin :: families and family therapy",
  "Polanyi :: the tacit dimension",
  "Snyder (Mark) :: self monitoring of expressive behavior",
  "Thompson (Emily) :: the soundscape of modernity",
  "Vaughan (Diane) :: the challenger launch decision",
].sort();

// The corpus the two walls below are read against. Both of them pass when they
// find nothing, so both of them pass when they are handed nothing -- a wall that
// is green on an empty corpus is not a wall. Neither BASELINE nor
// NAMESAKE_BASELINE can stand in for this check: a governance sweep may
// legitimately empty either one, so a count of findings proves nothing about
// whether the corpus was read. The unit count does.
const CORPUS = collectUnits(REPO);

describe("science overlap wall: the corpus is there to be walled", () => {
  it("reads the live corpus, so an empty result means no finding and not no data", () => {
    expect(CORPUS.units.length).toBeGreaterThan(300);
    expect(CORPUS.records.length).toBeGreaterThan(1000);
  });
});

// Scanned once per file, not once per test. Both tests below read the same
// corpus, and each `it()` gets its own 5s clock from vitest's default -- a
// budget sized for a unit test, not for reading 381 engines. Scanning at module
// level costs the same wall clock but is charged to the file's import instead of
// to a test, so a slow host can no longer turn a corpus read into a red wall.
// `unedited-scaffold.test.mjs` already collects its corpus this way.
const OVERLAP_KEYS = findOverlaps(REPO).map((o) => o.key);

describe("science overlap wall: the live corpus against the declared canon", () => {
  it("reports no overlap outside BASELINE", () => {
    const keys = OVERLAP_KEYS;
    const unbaselined = keys.filter((k) => !BASELINE.includes(k));
    expect(
      unbaselined,
      unbaselined.length
        ? `New shared work(s) outside BASELINE: ${unbaselined.join(", ")}. ` +
            'Read AGENTS.md\'s "One phenomenon, one engine" rule, then run ' +
            "`node packages/khai-tests/src/cli.mjs science overlap .` before " +
            "authoring. Either mark the shared row contrast, extend the " +
            "incumbent's own warrant rather than restage it, or ask the " +
            "maintainer to add the work to workPolicy.canon if it is " +
            "genuinely a field's foundational text."
        : undefined,
    ).toEqual([]);
  });

  it("warns on stale BASELINE entries (pruned by a governance sweep, never a wall)", () => {
    const keys = new Set(OVERLAP_KEYS);
    const stale = BASELINE.filter((k) => !keys.has(k));
    // A warning, not a failure: the fix that removes an overlap rides an
    // engine lane, and this file is governance -- failing here would demand a
    // change the fixing branch is not allowed to carry.
    if (stale.length)
      console.warn(
        `science-overlap-wall: stale BASELINE entr${stale.length === 1 ? "y" : "ies"} ` +
          `(prune in a governance sweep): ${stale.join(", ")}`,
      );
    expect(true).toBe(true);
  });
});

// The namesake wall: a surname declared in scholarPolicy.homonyms (#1300) may
// not appear in the index unresolved -- see khai-misfits/CLAUDE.md, which
// holds the same rule. This repo does not yet hold it at zero: 27 (scholar,
// unit) pairs are currently bare, spread across ~25 different engine and
// composite lanes, each of which owns its own REFERENCE(S).md Source cell and
// so can only be fixed inside that lane's own PR (adding the given name --
// e.g. "Tajfel & Turner" -> "Tajfel & John Turner" -- per khai-misfits/CLAUDE.md's "cells
// go first" rule), never from this governance branch. Ratcheted for the same
// reason as the overlap wall above: a hard zero here would fail loudly for
// pre-existing debt this PR cannot honestly resolve, while a silent skip
// would hide it. Regenerate with:
//   node -e 'import("./packages/khai-tests/src/overlap.mjs").then(({findUnresolvedNamesakes})=>console.log(JSON.stringify(findUnresolvedNamesakes(".").map(r=>`${r.scholar} :: ${r.unit}`).sort())))'
const NAMESAKE_BASELINE = [
  "Brehm :: swaying",
  "Campbell :: bidding",
  "Davis :: dealing",
  "Davis :: trust",
  "Gollwitzer :: reprisal",
  "Johnson :: search-space",
  "Klein :: transference",
  "Lennon :: carrying",
  "Miller :: anger",
  "Park :: role-exit",
  "Quinn :: org",
  "Robinson :: desire",
  "Ross :: assent",
  "Ross :: belief",
  "Snyder :: hope",
  "Snyder :: prospection",
  "Solomon :: attachment",
  "Solomon :: mortality",
  "Stone :: clime",
  "Thompson :: meridian",
  "Thompson :: social-time",
  "Turner :: bias",
  "Turner :: identity",
  "Wang :: deserving",
  "Watson :: joy",
  "Watson :: mood",
  "Wilson :: praise",
].sort();

// Once per file, for the same reason as OVERLAP_KEYS above.
const NAMESAKE_KEYS = findUnresolvedNamesakes(REPO).map((r) => `${r.scholar} :: ${r.unit}`);

describe("science overlap wall: declared homonyms resolve in the live corpus", () => {
  it("reports no unresolved namesake outside NAMESAKE_BASELINE", () => {
    const keys = NAMESAKE_KEYS;
    const unbaselined = keys.filter((k) => !NAMESAKE_BASELINE.includes(k));
    expect(
      unbaselined,
      unbaselined.length
        ? `New unresolved namesake(s): ${unbaselined.join(", ")}. Write the given ` +
            "name into that unit's own Origin table Source cell (its own lane), " +
            'per khai-misfits/CLAUDE.md\'s "cells go first" rule.'
        : undefined,
    ).toEqual([]);
  });

  it("warns on stale NAMESAKE_BASELINE entries (pruned by a governance sweep, never a wall)", () => {
    const keys = new Set(NAMESAKE_KEYS);
    const stale = NAMESAKE_BASELINE.filter((k) => !keys.has(k));
    // Same shape as the overlap wall above: a Source-cell fix that resolves a
    // namesake rides the engine's own lane and cannot prune this file.
    if (stale.length)
      console.warn(
        `science-overlap-wall: stale NAMESAKE_BASELINE entr${stale.length === 1 ? "y" : "ies"} ` +
          `(prune in a governance sweep): ${stale.join(", ")}`,
      );
    expect(true).toBe(true);
  });
});
