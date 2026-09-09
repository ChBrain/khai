// Science keying and overlap: the cross-unit warrant instruments.
//
// Every khai surface that rests on a body of research — atom engines and
// composites in the monorepo, content units in a collection house — authors a
// per-unit warrant (an Origin table in REFERENCES.md / REFERENCE.md). Each
// per-unit gate asks "is this unit well-formed?"; nothing per-unit can ask
// "is this science already carried elsewhere in this root?". That question is
// cross-unit, and it is the same question in every shape, so it is answered
// here, once, in the kit: khai owns the concept, and a house configures it
// rather than reimplementing it.
//
// The rule is computed, not judged: the same scholar across different works is
// expected and is most of any index; the same (scholar, work) carrying the
// spine of two units is a finding. Three configured exits keep the rule honest,
// all declared in `workPolicy` in the root's khai-guard.config.json:
//
//   canon             -- a field's foundational work, which many units in one
//                        family may legitimately share.
//   contrastMarkers   -- the vocabulary that marks a work cited to hold a line
//                        rather than to carry one ("cited to distinguish").
//   supportingMarkers -- the vocabulary that marks a work as a unit's
//                        background rather than its spine ("cited as
//                        background"). The rule is about a work carrying TWO
//                        spines, so one side declaring it is not one answers it.
//   delegateMarkers   -- the vocabulary that names another unit as the owner of
//                        this work's spine ("owned by the third-place engine").
//                        Unlike the three above, this one is CHECKED against the
//                        corpus, so it is the only exit that can be refuted.
//
// `canon` is the odd one out and is on its way out: it exempts a work rather
// than describing a citation, which `docs/BOUNDARY.md` ("A worked relocation")
// rules is a per-citation fact written where no unit's own PR can reach it. It
// hides 84 findings that the three declarations above are meant to replace, and
// it retires as those land -- may only shrink, and no entry that hides nothing.
//
// Source of truth is the collector the science build itself runs on
// (collectScience / collectCollectionScience), NOT the rendered docs/SCIENCE.md
// markdown: one code path for the build and the checks, so a renderer change
// can never desynchronise them, and the drift gate already holds the rendered
// index to a fresh build of the same records.
//
// The instruments:
//
//   findOverlaps(root)              the shared-work wall (a house's test
//                                   asserts it holds at zero)
//   checkCandidate(root, spec)      pre-authoring advisory: does this
//                                   "Scholar :: Work" spine already anchor a
//                                   unit? Matches loosely on purpose — for an
//                                   advisory the only expensive failure is a
//                                   false clear.
//   scanSurname(root, name)         is this surname anywhere in the index,
//                                   bare or declared? The scan `--check` could
//                                   never answer: given a bare surname it
//                                   matched no work and reported a true but
//                                   misleading clear.
//   findUnresolvedNamesakes(root)   a surname declared in
//                                   scholarPolicy.homonyms may not appear in
//                                   the index unresolved.
//   findUnverifiedDelegations(root) a delegation naming an owner that does not
//                                   hold the work. A wall in waiting: reported
//                                   while the corpus still carries known-bad
//                                   rows, walled when the count reaches zero.
//   findSharedLoci(root)            the reading list the wall refuses to
//                                   decide: one work spining several units
//                                   under different declared loci.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { collectScience, collectCollectionScience, scholarHomonyms } from "./science.mjs";
import { findGuardConfig } from "./guard-config.mjs";
import { safePackageJson, resolveCollection, collectionKind } from "./collection.mjs";

// The default contrast vocabulary: the convention houses already write in
// prose, promoted to terms the check can read. A root extends or replaces the
// list in workPolicy.contrastMarkers.
const DEFAULT_CONTRAST_MARKERS = [
  "cited to distinguish",
  "cited to mark the line",
  "distinction only",
  "distinction.",
  "the neighbour, held clear",
  "the cousin, and the difference",
  "the classical effect it is named against",
  "held near",
  "held clear",
  "(contrast)",
];

