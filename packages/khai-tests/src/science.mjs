// The science index: the forward map, science -> engine.
//
// Every engine authors its warrant in REFERENCES.md (the LORE standard), whose
// Origin chapter carries a `| Source | Key Work | Scope |` table -- the reverse
// map, engine -> science. This module inverts that, across every engine -- atom
// engines under packages/engines/* and composites under packages/composites/*,
// whose Origin tables carry the integrative warrant of the layer read -- into a
// single generated `docs/SCIENCE.md`: navigate from a scholar or theory to the
// engines that rest on it, and see at a glance where one source is load-bearing
// across many engines.
//
// Computed, not hand-kept: the same Origin tables are the single source, so the
// two directions can never drift. `buildScienceIndex` is the sole writer;
// `verifyScienceIndex` is the drift gate (mirrors the registry build-drift gate)
// -- a stale or hand-edited index fails at the PR, not at the next release.
//
// Deliberately dependency-free (node built-ins only): the committed index must
// be byte-identical to what the gate rebuilds, so the writer and the verifier
// are the one code path, runnable anywhere without an install step.
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { safePackageJson, resolveCollection, collectionKind } from "./collection.mjs";
import { findGuardConfig } from "./guard-config.mjs";

/** Where the generated index lives, relative to the repo root. */
export const SCIENCE_INDEX_PATH = "docs/SCIENCE.md";

// --- markdown helpers ----------------------------------------------------

/** Strip inline markdown emphasis/links and decode the entities the tables use. */
function stripMd(s) {
  return s
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/&amp;/g, "&")
    .trim();
}

/** The body of a `## <name>` chapter, up to the next `## ` heading (or EOF). */
function sliceChapter(text, name) {
  const out = [];
  let inside = false;
  for (const line of text.split("\n")) {
    // A level-2 heading ("## ", not "### "). String checks, not a regex built
    // from `name`, so there is no dynamic-pattern surface.
    if (line.startsWith("## ")) {
      if (inside) break;
      inside = line.slice(3).trim() === name;
      continue;
    }
    if (inside) out.push(line);
  }
  return out.join("\n");
}

/** Parse a `| Source | Key Work | Scope |` table into rows (header/rule dropped). */
function parseOriginTable(origin) {
  const rows = [];
  for (const raw of origin.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 3) continue;
    const [source, work, scope] = cells;
    if (/^:?-+:?$/.test(source)) continue; // separator row
    if (/^source$/i.test(source)) continue; // header row
    rows.push({ source: stripMd(source), keyWork: stripMd(work), scope: stripMd(scope) });
  }
  return rows;
}

/**
 * Malformed Origin rows: the well-formedness wall. `parseOriginTable` silently
 * SKIPS a table row that is not exactly three cells (`cells.length < 3`), so a
 * mistyped warrant row (a missing pipe, a merged column) is dropped from the
 * science index without a trace, losing its citation. This catches such a row:
 * a markdown table line (opens with `|`) that is neither the separator nor the
 * header yet does not hold exactly three cells. Mirrors parseOriginTable's own
 * cell split, so it flags precisely what that function would drop. A meta engine
 * (the spine) whose warrant is a two-column table is never passed here: the
 * callers skip an engine with no `khai.type` before parsing its Origin, exactly
 * as they exclude it from the science map.
 */
export function originRowErrors(origin, nonAuthorSources = []) {
  const errors = [];
  // Compile every declared entry up front, before a single row is read. An
  // invalid pattern is a fault in the config whatever the table happens to
  // hold, so it is raised on the build that introduced it rather than on the
  // first row that eventually needed it.
  for (const entry of nonAuthorSources) compileNonAuthorEntry(entry);
  // A Source that yields no surname at all. The uppercase-initial rule in
  // `surnames` drops non-author idioms deliberately and silently -- "Boundary of
  // the effect", "Nobel 2001" -- which is right for a cell that names no person
  // on purpose and catastrophic for one that meant to. It cannot tell them
  // apart, so a mistyped Source is not flagged, it VANISHES: a composite whose
  // Origin held "Cognitive-behavioral model" and "Clinical presentation" lost
  // both rows out of the science index, taking Frost, Hartl and Steketee with
  // them, and kept only the row headed "Nosology" -- filed among real people as
  // though it were a surname. One record where there should have been five, and
  // every gate green.
  //
  // So the silence is closed rather than the idiom banned: a Source that names
  // nobody must be DECLARED in scholarPolicy.nonAuthorSources. Six rows in the
  // tree are legitimately of that kind (meteor records, a safety standard, a
  // craft tradition), and they are cheap to list; anything else is a mistake.
  //
  // An entry may be a string or a PATTERN, and the grammar is in
  // `compileNonAuthorEntry` below. The reason is a house this kit serves whose
  // non-author rows are not six exceptions but a CONVENTION: khai-misfits
  // writes a Source that deliberately names no person as a phrase ("Boundary of
  // the effect", "The measurement dispute", "Whether any settlement reaches
  // it"), and that house's own ruling forbids answering a class of that kind
  // with "a closed list of the NON_AUTHOR kind ... a list to maintain".
  // Measured over its corpus the list would be 352 distinct strings across 268
  // misfits. One house's intentional class is a rule, not a list, so the rule is
  // what it declares -- the same shape `workPolicy.contrastMarkers` already
  // has, a declared vocabulary authored by the person who knows the class. The
  // wall is unchanged by it: a pattern exempts what it names and nothing else,
  // so an undeclared "Cognitive-behavioral model" still fails.
  //
  // "Nosology" is NOT the thing this wall catches, and the case above is where
  // the two halves part. It yields an uppercase token, so `surnames` keys it, the
  // row is never dropped, and `originRowErrors` returns nothing for it with
  // nothing declared: it is the row that SURVIVED, mis-filed among real people as
  // though it were a surname, and no declaration is involved either way. Only the
  // two that vanished are this wall's prey. Recorded in
  // tests/non-author-sources.test.mjs, which asserts both directions, because a
  // comment claiming a gate is stricter than it is sends the next reader to a
  // test that contradicts it.
  for (const raw of origin.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) continue; // not a table row
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length === 0) continue; // a bare "|" line, not a row
    const first = cells[0];
    if (/^:?-+:?$/.test(first)) continue; // separator row
    if (/^source$/i.test(first)) continue; // header row
    if (cells.length !== 3) {
      errors.push(
        `Origin row has ${cells.length} column(s), not 3 ` +
          `(| Source | Key Work | Scope |); the index silently drops it, losing the citation: ${line}`,
      );
      continue;
    }
    const source = stripMd(first);
    if (surnames(source).length === 0 && !matchesNonAuthor(source, nonAuthorSources))
      errors.push(
        `Origin row Source "${source}" names no scholar, so the index drops the row ` +
          `and the citation with it. The Source column holds the person, not a category ` +
          `("Cognitive-behavioral model", "Nosology"); the work goes in Key Work. If the ` +
          `row genuinely cites no person, declare it in scholarPolicy.nonAuthorSources`,
      );
  }
  return errors;
}

