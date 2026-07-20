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

// --- normalization -------------------------------------------------------

/**
 * Canonical surnames for an authored Source cell, so the same scholar collates
 * across engines however they were written. Multi-author cells contribute one
 * surname each, so a shared author links every engine that cites them:
 *   "Amos Tversky & Daniel Kahneman" -> ["Tversky", "Kahneman"]
 *   "Kahneman & Tversky"             -> ["Kahneman", "Tversky"]
 *   "Dan P. McAdams et al."          -> ["McAdams"]
 *   "Mayer, Davis & Schoorman"       -> ["Mayer", "Davis", "Schoorman"]
 */
export function surnames(source) {
  return (
    source
      .replace(/\bet al\.?/gi, "")
      // Split on separators only; trimming handles surrounding whitespace. No
      // whitespace quantifier wraps the alternation, so the match stays linear.
      .split(/[,;&]|\s+and\s+/i)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const tokens = part.replace(/[.,]/g, "").split(/\s+/).filter(Boolean);
        return tokens[tokens.length - 1] || part;
      })
      .filter(Boolean)
  );
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
  for (const { dir, layer } of engineDirs(root)) {
    const khai = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).khai;
    if (!khai || !khai.engine) continue;
    // Infra engines that root on no cast/element type (e.g. spine, which lifts
    // the class:meta architecture itself) carry no external science warrant, so
    // they are not part of the science map.
    if (!khai.type) continue;
    const refPath = join(dir, "REFERENCES.md");
    if (!existsSync(refPath)) continue;
    const rows = parseOriginTable(sliceChapter(readFileSync(refPath, "utf8"), "Origin"));
    if (rows.length === 0)
      throw new Error(
        `collectScience: engine "${khai.engine}" has no parseable Origin table in REFERENCES.md`,
      );
    byEngine.push({
      engine: khai.engine,
      layer,
      root: khai.type || "?",
      composition: compositionTypes(khai),
      requires: [...new Set((khai.requires || []).map((r) => r.on))],
      sources: rows.map((r) => r.source),
    });
    for (const r of rows)
      for (const surname of surnames(r.source))
        records.push({ surname, ...r, engine: khai.engine, layer, root: khai.type || "?" });
  }
  return { records, byEngine };
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
  L.push("| Engine | Root | Composition | Wires into | Sources |");
  L.push("| --- | --- | --- | --- | --- |");
  for (const e of [...byEngine].sort((a, b) => a.engine.localeCompare(b.engine))) {
    const comp = e.composition.map((t) => `\`${t}\``).join(" ");
    const req = e.requires.map((t) => `\`${t}\``).join(" ");
    L.push(
      `| ${engineCell(e)} | \`${e.root}\` | ${comp} | ${req} | ${esc(e.sources.join("; "))} |`,
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
  for (const { id, dir } of unitDirs(root, collection)) {
    const refPath = unitWarrant(dir);
    if (!refPath) continue; // a dir with no warrant is not a science-bearing unit
    const rows = parseOriginTable(sliceChapter(readFileSync(refPath, "utf8"), "Origin"));
    if (rows.length === 0)
      throw new Error(
        `collectCollectionScience: ${collection.dir}/${id} has no parseable Origin table in ${basename(refPath)}`,
      );
    byUnit.push({ unit: id, sources: rows.map((r) => r.source) });
    for (const r of rows)
      for (const surname of surnames(r.source)) records.push({ surname, ...r, unit: id });
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

/**
 * The drift gate: the committed index must equal what the build produces from
 * source. Returns an array of error strings (empty when in sync), mirroring the
 * shape the registry drift gate uses.
 */
export function verifyScienceIndex(root) {
  const built = renderForRoot(root);
  const path = join(root, SCIENCE_INDEX_PATH);
  if (!existsSync(path))
    return [`${SCIENCE_INDEX_PATH} is missing; run \`khai-tests science build\``];
  const committed = readFileSync(path, "utf8");
  if (committed !== built)
    return [`${SCIENCE_INDEX_PATH} is out of date; run \`khai-tests science build\``];
  return [];
}
