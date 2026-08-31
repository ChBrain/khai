// The non-author Source declaration, read as a vocabulary rather than a list.
//
// `originRowErrors` closes a silence: a Source cell that yields no scholar used
// to VANISH from the science index, taking its citation with it (a composite
// lost five scholars that way, and every gate stayed green). The wall makes such
// a row declare itself in `scholarPolicy.nonAuthorSources`, which is right for
// khai, whose tree holds six such rows and can list them as strings.
//
// It is unadoptable by a house that writes an intentional non-author class as a
// convention. Measured against khai-misfits' real corpus (every
// misfits/*/REFERENCE.md Origin chapter): 499 errors, 352 DISTINCT Source
// values, 268 misfits affected. 120 of them are "Practitioner", the kit's own
// anticipated case; the ~379-row long tail is that house's documented
// convention, a Source cell that deliberately names no person -- "Boundary of
// the effect", "The measurement dispute", "Whether any settlement reaches it",
// "Why the namer cannot be neutral". Declaring 352 strings is exactly the
// "closed list of the NON_AUTHOR kind ... a list to maintain" that house's
// ruling forbids, and rewriting those cells is a sweep its doctrine forbids too.
//
// So an entry may be a PATTERN as well as a string, and a house declares its
// convention as one rule. This is the shape `workPolicy.contrastMarkers`
// already has: a declared vocabulary for an intentional class, authored by the
// person who knows the class, never inferred from the prose. The wall keeps its
// prey -- an undeclared "Cognitive-behavioral model" still fails -- because a
// pattern exempts what it names and nothing else.
//
// Dormant until the source PR lands `matchesNonAuthor` (source and tests are
// separate PRs; this one is green and mergeable first). The sentinel is a typeof
// probe on the export, never a grep of the source prose: prose can be written
// before the behaviour exists, and an export cannot.

import { describe, it, expect } from "vitest";
import * as S from "../src/science.mjs";

const DORMANT = typeof S.matchesNonAuthor !== "function";

// A three-cell Origin row, so a table can be written inline as its rows.
const row = (source) => `| ${source} | Key Work | Scope |`;
const table = (...sources) =>
  ["| Source | Key Work | Scope |", "| :--- | :--- | :--- |", ...sources.map(row)].join("\n");

// The house convention as one rule: the leading function words a Source takes
// when it names no person on purpose.
const CONVENTION = "/^(The|Whether|Why|What|How) /";

describe.skipIf(DORMANT)("matchesNonAuthor: the string entry is unchanged", () => {
  it("matches exactly, case-insensitively, after qualifier stripping", () => {
    // Today's semantics for a plain entry, kept: an exact match on the Source
    // with its parenthetical qualifier stripped, compared without case. This is
    // what lets one declared "Practitioner" cover the 120 rows that write it
    // with a field: the qualifier is not part of what was declared.
    expect(S.matchesNonAuthor("Practitioner", ["Practitioner"])).toBe(true);
    expect(S.matchesNonAuthor("practitioner", ["Practitioner"])).toBe(true);
    expect(S.matchesNonAuthor("Practitioner (medicine)", ["Practitioner"])).toBe(true);
    // And it stays an EXACT match, not a substring one: a Source that merely
    // contains the declared string is not declared.
    expect(S.matchesNonAuthor("Practitioner error rates", ["Practitioner"])).toBe(false);
    expect(S.matchesNonAuthor("Nosology", ["Practitioner"])).toBe(false);
    // khai's own six entries include parentheticals of their own, so the
    // stripping is applied to BOTH sides: an entry written with its qualifier
    // still matches the cell it was written for.
    expect(
      S.matchesNonAuthor("Leonid meteor storm records (1833)", [
        "Leonid meteor storm records (1833)",
      ]),
    ).toBe(true);
  });
});