/**
 * An entry is a PATTERN iff it opens and closes with "/" and holds at least one
 * character between them. Everything else is a plain string entry. The body is
 * the only thing that separates the two, and it has to: "/" and "//" carry no
 * body, and reading either as a pattern gives the empty regex, which matches
 * every Source there is and would silently disarm the wall for a whole house.
 * The leading-AND-trailing rule is likewise what keeps a slash inside an entry
 * ("NFPA / DOE hydrogen safety") a literal, since read as a regex it would match
 * unanchored and exempt any Source that merely contained it.
 */
const isNonAuthorPattern = (entry) =>
  entry.length > 2 && entry.startsWith("/") && entry.endsWith("/");

/**
 * One declared entry as a predicate over a Source cell.
 *
 * A string entry keeps today's semantics: an exact, case-insensitive match on
 * the qualifier-stripped Source, so one declared "Practitioner" covers every row
 * that writes it with a field ("Practitioner (medicine)"), and an entry that
 * carries its own qualifier still matches the cell it was written for. Stripping
 * both sides can only widen an equality that already held, so no declaration
 * that worked stops working.
 *
 * A pattern entry compiles with the `i` flag and tests the same normalised
 * Source. Case-insensitivity is deliberate and worth knowing: `/^The /` reaches
 * a cell written "the measurement dispute", so a house cannot make the capital
 * load-bearing through this grammar.
 *
 * An invalid pattern THROWS, naming the entry. It is never skipped: a pattern
 * that cannot compile declares nothing, and a vocabulary declared where nothing
 * reads it is indistinguishable from a vocabulary nobody has used yet. That
 * failure has already been paid for here once, in a policy loader that dropped
 * a key it was handed and returned a clean, meaningless count.
 */
function compileNonAuthorEntry(entry) {
  const raw = String(entry);
  if (!isNonAuthorPattern(raw)) {
    const wanted = stripQualifier(raw).toLowerCase();
    return (source) => stripQualifier(source).toLowerCase() === wanted;
  }
  let re;
  try {
    re = new RegExp(raw.slice(1, -1), "i");
  } catch (err) {
    throw new Error(
      `scholarPolicy.nonAuthorSources: entry ${JSON.stringify(raw)} is written as a pattern ` +
        `(a leading and a trailing "/") but is not a valid regular expression: ${err.message}. ` +
        `A pattern that cannot compile declares nothing, so it is raised here rather than ` +
        `skipped, which would leave the wall armed against rows the house believed it had declared`,
    );
  }
  return (source) => re.test(stripQualifier(source));
}

/**
 * Is this Source cell covered by the declared non-author vocabulary? Pure, and
 * the single reading of `scholarPolicy.nonAuthorSources` that both the wall and
 * any caller share. Every entry is compiled before any is tested, so an invalid
 * pattern is raised even when an earlier entry would have matched.
 */
export function matchesNonAuthor(source, entries = []) {
  const tests = entries.map(compileNonAuthorEntry);
  return tests.some((test) => test(source));
}

// --- normalization -------------------------------------------------------

// A closed, declared set of non-author Source idioms the house uses on purpose:
// a row that cites no single named scholar, indexed here as data rather than
// re-judged per build. Only "Practitioner" (the field-knowledge placeholder)
// needs declaring — it is a lone capitalised token, indistinguishable in shape
// from a mononym surname (Aesop, Goffman), so the structural filter below cannot
// catch it. The other non-author idioms fall out structurally: the honest-note
// phrases ("Boundary of the effect"), mechanism labels ("The individual
// calculus") and bare years ("Nobel 2001") all reduce to a token that is not a
// proper noun, and are dropped by the uppercase-initial rule. Matched after
// qualifier-stripping, so "Practitioner (medicine)" collapses to it too.
const NON_AUTHOR = new Set(["practitioner"]);

