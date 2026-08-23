// The shared-work wall, held over this repo: khai owns the concept
// (findOverlaps / findUnresolvedNamesakes, packages/khai-tests/src/overlap.mjs),
// and this file is where the house holds the line, the same split the kit's own
// doc comment describes -- "the kit computes, the house holds the line."
//
// The rule (see CLAUDE.md "One phenomenon, one engine"): the same scholar
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
// to resolve per CLAUDE.md's own worked example. The rest of BASELINE is the
// same shape at smaller scale: a narrow paper one unit owns and a sibling unit
// leans on ("owned by X engine; used here"), which reads as reuse rather than
// a field's root shared by genuinely different mechanisms, so it was left off
// canon rather than risk disabling the wall for that work forever (a wrong
// canon entry is silent and permanent; a baseline entry is reversible).
//
// The ratchet: new overlaps fail loudly (a real regression -- an author who
// hit this should mark contrast, extend the incumbent, run
// `node packages/khai-tests/src/cli.mjs science overlap .` before authoring,
// or ask the maintainer to canon the work), removals are free (fixing
// a finding costs nothing here), and a BASELINE entry no longer reported is
// itself flagged stale -- the same dead-exemption spirit the guard already
// holds `licensePolicy` and `memberPolicy` to.
import { describe, it, expect } from "vitest";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findOverlaps, findUnresolvedNamesakes } from "../index.mjs";

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

describe("science overlap wall: the live corpus against the declared canon", () => {
  it("reports no overlap outside BASELINE", () => {
    const keys = findOverlaps(REPO).map((o) => o.key);
    const unbaselined = keys.filter((k) => !BASELINE.includes(k));
    expect(
      unbaselined,
      unbaselined.length
        ? `New shared work(s) outside BASELINE: ${unbaselined.join(", ")}. ` +
            'Read CLAUDE.md\'s "One phenomenon, one engine" rule, then run ' +
            "`node packages/khai-tests/src/cli.mjs science overlap .` before " +
            "authoring. Either mark the shared row contrast, extend the " +
            "incumbent's own warrant rather than restage it, or ask the " +
            "maintainer to add the work to workPolicy.canon if it is " +
            "genuinely a field's foundational text."
        : undefined,
    ).toEqual([]);
  });

  it("carries no stale BASELINE entry", () => {
    const keys = new Set(findOverlaps(REPO).map((o) => o.key));
    const stale = BASELINE.filter((k) => !keys.has(k));
    expect(
      stale,
      stale.length
        ? `BASELINE entries no longer reported (prune from this file): ${stale.join(", ")}`
        : undefined,
    ).toEqual([]);
  });
});

// The namesake wall: a surname declared in scholarPolicy.homonyms (#1300) may
// not appear in the index unresolved -- see khai-misfits/CLAUDE.md, which
// holds the same rule. This repo does not yet hold it at zero: 27 (scholar,
// unit) pairs are currently bare, spread across ~25 different engine and
// composite lanes, each of which owns its own REFERENCE(S).md Source cell and
// so can only be fixed inside that lane's own PR (adding the given name --
// e.g. "Tajfel & Turner" -> "Tajfel & John Turner" -- per CLAUDE.md's "cells
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

describe("science overlap wall: declared homonyms resolve in the live corpus", () => {
  it("reports no unresolved namesake outside NAMESAKE_BASELINE", () => {
    const keys = findUnresolvedNamesakes(REPO).map((r) => `${r.scholar} :: ${r.unit}`);
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

  it("carries no stale NAMESAKE_BASELINE entry", () => {
    const keys = new Set(findUnresolvedNamesakes(REPO).map((r) => `${r.scholar} :: ${r.unit}`));
    const stale = NAMESAKE_BASELINE.filter((k) => !keys.has(k));
    expect(
      stale,
      stale.length
        ? `NAMESAKE_BASELINE entries no longer reported (prune from this file): ${stale.join(", ")}`
        : undefined,
    ).toEqual([]);
  });
});
