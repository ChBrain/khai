// Cross-unit walls and probes on the science index's OWN key computation, the
// second question every khai surface resting on research asks after
// overlap.mjs's shared-work wall. That wall asks "is this science already
// carried elsewhere?"; this module asks "did the index compute the right
// key at all?" -- a declared homonym form nothing can reach, an index key
// that is a generational suffix rather than a surname, and (a house-specific
// but kit-owned concept) two units on one axis that contradict each other
// without saying so.
//
// Walls here exit 1 on a computed defect and never on nothing (conduct.md
// law 5); probes report and always exit 0, because what they find is a
// reading list for a person, never a verdict a script can make (the same
// house that first built these put it plainly: "where a defect is a
// judgement about what a cell means, build something that finds it and leave
// the deciding to a person; where a defect is a computation that can be
// checked, build a wall").
//
// A note on two of the three walls, worth keeping honest rather than copying
// the case that first motivated them: `findShadowedForms` and
// `findSuffixKeys` were written against an OLDER build that resolved a
// homonym by first match and kept a generational suffix as the surname. This
// module's own science.mjs resolves by LONGEST match (order-independent) and
// strips a trailing suffix before taking the surname, so on this build
// neither wall reports the unreachable-person defect its origin story
// describes. What each wall still catches is smaller and real: a declaration
// order that reads as first-match to anyone who has not read this comment
// (findShadowedForms), and a Source cell that is nothing but a suffix, with
// no name at all for the build to key on (findSuffixKeys). Both are kept as
// walls because a corpus this size is exactly where a maintainer's mental
// model of "first match" is more common than the code, and because a
// suffix-only Source is a citation with no author to find under any key.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseDoc } from "@chbrain/khai-rules";
import { SUFFIXES, unitDirs, unitWarrant } from "./science.mjs";
import { collectUnits, normaliseWork, isContrast, roleOf, workMatches } from "./overlap.mjs";
import { resolveCollectionAt } from "./collection.mjs";

// --- 1. findShadowedForms: a homonym declaration order that misleads --------

/**
 * A declared given-name form that is a space-prefix of a LATER form in the
 * same `scholarPolicy.homonyms[surname]` array (`["David", "David L"]`): a
 * maintainer reading the array left to right expects first match to win, and
 * an entry that can never be the FIRST match for its own citations reads as
 * dead. Pure function over the scholar policy -- `scholarPolicy(root)` in
 * science.mjs, the same shape `loadWorkPolicy` returns for work policy -- so
 * it takes no filesystem argument and needs no fixture beyond a plain object.
 *
 * The fix is always a reorder, longest form first, never a deletion: the form
 * still resolves correctly today (science.mjs keys by longest match,
 * order-independently), this wall is about what the array COMMUNICATES to
 * the next person who edits it, not about a citation the build gets wrong.
 */
export function findShadowedForms(policy = {}) {
  const homonyms = policy?.homonyms ?? {};
  const shadowed = [];
  for (const [surname, forms] of Object.entries(homonyms)) {
    if (!Array.isArray(forms)) continue;
    forms.forEach((form, j) => {
      for (let i = 0; i < j; i++) {
        if (form.startsWith(`${forms[i]} `)) shadowed.push({ surname, form, shadowedBy: forms[i] });
      }
    });
  }
  return shadowed.sort(
    (a, b) => a.surname.localeCompare(b.surname) || a.form.localeCompare(b.form),
  );
}

// --- 2. findSuffixKeys: an index key that is a generational suffix ---------

/**
 * An index key (surname half only -- a declared `Surname (Form)` resolution
 * is stripped back to the bare surname first) whose whole text is a
 * generational suffix (Jr, Sr, II, III, IV, and their variants: the same
 * closed `SUFFIXES` list science.mjs strips before ever taking a surname).
 *
 * `nameTokens` in science.mjs only ever keeps a suffix as the surname when
 * the author part carries NOTHING else -- "a part that is nothing but a
 * suffix keeps it, so the uppercase-initial rule still sees a token and the
 * row is not silently dropped" -- so a hit here is a Source cell that names a
 * suffix and no person: drop the suffix from the cell and put the actual name
 * in its place, there is nothing to reorder.
 *
 * Takes the live index -- `collectUnits(root).records`, the same records the
 * shared-work wall reads -- rather than the rendered docs/SCIENCE.md, so it
 * can never see a key the current build would not itself produce.
 */
export function findSuffixKeys(index) {
  const bad = [];
  for (const r of index) {
    const bare = r.surname
      .replace(/\s*\(.*\)$/, "")
      .replace(/[.,]/g, "")
      .toLowerCase();
    if (SUFFIXES.has(bare)) bad.push({ key: r.surname, unit: r.unit, work: r.keyWork });
  }
  return bad.sort((a, b) => a.key.localeCompare(b.key) || a.unit.localeCompare(b.unit));
}