// A closed, declared set of nobiliary and toponymic particles: tokens that join
// to the name after them to make one surname ("Le Grand", "Della Porta"). Unlike
// the uppercase-initial rule below, this one cannot be computed — nothing in the
// shape of "Le" separates the particle of "Le Grand" from any other short word,
// so the set is carried here as data. Matched case-insensitively; whether a
// given occurrence actually joins is decided by surnameOf, not by this list.
const PARTICLES = new Set([
  "af",
  "al",
  "av",
  "da",
  "das",
  "de",
  "del",
  "della",
  "den",
  "der",
  "des",
  "di",
  "do",
  "dos",
  "du",
  "el",
  "la",
  "le",
  "les",
  "ten",
  "ter",
  "van",
  "ver",
  "von",
]);

/** Drop a trailing/inline parenthetical qualifier: "Brooks (communication)" -> "Brooks". */
const stripQualifier = (s) =>
  s
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// A closed, declared set of generational suffixes: tokens that trail a surname
// without being one ("Everett L. Worthington Jr.", "Henry L. Roediger III").
// Like PARTICLES this cannot be computed -- nothing in the shape of "III"
// separates a generational numeral from a regnal one, and "Jr" is a word like
// any other -- so the set is carried here as data. A suffix is only ever
// stripped from the END of a part, where it cannot be a name; a part that is
// nothing but a suffix keeps it, so the uppercase-initial rule still sees a
// token and the row is not silently dropped.
const SUFFIXES = new Set(["jr", "jnr", "sr", "snr", "ii", "iii", "iv"]);

/**
 * The surname inside one author part, carrying any particle that belongs to it
 * and shedding any generational suffix that does not:
 *   "Julian Le Grand"        -> "Le Grand"
 *   "Van Jacobson"           -> "Jacobson"    (Van is his given name)
 *   "Marquis de Condorcet"   -> "Condorcet"
 *   "Henry L. Roediger III"  -> "Roediger"    (the suffix is not the surname)
 *
 * The suffix rule exists because taking the last token unconditionally files a
 * scholar under their suffix: before it, the index carried a literal **Jr**
 * heading holding Worthington, Pohlhaus, French, Zelditch and Swann at once,
 * and none of those five appeared under their own name anywhere in the map.
 *
 * Two conditions gate the join, and the source itself carries both signals, so
 * neither is a per-row judgement:
 *
 *  1. **The particle is capitalised.** That is how a name declares the particle
 *     to be part of the surname. "Julian Le Grand" is indexed under Le Grand;
 *     "Marquis de Condorcet" under Condorcet and "Arnold van Gennep" under
 *     Gennep, which is also how the rest of the corpus already cites them (as
 *     bare "von Neumann", bare "Condorcet"), so following the source's own
 *     casing keeps a lowercase-particle scholar collating on one key instead of
 *     fracturing into two.
 *  2. **The particle is not the part's first token.** A capitalised particle in
 *     first position is a given name, not a particle: "Van Jacobson" is
 *     Jacobson, and the Van is what his parents called him. Requiring a token
 *     ahead of it is what tells the two apart.
 *
 * The joined surname still begins with the capital that opened the particle, so
 * the uppercase-initial invariant below reads it unchanged.
 */
/**
 * One author part as clean name tokens: punctuation stripped, and any trailing
 * generational suffix shed (but never the whole part: a lone "Jr" keeps itself
 * rather than collapsing to nothing), so the last token is the surname again.
 * Shared by surnameOf and scholarKey, which must agree on where the surname
 * ends — "William B. Swann Jr." is tokens ["William", "B", "Swann"], surname
 * Swann, given "William B".
 */
function nameTokens(part) {
  const tokens = part.replace(/[.,]/g, "").split(/\s+/).filter(Boolean);
  while (tokens.length > 1 && SUFFIXES.has(tokens[tokens.length - 1].toLowerCase())) tokens.pop();
  return tokens;
}

function surnameOf(part) {
  const tokens = nameTokens(part);
  if (!tokens.length) return part;
  let head = tokens.length - 1;
  while (
    head > 1 &&
    PARTICLES.has(tokens[head - 1].toLowerCase()) &&
    /^\p{Lu}/u.test(tokens[head - 1])
  ) {
    head -= 1;
  }
  return tokens.slice(head).join(" ");
}