// The default support vocabulary, the same shape as the contrast list above and
// for the same reason: houses were already writing this in prose before there
// was a term for it. A root extends or replaces the list in
// workPolicy.supportingMarkers.
//
// Why the marker form exists at all when `**Support.**` already declares the
// role: the prefix must LEAD the cell, which is right for a cell an author is
// writing now and wrong for the hundreds already written, where the phrase sits
// mid-sentence. Both forms mean one thing and both reach the same wall.
const DEFAULT_SUPPORTING_MARKERS = [
  "cited as background",
  "background, not the spine",
  "(background)",
];

// A citation's role, declared rather than sniffed. The house already opens a
// Scope cell with a bolded lead token -- **The twist.**, **The load-bearing
// concept.** -- so the convention exists and only needed reading. A cell opening
// **Contrast.** or **Support.** declares its role; anything else is a spine,
// which is what every existing row means and why this migrates nothing.
//
// Why a third role at all: the wall's question is whether two engines take their
// MECHANISM from one work. A work cited to hold a line, and a work cited because
// it corroborates, are neither of them the mechanism, and refusing the second
// engine that leans on one pushes the honest author toward a weaker citation to
// get green -- which is worse for the corpus than the duplication the rule was
// written to stop.
//
// A fourth role, and the only one whose declaration can be WRONG -- which is
// the whole reason it exists. `docs/BOUNDARY.md` ("A worked relocation") rules
// that whether a citation duplicates another unit's spine is a fact about that
// citation, not a line in governance config, and an exemption nothing can
// contradict is not a rule. A delegation says "this work's spine is held by
// <unit>, and this row points at it"; the kit then CHECKS that the named unit
// exists and holds the same (scholar, work) as a spine. A claim that does not
// hold is not silently exempt -- the row stays a spine and collides, and
// `findUnverifiedDelegations` names it.
//
// The prose form exists for the same reason the support markers do: the house
// was already writing this ("Owned by the third-place engine", "Used here,
// owned by the gift engine") in cells written long before there was a term for
// it. A root extends or replaces the list in workPolicy.delegateMarkers; each
// entry is a source string compiled case-insensitively, and its FIRST capture
// group is the owning unit's stem.
const DEFAULT_DELEGATE_MARKERS = ["owned by (?:the )?([a-z0-9-]+) (?:engine|composite)"];

// Compiled once per source string rather than per row: the wall reads ~3000
// records and would otherwise recompile the same pattern for every one.
const DELEGATE_RX = new Map();
const delegateRx = (src) => {
  if (!DELEGATE_RX.has(src)) DELEGATE_RX.set(src, new RegExp(src, "i"));
  return DELEGATE_RX.get(src);
};

// Matched against the PARSED cell, which is why the pattern carries no
// asterisks: the Origin reader strips emphasis, so `**Contrast.**` reaches this
// function as `Contrast.`. The token must lead, and must be closed by a period
// or a colon, so a cell that merely opens with the word -- "Support for the
// model is broad" -- is prose and stays a spine.
//
// The optional parenthesis is the ARGUMENT a role can carry, and two roles take
// one. `Spine (anchoring and adjustment).` declares the LOCUS -- which claim in
// the work this unit takes, so a volume of chapters stops being one key; see
// `locusOf`. `Delegate (third-place).` declares the owning unit. `contrast` and
// `support` take none, and an argument on them is read and ignored rather than
// refused, because a role that is already not a spine has nothing to key.
//
// `spine` is listed even though it is the default: a row declaring a locus must
// name the role it is declaring it for, and a cell reading `Spine (x).` should
// mean the same thing whether or not the reader knows spine is the default.
// Nothing in the corpus opens with either new token today, so adding them
// migrates nothing.
const ROLE_PREFIX =
  /^\**\s*(contrast|support|spine|delegate)\s*\**\s*(?:\(\s*([^)]{1,80}?)\s*\)\s*)?\**\s*[.:]/i;