describe.skipIf(DORMANT)("matchesNonAuthor: a pattern entry, and what it does not reach", () => {
  it("exempts the declared convention and still catches the wall's original prey", () => {
    // The load-bearing test. One rule stands in for the ~355-row long tail...
    expect(S.matchesNonAuthor("The measurement dispute", [CONVENTION])).toBe(true);
    expect(S.matchesNonAuthor("Whether any settlement reaches it", [CONVENTION])).toBe(true);
    expect(S.matchesNonAuthor("Why the namer cannot be neutral", [CONVENTION])).toBe(true);
    // ...and reaches nothing else. "Cognitive-behavioral model" and "Clinical
    // presentation" are the two rows that vanished, taking Frost, Hartl and
    // Steketee with them; "Nosology" is the one that survived, filed among real
    // people as though it were a surname. A pattern that exempted these would
    // have bought the house's convention at the price of the wall, which is the
    // whole thing being protected.
    expect(S.matchesNonAuthor("Nosology", [CONVENTION])).toBe(false);
    expect(S.matchesNonAuthor("Cognitive-behavioral model", [CONVENTION])).toBe(false);
    expect(S.matchesNonAuthor("Clinical presentation", [CONVENTION])).toBe(false);
  });

  it("is case-insensitive, because the pattern is compiled with the i flag", () => {
    // Pinned explicitly so nobody meets it as a surprise later: /^The / reaches
    // a Source written "the standing dispute". A house wanting the capital to
    // be load-bearing cannot get it from this grammar, and should say so here
    // rather than discover it from a row that slipped through.
    expect(S.matchesNonAuthor("the standing dispute", ["/^The /"])).toBe(true);
    expect(S.matchesNonAuthor("THE STANDING DISPUTE", ["/^The /"])).toBe(true);
    expect(S.matchesNonAuthor("Theory of the firm", ["/^The /"])).toBe(false); // no space
  });

  it("takes only leading AND trailing slashes: a slash in the middle is a string", () => {
    // khai's own declared "NFPA / DOE hydrogen safety" carries a slash and is
    // not a pattern. Read as a regex it would match unanchored, so a Source
    // merely containing it would be exempt; read as the string it is, only the
    // cell itself is.
    const entry = ["NFPA / DOE hydrogen safety"];
    expect(S.matchesNonAuthor("NFPA / DOE hydrogen safety", entry)).toBe(true);
    expect(S.matchesNonAuthor("Extra NFPA / DOE hydrogen safety notes", entry)).toBe(false);
    // A leading slash alone, or a trailing one alone, is likewise a string.
    expect(S.matchesNonAuthor("Nosology", ["/^N"])).toBe(false);
    expect(S.matchesNonAuthor("Nosology", ["^N/"])).toBe(false);
  });

  it('takes a body: "/" and "//" are strings, not the match-everything pattern', () => {
    // The degenerate cases, pinned because their regex readings are the most
    // dangerous ones available: an empty pattern matches every Source, which
    // would silently disarm the wall for the whole house.
    expect(S.matchesNonAuthor("Nosology", ["/"])).toBe(false);
    expect(S.matchesNonAuthor("Nosology", ["//"])).toBe(false);
    expect(S.matchesNonAuthor("/", ["/"])).toBe(true); // as a string, it matches itself
    expect(S.matchesNonAuthor("//", ["//"])).toBe(true);
  });

  it("throws on an invalid pattern, naming the entry", () => {
    // Loud, never a silent skip. A pattern that cannot compile declares nothing,
    // and a vocabulary declared where nothing reads it is indistinguishable from
    // a vocabulary nobody has used yet -- this repo has already paid for that
    // once, in a work policy whose loader dropped the key it was given. So the
    // fault is raised at the config, not absorbed into a clean count.
    expect(() => S.matchesNonAuthor("Nosology", ["/([/"])).toThrow(/\/\(\[\//);
    expect(() => S.matchesNonAuthor("Nosology", ["/([/"])).toThrow(/nonAuthorSources/);
  });
});

describe.skipIf(DORMANT)("originRowErrors: the two entry kinds over one Origin table", () => {
  it("passes the scholar, the string entry and the pattern entry, and names the undeclared row", () => {
    const origin = table(
      "Daniel Kahneman & Amos Tversky", // a real scholar: the index keys it
      "Practitioner (medicine)", // a string entry, qualifier and all
      "The measurement dispute", // the house convention, one pattern entry
      "Cognitive-behavioral model", // undeclared: the wall's prey, still caught
    );
    const out = S.originRowErrors(origin, ["Practitioner", CONVENTION]);
    expect(out).toHaveLength(1);
    expect(out[0]).toContain("Cognitive-behavioral model");
    expect(out[0]).toContain("nonAuthorSources");
  });

  it("still flags every no-scholar row when nothing is declared", () => {
    const origin = table(
      "Practitioner (medicine)",
      "The measurement dispute",
      "Cognitive-behavioral model",
    );
    expect(S.originRowErrors(origin, [])).toHaveLength(3);
  });

  it("leaves the pseudo-surname row alone, here as everywhere: it is a different fault", () => {
    // "Nosology" is the row that SURVIVED the vanishing, filed among real people
    // as though it were a surname, and this wall has never caught it: it yields
    // an uppercase token, so `surnames` keys it and the row is not dropped. It
    // belongs here anyway, because the pattern grammar's one real risk is a rule
    // loose enough to sweep it up alongside the convention -- which is what the
    // matchesNonAuthor suite above pins, and this row proves the wall's reach is
    // unchanged in the other direction too.
    expect(S.originRowErrors(table("Nosology"), [])).toEqual([]);
  });

  it("raises an invalid pattern even over a table with no failing row", () => {
    // The config fault is a fault whatever the corpus happens to hold, so it
    // does not wait for a row to trip it: a house that mistypes its convention
    // must be told on the build that introduced it, not on the misfit that
    // eventually needed it.
    expect(() => S.originRowErrors(table("Daniel Kahneman"), ["/([/"])).toThrow(/\/\(\[\//);
  });
});