/**
 * Canonical surnames for a Source cell, so the same scholar collates across
 * engines however they were written. Multi-author cells contribute one surname
 * each, so a shared author links every engine that cites them:
 *   "Amos Tversky & Daniel Kahneman" -> ["Tversky", "Kahneman"]
 *   "Kahneman & Tversky"             -> ["Kahneman", "Tversky"]
 *   "Dan P. McAdams et al."          -> ["McAdams"]
 *   "Mayer, Davis & Schoorman"       -> ["Mayer", "Davis", "Schoorman"]
 *   "Brooks (communication)"         -> ["Brooks"]   (the qualifier is not a name)
 *   "Julian Le Grand"                -> ["Le Grand"] (the particle joins: surnameOf)
 *
 * A Source cell that names no scholar contributes none: the forward map is a
 * scholar -> engine index, so honest-note and field-marker rows ("Boundary of
 * the effect", "Practitioner (medicine)") must not manufacture a pseudo-scholar
 * from a common noun. The rule is computed, not enumerated: a surname is a
 * proper noun (begins with an uppercase letter), plus the one declared
 * placeholder NON_AUTHOR cannot tell from a mononym. Everything the builder
 * drops still renders verbatim in the "By engine" / "By <unit>" section, which
 * reads the raw Source, so nothing is lost from the index — only the false
 * author is kept out.
 */
/**
 * The declared homonym policy for a root: `scholarPolicy.homonyms` in
 * khai-guard.config.json, a map from a shared surname to the given-name forms
 * that distinguish the people who share it.
 *
 *   { "Hart": ["'t", "Julian Tudor", "Oliver"] }
 *
 * This has to be declared and cannot be computed, and the corpus is the reason.
 * Two different given names under one surname looks identical to one person
 * written two ways: "Buchanan", "James Buchanan" and "James M Buchanan" are all
 * the same economist, while "Oliver Hart" and "Julian Tudor Hart" are an
 * economist and a general practitioner. Any rule that split the second would
 * split the first, so the index keys on surname by default and separates only
 * where a maintainer has said the surname is shared.
 */
export function scholarHomonyms(root) {
  return scholarPolicy(root).homonyms ?? {};
}

/** The whole declared scholar policy for a root, or an empty policy if absent. */
export function scholarPolicy(root) {
  // Resolved by walk-up (see guard-config.mjs): a migrated house's content
  // root sits below the config, and homonym declarations that silently vanish
  // there fail the namesake wall with the wrong diagnosis.
  const path = findGuardConfig(root);
  if (!path) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8"))?.scholarPolicy ?? {};
  } catch {
    return {};
  }
}

/**
 * The index key for one author part, given the declared homonyms. Undeclared
 * surnames key on the surname alone, which is what collates a scholar written
 * "Kahneman" here and "Daniel Kahneman" there. A declared surname keys as
 * "Surname (Form)", which sorts beside its namesakes rather than away from them.
 * A part carrying no declared form keys on the bare surname, so an unresolved
 * occurrence stays visible instead of being silently attributed to one of them.
 */
function scholarKey(part, surname, homonyms) {
  const forms = homonyms[surname];
  if (!Array.isArray(forms) || !forms.length) return surname;
  const tokens = part.replace(/[.,]/g, "").split(/\s+/).filter(Boolean);
  const sTokens = surname.split(/\s+/);
  // Locate the surname rather than assuming it ends the part: a generational
  // suffix ("Everett L. Worthington Jr.") sits after it, and slicing from the
  // end would then read the surname itself as a given name and match nothing.
  let at = tokens.length - sTokens.length;
  for (let i = at; i >= 0; i -= 1) {
    if (sTokens.every((t, j) => tokens[i + j] === t)) {
      at = i;
      break;
    }
  }
  const given = tokens.slice(0, Math.max(at, 0));
  // A declared form matches anywhere in the given names, not only at the front.
  // The corpus writes the same person's given names several ways -- an initial
  // ahead of the name they publish under ("J. Merrill Carlsmith", "W. Robertson
  // Smith"), or a connective the split leaves behind ("with Christopher
  // Vaughan") -- and a front-anchored match files every one of those on the bare
  // surname, splitting the scholar it was declared to join. Matching a
  // contiguous run keeps multi-token forms ("Julian Tudor") exact.
  //
  // Among the forms that match, the LONGEST wins, not the first declared: with
  // first-match, a form that is a prefix run of another ("David" beside
  // "David L") silently absorbed the longer form's person, and the array order
  // in the config decided who somebody is. Longest-match is order-independent,
  // so the declaration can never be arranged into merging two people.
  const fTokens = forms.map((f) => [f, f.split(/\s+/)]);
  const form = fTokens
    .filter(([, ft]) => given.some((_, i) => ft.every((t, j) => given[i + j] === t)))
    .reduce((best, m) => (best === null || m[1].length > best[1].length ? m : best), null);
  return form ? `${surname} (${form[0]})` : surname;
}

export function surnames(source, homonyms = {}) {
  // Distinct: one surname per scholar named, not per time they are named. A cell
  // that pairs an author with a paper of theirs whose full author list repeats
  // them -- "Myles Allen; Stott, Stone & Allen", "Tania Singer & Olga Klimecki;
  // Klimecki, Leiberg, Lamm & Singer" -- names one Allen and one Singer, and
  // without this emits the same scholar twice, so the index renders that engine's
  // row twice under them. The contract above is one surname each; a Set is what
  // makes the code say so.
  return [
    ...new Set(
      source
        .replace(/\bet al\.?/gi, "")
        // Split on separators only; trimming handles surrounding whitespace. No
        // whitespace quantifier wraps the alternation, so the match stays linear.
        .split(/[,;&]|\s+and\s+/i)
        .map((part) => stripQualifier(part))
        .filter(Boolean)
        .filter((part) => !NON_AUTHOR.has(part.toLowerCase()))
        .map((part) => [part, surnameOf(part)])
        // A scholar surname is a proper noun: it begins with an uppercase letter.
        // This is the structural invariant that replaces per-row judgement — it
        // drops "effect" (Boundary of the effect), "calculus" (The individual
        // calculus), "2001" (Nobel 2001) and every future idiom of that shape
        // without a list to maintain.
        .filter(([, token]) => /^\p{Lu}/u.test(token))
        .map(([part, token]) => scholarKey(part, token, homonyms)),
    ),
  ];
}