// --- 3. Axis opposition: two units that contradict without saying so -------
//
// Every other instrument here (and in overlap.mjs) catches units that agree
// too much. Nothing catches the opposite failure -- two units that make
// opposite claims about the same quantity -- because what makes them
// contradict is that they draw on different literatures, which is exactly
// what lets them pass a shared-work check. So the opposition is declared
// once, in the unit's own warrant frontmatter, and checked forever:
//
//   ---
//   axis: population-density
//   sign: negative   # how the outcome moves as that quantity rises
//   ---
//
// Two units on one axis with opposite signs are in conflict and must each
// name the other. The declaration lives in the warrant (never in
// khai-guard.config.json, which is the governance lane a new unit's own pull
// request cannot reach) and is read from the SAME per-unit walk the science
// build already runs for a collection house: `resolveCollectionAt` plus
// `unitDirs`/`unitWarrant` from science.mjs. A root that declares no
// collection resolves to the default ("plays"), which is empty on a root
// that has no `plays/` directory -- reporting cleanly rather than reaching
// for a second, engine-shaped walk this concept was never asked to cover.

/** The `axis:`/`sign:` frontmatter of a warrant, trailing `# comment` legal. */
function axisFrontmatter(text) {
  const head = text.split("---")[1] || "";
  const axis = (head.match(/^axis:\s*(\S+)\s*(?:#.*)?$/m) || [])[1];
  const sign = (head.match(/^sign:\s*(\S+)\s*(?:#.*)?$/m) || [])[1];
  return { axis, sign };
}

/**
 * Every unit that declares an axis and/or a sign, whichever collection
 * `house` resolves to. Only units declaring at least one of the two keys are
 * returned -- an undeclared unit is invisible here exactly as it is to the
 * house that first built this (coverage is a ratchet, not an assumption).
 *
 * Each record carries the unit's `title` -- read from the collection's own
 * anchor file frontmatter, the same field `registry.json`'s build reads for
 * every item (see `buildItems` in registry.mjs) -- and the warrant's raw
 * `text`, so `findOpposed` can ask whether one unit's warrant names the
 * other's title without re-reading the tree.
 */
export function axesOf(house) {
  const collection = resolveCollectionAt(house);
  const out = [];
  for (const { id, dir } of unitDirs(house, collection)) {
    const warrantPath = unitWarrant(dir);
    if (!warrantPath) continue;
    const text = readFileSync(warrantPath, "utf8");
    const { axis, sign } = axisFrontmatter(text);
    if (!axis && !sign) continue;

    let title = id;
    const anchorName = readdirSync(dir).find(
      (f) => f.startsWith(collection.anchor) && f.endsWith(".md"),
    );
    if (anchorName) {
      const doc = parseDoc(readFileSync(join(dir, anchorName), "utf8"));
      if (typeof doc.data?.title === "string" && doc.data.title.trim()) title = doc.data.title;
    }
    out.push({ id, axis, sign, title, text });
  }
  return out;
}

/**
 * A malformed axis declaration: an axis without a sign, a sign without an
 * axis, or a sign that is neither `positive` nor `negative`. Fails outright
 * rather than ratcheting -- there is no legacy set of half-written
 * declarations to grandfather, since a declaration that reads as covered and
 * checks nothing is worse than an absent one.
 */
export function findMalformedAxes(axes) {
  const bad = [];
  for (const r of axes) {
    if (!r.axis) bad.push(`${r.id}: sign without axis`);
    else if (!r.sign) bad.push(`${r.id}: axis without sign`);
    else if (r.sign !== "positive" && r.sign !== "negative")
      bad.push(`${r.id}: sign is "${r.sign}", expected positive or negative`);
  }
  return bad.sort();
}

/**
 * Opposed pairs that do NOT each name the other: two well-formed axis
 * declarations sharing one axis with opposite signs, where at least one
 * side's warrant text does not contain the other side's title. A pair that
 * already names each other both ways is the declared, resolved case this
 * wall exists to require, not a finding -- so a clean root returns [].
 *
 * A malformed record (see findMalformedAxes) is excluded from the pairing:
 * an axis without a sign has no sign to oppose, and a bad sign is not
 * `positive` or `negative` to begin with.
 */
export function findOpposed(axes) {
  const wellFormed = axes.filter((r) => r.axis && (r.sign === "positive" || r.sign === "negative"));
  const out = [];
  for (let i = 0; i < wellFormed.length; i++) {
    for (let j = i + 1; j < wellFormed.length; j++) {
      const a = wellFormed[i];
      const b = wellFormed[j];
      if (a.axis !== b.axis || a.sign === b.sign) continue;
      const aNamesB = !!b.title && a.text.includes(b.title);
      const bNamesA = !!a.title && b.text.includes(a.title);
      if (aNamesB && bNamesA) continue;
      out.push({ axis: a.axis, a: a.id, b: b.id, aNamesB, bNamesA });
    }
  }
  return out.sort(
    (x, y) => x.axis.localeCompare(y.axis) || x.a.localeCompare(y.a) || x.b.localeCompare(y.b),
  );
}

// --- 4-6. Probes: reading lists, never verdicts ----------------------------
//
// Every namesake wall in overlap.mjs (findUnresolvedNamesakes) reads the
// index AFTER a homonym is declared -- it can only see a surname already
// declared and left bare. None of them scans for a surname that OUGHT to be
// declared and is not, because an undeclared surname collates: several
// people under one key look exactly like one person across several works,
// which is the expected, common, and unowed case. So these two probes read
// only what an author already wrote beside a surname, name no verdict, and
// always exit 0 -- a hit is a cell to read, not a finding.

const NON_GIVEN = new Set(["the", "and", "et", "al", "eds", "ed"]);

/** The given-name evidence a Source cell carries for one surname, or "". */
function givenFor(source, surname) {
  const parts = String(source)
    .replace(/\bet al\.?/gi, "")
    .split(/[,;&]|\s+and\s+/i)
    .map((x) =>
      x
        .replace(/\([^()]*\)/g, " ")
        .replace(/[.]/g, "")
        .trim(),
    )
    .filter(Boolean);
  for (const part of parts) {
    const tokens = part.split(/\s+/).filter(Boolean);
    const tail = tokens.slice(-surname.split(" ").length).join(" ");
    if (tail.toLowerCase() !== surname.toLowerCase()) continue;
    const given = tokens
      .slice(0, tokens.length - surname.split(" ").length)
      .filter((t) => !NON_GIVEN.has(t.toLowerCase()))
      .join(" ")
      .trim();
    if (given) return given;
  }
  return "";
}

/**
 * Two given forms are one person when one is a token-prefix of the other
 * ("Timothy" absorbs "Timothy D"), the same rule a declared homonym form uses
 * in the build. Comparing on token boundaries and not on characters is what
 * keeps "Robert" and "Roberto" apart.
 */
function sameGiven(a, b) {
  const [x, y] = a.length <= b.length ? [a, b] : [b, a];
  return x === y || y.startsWith(x + " ");
}

/**
 * Undeclared surnames whose OWN Source cells already name more than one
 * person: the probe run BEFORE a homonym declaration, since every namesake
 * wall in overlap.mjs runs after one and an undeclared surname collates,
 * rendering several people under one key as one prolific scholar. `index` is
 * `collectUnits(root).records`; `policy` is `scholarPolicy(root)` (or any
 * object shaped `{ homonyms }`) -- a surname already declared there is
 * excluded, since it is under the namesake wall already.
 *
 * Reports a LOWER bound: it needs two NAMED cells to report a surname at
 * all, so a namesake whose counterpart sits in a bare cell (no given name in
 * the Source at all) is invisible here -- that complement is `mixedCells`.
 */
export function undeclaredNamesakes(index, policy = {}) {
  const declared = new Set(Object.keys(policy?.homonyms ?? {}));
  const bySurname = new Map();
  for (const r of index) {
    if (declared.has(r.surname)) continue;
    const given = givenFor(r.source, r.surname);
    if (!given) continue;
    if (!bySurname.has(r.surname)) bySurname.set(r.surname, []);
    bySurname.get(r.surname).push({ given, unit: r.unit, work: r.keyWork });
  }

  const found = [];
  for (const [surname, rows] of bySurname) {
    const people = [];
    for (const row of rows) {
      const hit = people.find((p) => sameGiven(p.given, row.given));
      if (hit) {
        if (row.given.length > hit.given.length) hit.given = row.given;
        hit.rows.push(row);
      } else people.push({ given: row.given, rows: [row] });
    }
    if (people.length < 2) continue;
    if (new Set(rows.map((r) => r.unit)).size < 2) continue;
    found.push({ surname, people: people.sort((a, b) => a.given.localeCompare(b.given)) });
  }
  return found.sort(
    (a, b) => b.people.length - a.people.length || a.surname.localeCompare(b.surname),
  );
}

/**
 * The complement of `undeclaredNamesakes`: undeclared surnames whose cells
 * mix a NAMED one with a BARE one. A namesake hiding behind a bare cell (no
 * given name written at all -- "Diamond & Dybvig") is invisible to the probe
 * above, which needs two named cells to report anything; this is where such
 * a namesake would be hiding. It is a reading list and not a finding count:
 * almost every surname it returns is a single scholar an author happened to
 * name in one cell and not another, which owes nothing.
 */
export function mixedCells(index, policy = {}) {
  const declared = new Set(Object.keys(policy?.homonyms ?? {}));
  const bySurname = new Map();
  for (const r of index) {
    if (declared.has(r.surname)) continue;
    if (!bySurname.has(r.surname)) bySurname.set(r.surname, []);
    bySurname.get(r.surname).push({ given: givenFor(r.source, r.surname), unit: r.unit });
  }

  const found = [];
  for (const [surname, rows] of bySurname) {
    const named = rows.filter((r) => r.given);
    const bare = rows.filter((r) => !r.given);
    if (!named.length || !bare.length) continue;
    if (new Set(rows.map((r) => r.unit)).size < 2) continue;
    found.push({
      surname,
      named: [...new Set(named.map((r) => r.given))].sort(),
      bare: [...new Set(bare.map((r) => r.unit))].sort(),
    });
  }
  return found.sort((a, b) => b.bare.length - a.bare.length || a.surname.localeCompare(b.surname));
}

/**
 * Works hidden behind a semicolon in a Key Work cell that collide with a work
 * another unit already holds as its FIRST work. `normaliseWork` takes only
 * `.split(";")[0]`, which is right for the common case (the tail is a gloss,
 * an edition, a translation, a prize) and wrong when the tail is a SECOND
 * work: that work never enters the index, so `checkCandidate` answers a true
 * clear to a false question and `findOverlaps` never gets to adjudicate it.
 *
 * This is not a wall: whether a hidden work is a shared spine, a field's
 * canon, a row cited to hold a line, or one unit's background is exactly the
 * judgement `workPolicy` exists to make, and it cannot be made on a work
 * nobody can see. So this surfaces the determinations that were never put,
 * with the exemptions each side already carries (via the kit's own
 * `isContrast`/`roleOf`, so it can never drift from the wall it is reporting
 * the blind spot of), and leaves the deciding where it belongs.
 *
 * Takes `house` (not the records directly) because it needs `collectUnits`
 * itself, to build both the raw compound cells and the already-indexed
 * first-work map from one root; `policy` is `loadWorkPolicy(house)`.
 */
export function compoundWorks(house, policy) {
  const markers = policy.contrastMarkers || [];
  const canon = new Set((policy.canon || []).map((c) => normaliseWork(c)));
  const { records } = collectUnits(house);

  const indexed = new Map(); // stem -> records citing it as their first work
  for (const r of records) {
    const stem = normaliseWork(r.keyWork, policy.aliases);
    if (!indexed.has(stem)) indexed.set(stem, []);
    indexed.get(stem).push(r);
  }

  // One finding per (unit, hidden work, units already holding it) -- keying
  // on that rather than the record pair, since a work held by a unit across
  // three rows is one question, not three.
  const found = new Map();
  for (const r of records) {
    const parts = String(r.keyWork).split(";");
    if (parts.length < 2) continue;
    for (const tail of parts.slice(1)) {
      const stem = normaliseWork(tail, policy.aliases);
      if (stem.split(" ").filter(Boolean).length < 2) continue;
      for (const [istem, holders] of indexed) {
        if (!workMatches(stem, istem)) continue;
        const others = holders.filter((h) => h.unit !== r.unit);
        if (!others.length) continue;
        // Contrast/support is a property of a row, and this collision has
        // two sides, so both must be asked: reading only the hiding row
        // would report a contrast the wall would exempt when only the
        // OTHER side declared it.
        const key = `${r.unit}::${stem}`;
        const prior = found.get(key);
        const units = new Set([...(prior?.holders || []), ...others.map((o) => o.unit)]);
        const heldAsContrast = others.every((o) => isContrast(o, markers));
        const heldAsSupport = others.every((o) => roleOf(o, policy) === "support");
        found.set(key, {
          unit: r.unit,
          hidden: tail.trim(),
          stem,
          indexedStem: istem,
          holders: [...units].sort(),
          canon: prior?.canon || canon.has(stem) || canon.has(istem),
          contrast: isContrast(r, markers) || heldAsContrast,
          supporting: roleOf(r, policy) === "support" || heldAsSupport,
        });
      }
    }
  }
  return [...found.values()].sort((a, b) => (a.unit + a.stem).localeCompare(b.unit + b.stem));
}
