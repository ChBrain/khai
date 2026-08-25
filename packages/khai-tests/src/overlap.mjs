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
// spine of two units is a finding. Two configured exits keep the rule honest,
// both declared in `workPolicy` in the root's khai-guard.config.json:
//
//   canon           -- a field's foundational work, which many units in one
//                      family may legitimately share.
//   contrastMarkers -- the vocabulary that marks a work cited to hold a line
//                      rather than to carry one ("cited to distinguish").
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
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { collectScience, collectCollectionScience, scholarHomonyms } from "./science.mjs";
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
const ROLE_PREFIXES = [
  ["contrast", ["**contrast.**", "**contrast:**", "**contrast**"]],
  ["support", ["**support.**", "**support:**", "**support**"]],
];

/**
 * The role a citation declares: "contrast", "support", or "spine".
 *
 * A declared prefix wins. Failing that the legacy contrast vocabulary still
 * reads, so rows written before the prefixes keep the meaning they had. Both
 * are deliberately generous about the reading and strict about the default:
 * anything unmarked is a spine, so a role is something an author claims, never
 * something the checker infers on their behalf.
 */
export function roleOf(row, policy = {}) {
  const scope = String(row?.scope ?? "")
    .trimStart()
    .toLowerCase();
  for (const [role, prefixes] of ROLE_PREFIXES) {
    if (prefixes.some((p) => scope.startsWith(p))) return role;
  }
  if (isContrast(row, policy.contrastMarkers ?? DEFAULT_CONTRAST_MARKERS)) return "contrast";
  return "spine";
}

/** The declared work policy for a root: workPolicy in khai-guard.config.json. */
export function loadWorkPolicy(root) {
  let wp = {};
  const path = join(root, "khai-guard.config.json");
  if (existsSync(path)) {
    try {
      wp = JSON.parse(readFileSync(path, "utf8"))?.workPolicy ?? {};
    } catch {
      wp = {};
    }
  }
  const aliases = wp.aliases || {};
  return {
    contrastMarkers: (wp.contrastMarkers || DEFAULT_CONTRAST_MARKERS).map((m) => m.toLowerCase()),
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
 * Every (scholar, work) carrying a spine in more than one unit -- canon,
 * contrast and support citations removed. A house's wall is
 * `expect(findOverlaps(root)).toEqual([])`; the kit computes, the house holds
 * the line.
 *
 * Spine-in-two is the failure the rule exists for: two engines taking one
 * mechanism from one work. Everything else a work can be doing in a second
 * engine -- marking a boundary, corroborating -- is a legitimate second use and
 * always was; the wall could not previously say so, so it refused them all.
 */
export function findOverlaps(root) {
  const policy = loadWorkPolicy(root);
  const { records, deps } = collectUnits(root);
  const byKey = new Map();
  for (const r of records) {
    if (roleOf(r, policy) !== "spine") continue;
    const stem = normaliseWork(r.keyWork, policy.aliases);
    if (policy.canon.includes(stem)) continue;
    const key = r.surname + " :: " + stem;
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
    .map(([key, units]) => ({
      key,
      scholar: key.split(" :: ")[0],
      stem: key.split(" :: ")[1],
      units: [...units.keys()].sort(),
      forms: [...new Set(units.values())],
    }))
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