/**
 * The declaration a Scope cell opens with: `{role, arg}` with `arg` the raw
 * text between the parentheses (`""` when the role carries none), or null when
 * the cell declares nothing. One parse, read by roleOf, locusOf and
 * delegateOwner, so the three can never disagree about what a cell says.
 */
function roleArgument(row) {
  const declared = ROLE_PREFIX.exec(String(row?.scope ?? "").trimStart());
  return declared ? { role: declared[1].toLowerCase(), arg: (declared[2] ?? "").trim() } : null;
}

/**
 * The role a citation declares: "contrast", "support", "delegate", or "spine".
 *
 * A declared prefix wins. Failing that the marker vocabularies read -- contrast
 * first, then support, then delegate -- so rows written before the prefixes keep
 * the meaning they had, and a house that writes its roles as phrases rather than
 * prefixes is held by the same wall as one that writes them as prefixes. Both
 * are deliberately generous about the reading and strict about the default:
 * anything unmarked is a spine, so a role is something an author claims, never
 * something the checker infers on their behalf.
 *
 * "delegate" is the role a wall must not take on trust: it says another unit
 * holds the spine, and only `findOverlaps` can see whether that unit does. This
 * function reports what the cell CLAIMS; the checking is downstream.
 */
export function roleOf(row, policy = {}) {
  const declared = roleArgument(row);
  if (declared) return declared.role;
  if (isContrast(row, policy.contrastMarkers ?? DEFAULT_CONTRAST_MARKERS)) return "contrast";
  // Symmetric with contrast, and the asymmetry it closes was the whole defect: a
  // house could declare its contrast vocabulary and had no way to declare its
  // support vocabulary, so a house that needed one built a parallel list its own
  // instrument read and this wall did not. Two checks reading the same policy and
  // disagreeing is worse than either answer.
  if (isContrast(row, policy.supportingMarkers ?? DEFAULT_SUPPORTING_MARKERS)) return "support";
  if (delegateOwner(row, policy)) return "delegate";
  return "spine";
}

/**
 * The unit a citation names as the owner of this work's spine, or null.
 *
 * Declared (`Delegate (third-place).`) or written in prose ("Owned by the
 * third-place engine"), reduced to the bare stem so it can be compared against
 * a unit name. Unlike every other exit from the wall this one is a claim about
 * something else in the corpus, so it can be checked -- and six of the
 * seventeen rows writing it in prose today do not hold.
 */
export function delegateOwner(row, policy = {}) {
  const declared = roleArgument(row);
  if (declared) return declared.role === "delegate" ? declared.arg.toLowerCase() || null : null;
  const hay = String(row?.scope ?? "");
  for (const src of policy.delegateMarkers ?? DEFAULT_DELEGATE_MARKERS) {
    const m = delegateRx(src).exec(hay);
    if (m?.[1]) return m[1].toLowerCase();
  }
  return null;
}

/**
 * The locus a spine declares: WHICH claim in the work this unit takes, or ""
 * when it declares none.
 *
 * The chapter case is why this exists. `Judgment under Uncertainty` grounds six
 * engines on six different heuristics; keyed by the work alone they are one
 * key, and the only answer the wall had was to exempt the work entirely -- one
 * switch that also stopped it seeing a real duplicate on the same volume.
 * Keyed by `Scholar :: work :: locus` they are six keys and need no exemption.
 *
 * Two decisions worth stating, because the obvious versions of both are wrong.
 *
 * It is DECLARED, never read out of the surrounding prose. 970 of the corpus's
 * Scope cells already open with a lead phrase and 512 of them are distinct;
 * matching on that text retires 8 of 101 findings, and it fails in the
 * permissive direction -- two authors wording one claim differently would buy
 * an exemption by writing badly. A locus is a claim an author makes, and a
 * reviewer can disagree with it.
 *
 * An UNDECLARED spine keys exactly as it did before (`Scholar :: work`, no
 * third segment), so nothing migrates and declaring is what buys the
 * separation. Normalised like a work stem -- lowercased, punctuation swept,
 * capped at six words -- so `Anchoring and adjustment` and `anchoring and
 * adjustment.` are one locus and not two.
 */