/**
 * What a composite wires, read from its own dependencies. The dependency graph
 * is the citation graph: a composite declares every atom it links, so the
 * pairing needs no second list to drift from.
 *
 * An atom can itself be a composite. `love-hate` wires the love and hate
 * composites rather than engines, so matching only `khai-engine-` would render
 * the one second-order composite in the corpus as combining nothing. Each entry
 * carries its layer so the render can italicise a composite atom the way the
 * index italicises a composite everywhere else.
 *
 * An atom engine depends on no engine and yields [], which is the honest answer:
 * it combines nothing.
 */
function atomsOf(manifest) {
  const PREFIXES = [
    ["@chbrain/khai-engine-", "atom"],
    ["@chbrain/khai-composite-", "composite"],
  ];
  return Object.keys(manifest.dependencies || {})
    .flatMap((dep) => {
      for (const [prefix, layer] of PREFIXES) {
        if (dep.startsWith(prefix)) return [{ name: dep.slice(prefix.length), layer }];
      }
      return [];
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Distinct member types in an engine's tree (explicit members, or shorthand root). */
function compositionTypes(khai) {
  if (Array.isArray(khai.members)) {
    return [...new Set(khai.members.map((m) => m.type).filter(Boolean))];
  }
  return khai.type ? [khai.type] : [];
}

// --- collection ----------------------------------------------------------

/** Package dirs under <root>/packages/<kind>/*. */
function packageDirs(root, kind) {
  const dir = join(root, "packages", kind);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .sort()
    .map((d) => join(dir, d))
    .filter((p) => statSync(p).isDirectory() && existsSync(join(p, "package.json")));
}

/**
 * Every warrant-bearing package dir, tagged by layer. Composites author their
 * own REFERENCES.md (the integrative warrant over their atoms), so their Origin
 * tables index exactly like an atom engine's.
 */
function engineDirs(root) {
  return [
    ...packageDirs(root, "engines").map((dir) => ({ dir, layer: "atom" })),
    ...packageDirs(root, "composites").map((dir) => ({ dir, layer: "composite" })),
  ];
}

/**
 * Read every engine's manifest + Origin table into the index model. Throws if an
 * engine ships a REFERENCES.md whose Origin has no parseable Source table: the
 * index is only as complete as its source, so a silent gap is not allowed.
 */
export function collectScience(root) {
  const records = []; // one per (engine, scholar)
  const byEngine = [];
  const homonyms = scholarHomonyms(root);
  const nonAuthors = scholarPolicy(root).nonAuthorSources ?? [];
  for (const { dir, layer } of engineDirs(root)) {
    const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    const khai = manifest.khai;
    if (!khai || !khai.engine) continue;
    // Infra engines that root on no cast/element type (e.g. spine, which lifts
    // the class:meta architecture itself) carry no external science warrant, so
    // they are not part of the science map.
    if (!khai.type) continue;
    const refPath = join(dir, "REFERENCES.md");
    if (!existsSync(refPath)) continue;
    const origin = sliceChapter(readFileSync(refPath, "utf8"), "Origin");
    const malformed = originRowErrors(origin, nonAuthors);
    if (malformed.length)
      throw new Error(
        `collectScience: engine "${khai.engine}" REFERENCES.md: ${malformed.join("; ")}`,
      );
    const rows = parseOriginTable(origin);
    if (rows.length === 0)
      throw new Error(
        `collectScience: engine "${khai.engine}" has no parseable Origin table in REFERENCES.md`,
      );
    byEngine.push({
      engine: khai.engine,
      layer,
      root: khai.type || "?",
      composition: compositionTypes(khai),
      atoms: atomsOf(manifest),
      requires: [...new Set((khai.requires || []).map((r) => r.on))],
      sources: rows.map((r) => r.source),
    });
    for (const r of rows)
      for (const surname of surnames(r.source, homonyms))
        records.push({ surname, ...r, engine: khai.engine, layer, root: khai.type || "?" });
  }
  return { records, byEngine };
}

/**
 * Undeclared shared surnames: the homonym drift gate.
 *
 * The index keys on surname, so two scholars who share one collate into a single
 * heading unless `scholarPolicy.homonyms` says the surname is shared. That merge
 * is silent -- the index renders one **Smith** holding nine people and looks
 * exactly like one prolific scholar -- so the corpus needs a wall that notices
 * when a new citation lands on a surname already carrying somebody else.
 *
 * The evidence is the corpus's own given names. A surname is REPORTED when its
 * rows carry two or more distinct given names that are each a full word, and
 * the surname is not declared. Bare initials never count: "C. R. Snyder" and
 * "Mark Snyder" are the same shape as one person written two ways, which is the
 * case the declared policy exists to arbitrate and this function must not
 * pre-judge. That is why this reports rather than decides -- "Steve"/"Steven"
 * Gangestad and "Art"/"Arthur" Graesser are one person each, so a maintainer
 * reads the report and declares only the surnames that are genuinely shared.
 *
 * The counterpart list `scholarPolicy.oneScholar` closes the other half: a
 * surname declared there is one person the corpus writes several ways (an
 * accent, a diminutive, a middle name used as a first), so the report stays
 * silent for it without inventing a split. Every surname belongs in at most one
 * of the two lists, and the gate says so.
 *
 * Returns one message per undeclared shared surname, empty when the corpus and
 * the policy agree.
 */
export function scholarCollisions(root) {
  const homonyms = scholarHomonyms(root);
  const nonAuthors = scholarPolicy(root).nonAuthorSources ?? [];
  const one = new Set(scholarPolicy(root).oneScholar ?? []);
  const both = Object.keys(homonyms).filter((s) => one.has(s));
  if (both.length)
    return [
      `surname(s) ${both.join(", ")} are declared in both scholarPolicy.homonyms ` +
        `(different people) and scholarPolicy.oneScholar (one person); they cannot be both.`,
    ];
  const { records } = collectScience(root);
  const given = new Map(); // surname -> Set of full given names seen
  for (const r of records) {
    // The key may already carry a declared form; the bare surname is what the
    // corpus shares, so strip it back before comparing.
    const surname = r.surname.replace(/\s+\(.*\)$/, "");
    if (Object.hasOwn(homonyms, surname) || one.has(surname)) continue;
    for (const person of r.source.replace(/\*\*/g, "").split(/[,;&]|\s+and\s+/i)) {
      const tokens = stripQualifier(person).replace(/[.]/g, "").split(/\s+/).filter(Boolean);
      const at = tokens.lastIndexOf(surname);
      if (at <= 0) continue; // not this surname, or no given name ahead of it
      // A particle is part of a name, never a given name: a cell that cites
      // "van Dijk" bare must not read as a scholar called van.
      const first = tokens
        .slice(0, at)
        .find((t) => t.length > 1 && !PARTICLES.has(t.toLowerCase()));
      if (!first) continue; // initials or particles only: no evidence either way
      if (!given.has(surname)) given.set(surname, new Set());
      given.get(surname).add(first);
    }
  }
  return [...given.entries()]
    .filter(([, forms]) => forms.size > 1)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(
      ([surname, forms]) =>
        `surname "${surname}" carries ${forms.size} distinct given names ` +
        `(${[...forms].sort().join(", ")}) and is not declared in scholarPolicy.homonyms; ` +
        `the index merges them into one heading. Declare the forms that name ` +
        `different people, or leave it if they are one person written several ways.`,
    );
}

// --- rendering -----------------------------------------------------------

// Escape backslash first, then the pipe, so the table-cell escaping cannot be
// bypassed by a literal backslash in the input (js/incomplete-sanitization).
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");

/** Render the model into the generated markdown. Deterministic: stable sorts only. */
export function renderScienceIndex({ records, byEngine }) {
  const bySurname = new Map();
  for (const r of records) {
    if (!bySurname.has(r.surname)) bySurname.set(r.surname, []);
    bySurname.get(r.surname).push(r);
  }
  const scholars = [...bySurname.keys()].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );
  // Composites carry an integrative warrant over their atoms; they index like
  // any engine but render italicised so the layer is visible at a glance.
  const composites = byEngine.filter((e) => e.layer === "composite").length;
  const engineCell = (e) => (e.layer === "composite" ? `_${e.engine}_` : e.engine);

  const L = [];
  L.push("<!-- GENERATED by `khai-tests science build` — DO NOT EDIT BY HAND. -->");
  L.push("<!-- Source of truth: each engine's REFERENCES.md Origin table (LORE). -->");
  L.push("");
  L.push("# khai science index");
  L.push("");
  L.push(
    `The forward map: **science → engine**. Inverted from the Origin table every ` +
      `engine's \`REFERENCES.md\` carries, so navigation and the reverse warrant ` +
      `share one source and cannot drift. ${byEngine.length} engines, ${bySurname.size} scholars.` +
      (composites > 0
        ? ` Of the engines, ${composites} ${composites === 1 ? "is a composite" : "are composites"} (_italicised_): their Origin tables carry the integrative warrant of the layer read, while each corner's primary science stays its atom's.`
        : ""),
  );

  L.push("");
  L.push("## By science");
  L.push("");
  L.push("| Scholar | Engine | Root | Key Work | Scope |");
  L.push("| --- | --- | --- | --- | --- |");
  for (const scholar of scholars) {
    const rows = bySurname
      .get(scholar)
      .sort((a, b) => a.engine.localeCompare(b.engine) || a.keyWork.localeCompare(b.keyWork));
    rows.forEach((r, i) => {
      const label = i === 0 ? `**${esc(scholar)}**` : "↳";
      const work =
        r.source === scholar ? esc(r.keyWork) : `${esc(r.keyWork)} <br><sub>${esc(r.source)}</sub>`;
      L.push(`| ${label} | ${engineCell(r)} | \`${r.root}\` | ${work} | ${esc(r.scope)} |`);
    });
  }

  L.push("");
  L.push("## By engine");
  L.push("");
  L.push("| Engine | Root | Composition | Atoms | Wires into | Sources |");
  L.push("| --- | --- | --- | --- | --- | --- |");
  for (const e of [...byEngine].sort((a, b) => a.engine.localeCompare(b.engine))) {
    const comp = e.composition.map((t) => `\`${t}\``).join(" ");
    const req = e.requires.map((t) => `\`${t}\``).join(" ");
    // Empty for an atom engine, which combines nothing. The column exists for
    // the composites: which engines a composite joins is the one thing the
    // index could not answer, and it is the first question asked of one.
    const atoms = e.atoms
      .map((a) => (a.layer === "composite" ? `_\`${a.name}\`_` : `\`${a.name}\``))
      .join(" + ");
    L.push(
      `| ${engineCell(e)} | \`${e.root}\` | ${comp} | ${atoms} | ${req} | ${esc(e.sources.join("; "))} |`,
    );
  }

  L.push("");
  L.push("## By root type");
  L.push("");
  const byRoot = new Map();
  for (const e of byEngine) {
    if (!byRoot.has(e.root)) byRoot.set(e.root, []);
    byRoot.get(e.root).push(e);
  }
  for (const root of [...byRoot.keys()].sort()) {
    const names = byRoot
      .get(root)
      .sort((a, b) => a.engine.localeCompare(b.engine))
      .map(engineCell);
    L.push(`- **\`${root}\`** (${names.length}): ${names.join(", ")}`);
  }
  L.push("");
  return L.join("\n");
}

// --- collection houses ---------------------------------------------------
//
// An engine monorepo indexes packages (packages/engines/*, each a package.json +
// REFERENCES.md). A *collection* house — a production house like khai-misfits —
// indexes content subdirs instead: `misfits/<id>/`, each a folder of markdown
// with a `REFERENCE.md` warrant and no per-item package.json. Such a house
// declares its shape in `khai.collection` (the same knob the registry build
// reads), so the science index is computed from the very same Origin tables the
// per-item warrants carry, and a staged item missing from the index is caught by
// the drift gate rather than by a human noticing months later.

/** Content unit dirs under <root>/<collection.dir>/*, each a warrant-bearing item. */
function unitDirs(root, collection) {
  const base = join(root, collection.dir);
  if (!existsSync(base)) return [];
  return readdirSync(base)
    .filter((d) => !d.startsWith("."))
    .sort()
    .map((id) => ({ id, dir: join(base, id) }))
    .filter((u) => statSync(u.dir).isDirectory());
}

/** A unit's warrant file: REFERENCE.md, or REFERENCES.md as a fallback. */
function unitWarrant(dir) {
  for (const name of ["REFERENCE.md", "REFERENCES.md"]) {
    const p = join(dir, name);
    if (existsSync(p)) return p;
  }
  return null;
}

/**
 * Read every unit's Origin table into the index model, for a collection house.
 * A unit is a content subdir whose id is its dir name. Throws if a unit ships a
 * warrant whose Origin has no parseable Source table: the index is only as
 * complete as its source, so a silent gap is not allowed (this is the check that
 * would have caught a staged misfit missing from the concordance).
 */
export function collectCollectionScience(
  root,
  collection = resolveCollection(safePackageJson(root)),
) {
  const records = []; // one per (unit, scholar)
  const byUnit = [];
  const homonyms = scholarHomonyms(root);
  const nonAuthors = scholarPolicy(root).nonAuthorSources ?? [];
  for (const { id, dir } of unitDirs(root, collection)) {
    const refPath = unitWarrant(dir);
    if (!refPath) continue; // a dir with no warrant is not a science-bearing unit
    const origin = sliceChapter(readFileSync(refPath, "utf8"), "Origin");
    const malformed = originRowErrors(origin, nonAuthors);
    if (malformed.length)
      throw new Error(
        `collectCollectionScience: ${collection.dir}/${id} ${basename(refPath)}: ${malformed.join("; ")}`,
      );
    const rows = parseOriginTable(origin);
    if (rows.length === 0)
      throw new Error(
        `collectCollectionScience: ${collection.dir}/${id} has no parseable Origin table in ${basename(refPath)}`,
      );
    byUnit.push({ unit: id, sources: rows.map((r) => r.source) });
    for (const r of rows)
      for (const surname of surnames(r.source, homonyms)) records.push({ surname, ...r, unit: id });
  }
  return { records, byUnit };
}

/** Render a collection house's model into the generated markdown. Deterministic. */
export function renderCollectionIndex({ records, byUnit }, collection) {
  const key = collection.key;
  const noun = collectionKind(undefined, key); // "misfits" -> "misfit"
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1);

  const bySurname = new Map();
  for (const r of records) {
    if (!bySurname.has(r.surname)) bySurname.set(r.surname, []);
    bySurname.get(r.surname).push(r);
  }
  const scholars = [...bySurname.keys()].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );

  const L = [];
  L.push("<!-- GENERATED by `khai-tests science build` — DO NOT EDIT BY HAND. -->");
  L.push(`<!-- Source of truth: each ${noun}'s REFERENCE.md Origin table. -->`);
  L.push("");
  L.push(`# ${key} science index`);
  L.push("");
  L.push(
    `The forward map: **science → ${noun}**. Inverted from the Origin table every ` +
      `${noun}'s \`REFERENCE.md\` carries, so navigation and the per-${noun} warrant ` +
      `share one source and cannot drift. ${byUnit.length} ${key}, ${bySurname.size} scholars.`,
  );

  L.push("");
  L.push("## By science");
  L.push("");
  L.push(`| Scholar | ${Noun} | Key Work | Scope |`);
  L.push("| --- | --- | --- | --- |");
  for (const scholar of scholars) {
    const rows = bySurname
      .get(scholar)
      .sort((a, b) => a.unit.localeCompare(b.unit) || a.keyWork.localeCompare(b.keyWork));
    rows.forEach((r, i) => {
      const label = i === 0 ? `**${esc(scholar)}**` : "↳";
      const work =
        r.source === scholar ? esc(r.keyWork) : `${esc(r.keyWork)} <br><sub>${esc(r.source)}</sub>`;
      L.push(`| ${label} | \`${r.unit}\` | ${work} | ${esc(r.scope)} |`);
    });
  }

  L.push("");
  L.push(`## By ${noun}`);
  L.push("");
  L.push(`| ${Noun} | Sources |`);
  L.push("| --- | --- |");
  for (const u of [...byUnit].sort((a, b) => a.unit.localeCompare(b.unit))) {
    L.push(`| \`${u.unit}\` | ${esc(u.sources.join("; "))} |`);
  }
  L.push("");
  return L.join("\n");
}