export function locusOf(row, policy = {}) {
  const declared = roleArgument(row);
  if (!declared || declared.role !== "spine" || !declared.arg) return "";
  return normaliseWork(declared.arg, policy.aliases ?? {});
}

/** The declared work policy for a root: workPolicy in khai-guard.config.json. */
export function loadWorkPolicy(root) {
  let wp = {};
  // Resolved by walk-up, not read from the root alone: a migrated house's
  // content root sits below the repository root that holds the config, and a
  // policy that silently defaults there is the "vocabulary declared where
  // nothing reads it" failure this file already documents.
  const path = findGuardConfig(root);
  if (path) {
    try {
      wp = JSON.parse(readFileSync(path, "utf8"))?.workPolicy ?? {};
    } catch {
      wp = {};
    }
  }
  const aliases = wp.aliases || {};
  return {
    contrastMarkers: (wp.contrastMarkers || DEFAULT_CONTRAST_MARKERS).map((m) => m.toLowerCase()),
    supportingMarkers: (wp.supportingMarkers || DEFAULT_SUPPORTING_MARKERS).map((m) =>
      m.toLowerCase(),
    ),
    canon: (wp.canon || []).map((w) => normaliseWork(w)),
    aliases,
  };
}

// Work identity. The Key Work cell is free text and the same paper is written
// several ways across a root (a title with and without its subtitle), so the
// string is reduced to a stem: the first work named, without its parenthetical
// journal and year, without punctuation, capped at six words. `aliases` is the
// escape hatch for the pairs the stem does not catch.
export function normaliseWork(work, aliases = {}) {
  let s = String(work)
    .replace(/<br>[\s\S]*$/, "")
    // `[^()]*`, not `[^)]*`: excluding the opener keeps the match linear on a
    // run of "(" (js/polynomial-redos). Any paren this leaves unmatched is
    // swept to a space by the punctuation strip below.
    .replace(/\([^()]*\)/g, " ")
    .split(";")[0]
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  s = s.split(" a test of the ")[0];
  s = s.split(" ").slice(0, 6).join(" ");
  return aliases[s] || s;
}

/** A row cited to hold a line rather than to carry one. */
export function isContrast(row, markers) {
  const hay = (row.scope + " " + row.keyWork).toLowerCase();
  return markers.some((m) => hay.includes(m));
}

/**
 * The index records for a root, in one uniform shape whatever the root is:
 * a collection house (khai.collection) is read per unit, anything else as the
 * engine monorepo. Each record is one (scholar, unit, work, scope) with the
 * scholar already keyed through the root's declared homonyms — the same
 * records, from the same collector, the science build renders.
 */
export function collectUnits(root) {
  const pkg = safePackageJson(root);
  if (pkg?.khai?.collection) {
    const collection = resolveCollection(pkg);
    const { records, byUnit } = collectCollectionScience(root, collection);
    return {
      noun: collectionKind(undefined, collection.key),
      records,
      units: byUnit.map((u) => u.unit),
      deps: new Map(),
    };
  }
  const { records, byEngine } = collectScience(root);
  return {
    noun: "engine",
    records: records.map((r) => ({ ...r, unit: r.engine })),
    units: byEngine.map((e) => e.engine),
    deps: unitDeps(root),
  };
}

// The structural exit, computed from the wiring rather than declared.
//
// In a collection house every unit is a peer, so a shared spine is always a
// finding. In the engine monorepo the units form a composition: a composite
// hard-links its member atoms and its integrative warrant legitimately cites
// the atoms' science. That relationship is machine-readable — a composite's
// package `dependencies` name its members as `@chbrain/khai-engine-<name>` /
// `@chbrain/khai-composite-<name>` — so the exemption needs no canon entry:
// a unit that (transitively) depends on another unit sharing the same work is
// citing science it composes over, not duplicating a spine.
const DEP_PREFIXES = ["@chbrain/khai-engine-", "@chbrain/khai-composite-"];

/** Transitive unit -> Set<unit> dependency map for an engine root. */
export function unitDeps(root) {
  const direct = new Map();
  for (const kind of ["engines", "composites"]) {
    const base = join(root, "packages", kind);
    if (!existsSync(base)) continue;
    for (const d of readdirSync(base).sort()) {
      const p = join(base, d, "package.json");
      if (!statSync(join(base, d)).isDirectory() || !existsSync(p)) continue;
      let pkg;
      try {
        pkg = JSON.parse(readFileSync(p, "utf8"));
      } catch {
        continue;
      }
      const unit = pkg?.khai?.engine;
      if (!unit) continue;
      const on = new Set();
      for (const dep of Object.keys(pkg.dependencies || {})) {
        for (const prefix of DEP_PREFIXES)
          if (dep.startsWith(prefix)) on.add(dep.slice(prefix.length));
      }
      direct.set(unit, on);
    }
  }
  // Transitive closure (plain fixpoint, cycle-safe), so a composite over a
  // composite still reaches the atom.
  const closed = new Map([...direct].map(([u, on]) => [u, new Set(on)]));
  for (let changed = true; changed;) {
    changed = false;
    for (const [, on] of closed) {
      for (const dep of [...on])
        for (const t of closed.get(dep) || [])
          if (!on.has(t)) {
            on.add(t);
            changed = true;
          }
    }
  }
  return closed;
}

/**
 * Where every spine sits before any exemption is applied: `Scholar :: stem` ->
 * Set<unit>. Built from the same records the wall keys, and read only to answer
 * "does the unit this row delegates to actually hold this work?" -- so a
 * delegation is checked against the corpus, never taken on trust.
 */
function spineIndex(records, policy) {
  const held = new Map();
  for (const r of records) {
    if (roleOf(r, policy) !== "spine") continue;
    const key = r.surname + " :: " + normaliseWork(r.keyWork, policy.aliases);
    if (!held.has(key)) held.set(key, new Set());
    held.get(key).add(r.unit);
  }
  return held;
}

/**
 * Does the unit this row names as owner hold the same work as a spine?
 *
 * Matched loosely rather than by stem equality, deliberately, and this is the
 * one place in the wall where loose is the safe direction. The stem caps a
 * title at six words, so one work reaches the index under two spellings (`the
 * great good place` and `the great good place cafes coffee`); strict equality
 * reported five true delegations as broken and would have sent authors to fix
 * citations that are correct. A false CLEAR here costs one unchecked pointer; a
 * false ALARM costs a corpus edit that makes things worse.
 *
 * `workMatches` supplies the rule and one extension is added on top of it: it
 * refuses a single-word short side, because it is also the advisory matcher for
 * an author-supplied query where a bare word would hit everything. Here both
 * sides are corpus stems under an already-exact scholar match, so a one-word
 * prefix is `Goffman :: asylums` against `Goffman :: asylums essays on the
 * social situation` -- the same book, and the case the guard was never about.
 */
const sameWorkLoosely = (a, b) =>
  Boolean(workMatches(a, b)) || a.startsWith(b + " ") || b.startsWith(a + " ");

function delegationHolds(row, policy, held) {
  const owner = delegateOwner(row, policy);
  if (!owner) return false;
  const stem = normaliseWork(row.keyWork, policy.aliases);
  for (const [key, units] of held) {
    const [scholar, keyStem] = key.split(" :: ");
    if (scholar !== row.surname || !sameWorkLoosely(stem, keyStem)) continue;
    if (units.has(owner)) return true;
  }
  return false;
}