// --- build / verify ------------------------------------------------------

/**
 * Compute the index text for a root, dispatching on its shape: a house that
 * declares `khai.collection` (a production house indexing content subdirs) is
 * rendered from its units' REFERENCE.md warrants; anything else is the engine
 * monorepo, rendered exactly as before (this path is byte-identical to the
 * pre-collection builder — the engine index cannot change).
 */
function renderForRoot(root) {
  const pkg = safePackageJson(root);
  if (pkg?.khai?.collection) {
    const collection = resolveCollection(pkg);
    return renderCollectionIndex(collectCollectionScience(root, collection), collection);
  }
  return renderScienceIndex(collectScience(root));
}

/** Build the index from source and write it. The single writer of the index. */
export function buildScienceIndex(root) {
  const text = renderForRoot(root);
  writeFileSync(join(root, SCIENCE_INDEX_PATH), text);
  return text;
}

// A rendered index line is a whole table row and runs to several hundred
// characters, so a pair of them has to be trimmed to be read at all.
//
// Trimmed around the difference, NOT from the start of the line -- which is the
// version of this that was written first and was worse than nothing. Two rows
// that differ in their Scope cell are identical for their first two hundred
// characters, so a head-anchored excerpt printed the same text twice under
// "committed:" and "built:" and left the reader to conclude the gate was
// broken. The window is anchored on the first differing column and is the same
// window for both lines, so the difference is on screen and the two excerpts
// line up under each other.
const DRIFT_WINDOW = 120;
const DRIFT_LEAD = 30;