/**
 * Every (scholar, work, locus) carrying a spine in more than one unit -- canon,
 * contrast, support and VERIFIED delegations removed. A house's wall is
 * `expect(findOverlaps(root)).toEqual([])`; the kit computes, the house holds
 * the line.
 *
 * Spine-in-two is the failure the rule exists for: two engines taking one
 * mechanism from one work. Everything else a work can be doing in a second
 * engine -- marking a boundary, corroborating, pointing at the unit that owns
 * it -- is a legitimate second use and always was; the wall could not
 * previously say so, so it refused them all.
 *
 * The key carries a third segment only when a spine declares a locus (see
 * `locusOf`), so an undeclared row keys exactly as it did before and no
 * existing key moves. Declaring is what separates two engines on one volume.
 *
 * A delegation that does not hold is NOT an exemption: the row falls through
 * and is keyed as the spine it claimed not to be, so a wrong pointer collides
 * rather than passing quietly. `findUnverifiedDelegations` names it.
 */
export function findOverlaps(root) {
  const policy = loadWorkPolicy(root);
  const { records, deps } = collectUnits(root);
  const held = spineIndex(records, policy);
  const byKey = new Map();
  for (const r of records) {
    const role = roleOf(r, policy);
    if (role === "delegate") {
      if (delegationHolds(r, policy, held)) continue;
    } else if (role !== "spine") continue;
    const stem = normaliseWork(r.keyWork, policy.aliases);
    if (policy.canon.includes(stem)) continue;
    const locus = locusOf(r, policy);
    const key = r.surname + " :: " + stem + (locus ? " :: " + locus : "");
    if (!byKey.has(key)) byKey.set(key, new Map());
    byKey.get(key).set(r.unit, r.keyWork);
  }
  // The structural exit: within one shared work, drop each unit that
  // (transitively) depends on another unit citing it — a composite carrying
  // its member's science composes, it does not duplicate. The depended-on unit
  // stays, so ownership rests with the atom; two unrelated units still collide.
  for (const [, units] of byKey) {
    const names = [...units.keys()];
    for (const unit of names) {
      const on = deps.get(unit);
      if (on && names.some((other) => other !== unit && on.has(other))) units.delete(unit);
    }
  }
  return [...byKey.entries()]
    .filter(([, units]) => units.size > 1)
    .map(([key, units]) => {
      const [scholar, stem, locus = ""] = key.split(" :: ");
      return {
        key,
        scholar,
        stem,
        locus,
        units: [...units.keys()].sort(),
        forms: [...new Set(units.values())],
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * The same overlaps grouped by the unit pair they implicate, which is the view
 * that ranks: a pair sharing four works is a different problem from a pair
 * sharing one.
 */
export function pairsOf(overlaps) {
  const pairs = new Map();
  for (const o of overlaps) {
    for (let i = 0; i < o.units.length; i++) {
      for (let j = i + 1; j < o.units.length; j++) {
        const pk = o.units[i] + " + " + o.units[j];
        if (!pairs.has(pk)) pairs.set(pk, []);
        pairs.get(pk).push(o.stem);
      }
    }
  }
  return [...pairs.entries()]
    .map(([pair, stems]) => ({ pair, stems: [...new Set(stems)] }))
    .sort((a, b) => b.stems.length - a.stems.length || a.pair.localeCompare(b.pair));
}

/**
 * Every delegation whose claim does not hold: the row says another unit owns
 * this work's spine, and that unit does not cite it as one.
 *
 * This is the instrument the canon allowlist could never be. An allowlist entry
 * makes an assertion nothing in the corpus can contradict, so it is never
 * wrong and never retires; a delegation makes an assertion ABOUT the corpus, so
 * the corpus can refute it -- and does, for two rows today. Either the owner
 * named is the wrong unit, or the owner's own citation moved out from under a
 * pointer nobody re-read.
 *
 * Reported rather than walled while the corpus still carries known-bad rows:
 * each fix is a Scope cell inside one engine's own lane, and a wall in the
 * governance lane that goes red on pre-existing debt fails the branch that
 * cannot pay it. It becomes a wall when the count reaches zero.
 */
export function findUnverifiedDelegations(root) {
  const policy = loadWorkPolicy(root);
  const { records } = collectUnits(root);
  const held = spineIndex(records, policy);
  return records
    .filter((r) => roleOf(r, policy) === "delegate" && !delegationHolds(r, policy, held))
    .map((r) => ({
      unit: r.unit,
      owner: delegateOwner(r, policy),
      scholar: r.surname,
      work: r.keyWork,
      stem: normaliseWork(r.keyWork, policy.aliases),
    }))
    .sort((a, b) => a.unit.localeCompare(b.unit) || a.scholar.localeCompare(b.scholar));
}

/**
 * The reading list the wall deliberately does not decide: every (scholar, work)
 * spining more than one unit where the units declare DIFFERENT loci.
 *
 * The wall's half of the split is mechanical -- two units on one locus is a
 * duplicate, full stop. This half is not: whether "anchoring and adjustment"
 * and "availability" are honestly two claims in one volume, or two paraphrases
 * of one claim wearing different words, is a judgement about what a cell means,
 * which `docs/BOUNDARY.md`'s classification rule sends to a person and never to
 * a script. So the loci are printed side by side and a reader decides. A wall
 * here would either refuse the chapter case (which is what canon was invented
 * to escape) or clear a duplicate that reworded itself.
 *
 * Empty until spines start declaring loci, which is the honest reading: nothing
 * has been separated yet, so there is nothing to review.
 */
export function findSharedLoci(root) {
  const policy = loadWorkPolicy(root);
  const { records, deps } = collectUnits(root);
  const byWork = new Map();
  for (const r of records) {
    if (roleOf(r, policy) !== "spine") continue;
    const locus = locusOf(r, policy);
    if (!locus) continue;
    const key = r.surname + " :: " + normaliseWork(r.keyWork, policy.aliases);
    if (!byWork.has(key)) byWork.set(key, new Map());
    byWork.get(key).set(r.unit, locus);
  }
  // The same structural exit the wall takes: a composite reading its member's
  // science composes over it, whatever locus either declares.
  for (const [, units] of byWork) {
    const names = [...units.keys()];
    for (const unit of names) {
      const on = deps.get(unit);
      if (on && names.some((other) => other !== unit && on.has(other))) units.delete(unit);
    }
  }
  return [...byWork.entries()]
    .filter(([, units]) => units.size > 1 && new Set(units.values()).size > 1)
    .map(([key, units]) => ({
      key,
      scholar: key.split(" :: ")[0],
      stem: key.split(" :: ")[1],
      loci: [...units.entries()]
        .map(([unit, locus]) => ({ unit, locus }))
        .sort((a, b) => a.unit.localeCompare(b.unit)),
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

// Pre-authoring advisory matching. The wall above must never cry wolf, so it
// keeps strict stem equality; the advisory is run by an author holding a
// candidate, so its only expensive failure is silence — a spurious hit costs a
// reader ten seconds, a spurious clear costs a fully authored unit on a spine
// another unit already holds. So both halves match loosely and the caller says
// which hits were loose, leaving the adjudication to the author.
const scholarTokens = (s) =>
  new Set(
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2),
  );

/** Any shared name token, either way round, so "Dale Miller" meets "Miller (Dale)". */
export function scholarMatches(query, rowScholar) {
  if (!query) return true;
  if (rowScholar.toLowerCase().includes(query.toLowerCase())) return true;
  const want = scholarTokens(query);
  if (!want.size) return false;
  const have = scholarTokens(rowScholar);
  for (const t of want) if (have.has(t)) return true;
  return false;
}

/**
 * Equal stems, or one a word-boundary prefix of the other. The shorter side
 * must carry two words or more, so a single common word cannot drag in half
 * the index.
 */
export function workMatches(queryStem, rowStem) {
  if (queryStem === rowStem) return "exact";
  const [short, long] =
    queryStem.length <= rowStem.length ? [queryStem, rowStem] : [rowStem, queryStem];
  if (short.split(" ").filter(Boolean).length < 2) return null;
  return long.startsWith(short + " ") ? "prefix" : null;
}

/**
 * Does a proposed spine already anchor a unit? Accepts "Scholar :: Work" or a
 * bare work. Answers before the unit's files exist, which is the cheapest
 * place to catch an overlap.
 */
export function checkCandidate(root, spec) {
  const policy = loadWorkPolicy(root);
  const { records } = collectUnits(root);
  const [lhs, rhs] = spec.includes("::")
    ? spec.split("::").map((s) => s.trim())
    : [null, spec.trim()];
  const stem = normaliseWork(rhs, policy.aliases);
  const hits = [];
  for (const r of records) {
    const rowStem = normaliseWork(r.keyWork, policy.aliases);
    const match = workMatches(stem, rowStem);
    if (!match || !scholarMatches(lhs, r.surname)) continue;
    hits.push({
      scholar: r.surname,
      unit: r.unit,
      work: r.keyWork,
      role: roleOf(r, policy),
      // Kept for callers written against the two-role shape; role is the one to
      // read, since it also distinguishes a support citation from a spine.
      contrast: roleOf(r, policy) === "contrast",
      canon: policy.canon.includes(rowStem),
      match,
    });
  }
  return hits;
}

/**
 * The surname scan: is this name anywhere in the index, bare or resolved?
 *
 * checkCandidate answers the shared-work question and, handed a bare surname,
 * truthfully reports that no work matches — a true answer to the wrong
 * question, and a false clear for the question that was asked. This is the
 * command behind the rule "scan the surname whatever it looks like": it
 * matches the index key exactly (the bare surname, or any of its declared
 * `Surname (Form)` resolutions), case-insensitively, never as a substring —
 * "Adams" must not hit "Adamson", and a hit is a cell to read, not a verdict.
 */
export function scanSurname(root, name) {
  const { records } = collectUnits(root);
  const want = String(name).trim().toLowerCase();
  const byKey = new Map();
  for (const r of records) {
    const key = r.surname;
    const bare = key.replace(/\s*\(.*\)$/, "");
    if (bare.toLowerCase() !== want) continue;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push({ unit: r.unit, source: r.source, work: r.keyWork });
  }
  return [...byKey.entries()]
    .map(([key, rows]) => ({
      key,
      resolved: /\(.*\)$/.test(key),
      rows: rows.sort((a, b) => a.unit.localeCompare(b.unit) || a.work.localeCompare(b.work)),
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * The namesake wall: a surname declared in scholarPolicy.homonyms may not
 * appear in the index unresolved. A declared surname left bare in one unit and
 * resolved in another is one person split across two keys, or two people
 * merged into one, and either way the shared-work check compares the wrong
 * things. The undeclared direction needs no wall: it collates, and can only
 * raise a spurious overlap, which fails loudly rather than passing quietly.
 */
export function findUnresolvedNamesakes(root) {
  const homonyms = scholarHomonyms(root);
  const { records } = collectUnits(root);
  return records
    .filter((r) => Array.isArray(homonyms[r.surname]) && homonyms[r.surname].length)
    .map((r) => ({
      scholar: r.surname,
      unit: r.unit,
      forms: homonyms[r.surname],
      source: r.source,
      work: r.keyWork,
    }))
    .sort((a, b) => a.scholar.localeCompare(b.scholar) || a.unit.localeCompare(b.unit));
}