/** The first column at which two strings differ (their common length if not). */
function firstDivergence(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return n;
}

/** One line excerpted through a shared window, with elision marked at each end. */
function excerpt(line, from) {
  if (line === undefined) return "(end of file)";
  const head = from > 0 ? "…" : "";
  const tail = line.length > from + DRIFT_WINDOW ? "…" : "";
  return `${head}${line.slice(from, from + DRIFT_WINDOW)}${tail}`;
}

/**
 * The first line where the committed index and a fresh build disagree, as
 * `{ line, column, committed, built }`, or null when they are identical.
 *
 * Line-level rather than whole-file on purpose: the index is one row per
 * (unit, scholar) plus a counts header, so the differing LINE names the thing
 * that drifted -- a changed Origin row, or the header when a whole unit
 * appeared.
 */
function firstDrift(committed, built) {
  const a = committed.split("\n");
  const b = built.split("\n");
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === b[i]) continue;
    const col = firstDivergence(a[i] ?? "", b[i] ?? "");
    const from = Math.max(0, col - DRIFT_LEAD);
    return {
      line: i + 1,
      column: col + 1,
      committed: excerpt(a[i], from),
      built: excerpt(b[i], from),
    };
  }
  return null;
}

/**
 * The drift gate: the committed index must equal what the build produces from
 * source. Returns an array of error strings (empty when in sync), mirroring the
 * shape the registry drift gate uses.
 *
 * The out-of-date error names the first differing line. "Out of date" alone is
 * a sufficient exit code and a useless report: the fix command is the same
 * either way, but a reader who cannot see WHAT drifted cannot tell a stale
 * index apart from a builder that changed under them.
 */
export function verifyScienceIndex(root) {
  const built = renderForRoot(root);
  const path = join(root, SCIENCE_INDEX_PATH);
  if (!existsSync(path))
    return [`${SCIENCE_INDEX_PATH} is missing; run \`khai-tests science build\``];
  const committed = readFileSync(path, "utf8");
  if (committed === built) return [];

  const at = firstDrift(committed, built);
  return [
    [
      `${SCIENCE_INDEX_PATH} is out of date; run \`khai-tests science build\``,
      `  first difference at line ${at.line}, column ${at.column}:`,
      `    committed: ${at.committed}`,
      `    built:     ${at.built}`,
    ].join("\n"),
  ];
}
