// Where a house's content actually is, and which of its content a diff opened.
//
// A house that indexes a named collection ({@link resolveCollectionAt}) is not
// always one directory. It starts flat -- the collection sits right under the
// repository root -- and some houses migrate it into a workspace, one item at a
// time, so a unit can be a directory under the collection OR a package standing
// beside it (`khai.class === "house"`). Both shapes are declared by a manifest,
// never spelled as a path: a reader that tried `packages/<name>` then `.` would
// be encoding today's layout into every caller, and the day a house takes the
// other shape every one of those readers goes quiet rather than red -- the
// class this file exists to close is a resolver that certifies an empty house
// because it looked in the one place it was told to.
//
// So there is one resolver and every wall in this module goes through it.
// `resolveHouse` throws when no manifest declares a house: a fallback to the
// nearest directory would hand every caller a root with nothing under it, and
// every wall would pass on it.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, relative, resolve, sep } from "node:path";
import { DEFAULT_COLLECTION, resolveCollection, safePackageJson } from "./collection.mjs";
import { workspacePackages } from "./packing.mjs";
import { findGuardConfig } from "./guard-config.mjs";

// The production layer's class, in the canon's own vocabulary. Kept as a local
// literal rather than imported from validate.mjs on purpose: that module pulls
// in the full validator toolchain, and every reader in this file (like
// collection.mjs and packing.mjs beside it) stays light enough to run before a
// single content file is parsed.
const PRODUCTION_CLASS = "house";

/**
 * The house at `root`: the directory whose own manifest declares the
 * collection, wherever it sits, plus every production package standing beside
 * it.
 *
 * Two shapes, one question. Every workspace package (`workspacePackages`,
 * which always includes the root itself) is a candidate; the house is whichever
 * one's `package.json` carries `khai.collection`. A root that declares nothing
 * is still a house when the default collection dir ({@link DEFAULT_COLLECTION})
 * sits right under it -- the historical no-config layout `resolveCollection`
 * already falls back to. Keyed on what a manifest says, never on a directory
 * name: a workspace container is not the house merely for holding `packages/*`,
 * and a directory named after the collection is not the house unless some
 * manifest actually claims it.
 *
 * A workspace can hold more than one thing that declares a collection -- a
 * content house sitting beside an unrelated package that happens to index its
 * own collection too (khai-cultures ships its tongues as exactly this: its own
 * `khai.collection`, no relation to the culture units). That is ambiguous with
 * no manifest to break the tie, so pass `{ name }` (the declaring package's own
 * `name`) to pick one; omitted, more than one declarer is an error naming the
 * candidates rather than guessing.
 *
 * @param {string} root
 * @param {{ name?: string }} [opts] `name`: the declaring package to resolve,
 *   when more than one manifest under `root` declares a collection.
 * @returns {{ root: string, packageDir: string, name: string|null,
 *   collection: {dir: string, key: string, anchor: string},
 *   contentDir: string,
 *   productions: {id: string, name: string, dir: string, pkg: object}[] }}
 */
export function resolveHouse(root, { name: wantName } = {}) {
  const at = resolve(root);
  const pkgs = workspacePackages(at); // name -> dir, root always included
  const declarers = [...pkgs.entries()]
    .map(([name, dir]) => ({ name, dir, pkg: safePackageJson(dir) }))
    .filter((c) => Boolean(c.pkg?.khai?.collection))
    .filter((c) => !wantName || c.name === wantName);

  let packageDir, name, pkg;
  if (declarers.length === 1) {
    ({ dir: packageDir, name, pkg } = declarers[0]);
  } else if (declarers.length > 1) {
    throw new Error(
      `resolveHouse: more than one manifest under ${at} declares khai.collection ` +
        `(${declarers.map((d) => d.name).join(", ")}); pass { name: "<package>" } to pick one`,
    );
  } else if (!wantName && existsSync(join(at, DEFAULT_COLLECTION.dir))) {
    // The historical no-config house: nothing declares a collection and the
    // default dir (`plays/`) sits right at the root, exactly the layout
    // resolveCollection already assumes for a bare package.json. Not
    // considered when a specific `name` was asked for -- that caller wants
    // one declared package, not a directory that happens to be there.
    pkg = safePackageJson(at);
    packageDir = at;
    name = pkg.name ?? null;
  } else {
    throw new Error(
      `resolveHouse: no manifest under ${at} declares khai.collection` +
        (wantName ? ` as "${wantName}"` : "") +
        (wantName
          ? ""
          : `, and no default collection dir (${DEFAULT_COLLECTION.dir}/) sits at the root either`) +
        `. A fallback here would certify an empty house to every wall that reads it.`,
    );
  }

  const collection = resolveCollection(pkg);
  const contentDir = join(packageDir, collection.dir);
  const productions = [...pkgs.entries()]
    .filter(([, dir]) => dir !== packageDir)
    .map(([prodName, dir]) => ({ name: prodName, dir, pkg: safePackageJson(dir) }))
    .filter((p) => p.pkg?.khai?.class === PRODUCTION_CLASS)
    .map((p) => ({
      id: String(p.pkg.khai.production ?? p.name),
      name: p.name,
      dir: p.dir,
      pkg: p.pkg,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return { root: at, packageDir, name, collection, contentDir, productions };
}

/** Whether `dir` holds the collection's own anchor file (`<anchor>*.md`) --
 * the same rule {@link resolveHouse}'s productions and every registry reader
 * use to tell a real item from a directory that merely exists. */
function hasAnchor(dir, anchor) {
  if (!existsSync(dir)) return false;
  return readdirSync(dir).some((f) => f.startsWith(anchor) && f.endsWith(".md"));
}

/**
 * The content dir's own subdirectories, split into real units (carry the
 * collection's anchor file) and empty leftovers (do not). A migration's
 * `git mv` moves a unit's anchor file into its own production package but can
 * leave the directory it came from present on disk, empty -- git tracks no
 * empty directories, but the filesystem does, and a checkout that ran the
 * migration and never pruned it keeps that directory until something removes
 * it. Split here once so both {@link unitsOf} and {@link emptyUnitDirs} read
 * the same walk.
 */
function contentDirEntries(house) {
  const units = [];
  const empty = [];
  if (existsSync(house.contentDir)) {
    for (const e of readdirSync(house.contentDir, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name.startsWith(".")) continue;
      const dir = join(house.contentDir, e.name);
      (hasAnchor(dir, house.collection.anchor) ? units : empty).push({ id: e.name, dir });
    }
  }
  return { units, empty };
}

/**
 * Every unit in a house: the content-dir directories that hold an anchor file
 * plus each production. `{ id, dir }`, sorted by id.
 *
 * A content-dir directory with no anchor file is not counted as a unit at all
 * (see {@link contentDirEntries}) -- a migration in progress can leave one
 * behind, and pairing it with the production the unit moved to would report a
 * false duplicate for a unit that was moved, not copied. Ask
 * {@link emptyUnitDirs} for those directories explicitly; `unitsOf` only
 * ignores them.
 *
 * Throws on a genuine duplicate id -- two places that BOTH carry an anchor
 * (two content directories, two productions, or one of each) -- rather than
 * silently picking one: a migration moves a unit, it never copies it, and a
 * reader that averaged the two would be wrong about both.
 *
 * @param {ReturnType<typeof resolveHouse>} house
 * @returns {{ id: string, dir: string }[]}
 */
export function unitsOf(house) {
  const out = [...contentDirEntries(house).units];
  for (const p of house.productions) out.push({ id: p.id, dir: p.dir });

  const seen = new Map();
  for (const u of out) {
    if (seen.has(u.id) && seen.get(u.id) !== u.dir) {
      throw new Error(
        `unitsOf: unit "${u.id}" is in two places at once (${seen.get(u.id)} and ${u.dir}); ` +
          `a migration moves a unit, it never copies one`,
      );
    }
    seen.set(u.id, u.dir);
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Content-dir directories that hold no anchor file for the house's
 * collection: the leftover a migration's `git mv` can strand once a unit's
 * anchor moved into its own production package and the now-empty source
 * directory was never pruned. `unitsOf` ignores these silently -- one is not a
 * second copy of the unit it used to hold, it is nothing -- but a caller that
 * wants to flag the debris (a cleanliness check, say) asks here rather than
 * re-walking `contentDir` itself.
 *
 * @param {ReturnType<typeof resolveHouse>} house
 * @returns {{ id: string, dir: string }[]}
 */
export function emptyUnitDirs(house) {
  return contentDirEntries(house).empty.sort((a, b) => a.id.localeCompare(b.id));
}

// ---------------------------------------------------------------------------
// Touched units: which unit a git diff range opened, and whether it merely
// relinked.

/** `git show <ref>:<path>` at `root`, or null when the path is not on that ref
 * (added on one side, deleted on the other -- never a relink). */
function show(root, ref, path) {
  try {
    return execFileSync("git", ["show", `${ref}:${path}`], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

/** Every path a diff range touches, as `{from, to}` pairs with renames resolved. */
function changePairs(root, base, head) {
  const out = [];
  const raw = execFileSync("git", ["diff", "--name-status", "-M", base, head], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  for (const line of raw.split("\n").filter(Boolean)) {
    const cols = line.split("\t");
    const status = cols[0];
    if (status.startsWith("R") || status.startsWith("C")) out.push({ from: cols[1], to: cols[2] });
    else if (status.startsWith("A")) out.push({ from: null, to: cols[1] });
    else if (status.startsWith("D")) out.push({ from: cols[1], to: null });
    else out.push({ from: cols[1], to: cols[1] });
  }
  return out;
}

const LINK_TARGET = /\]\([^()\s]*\)/g;
const blindLinks = (text) => text.replace(LINK_TARGET, "](-)");

/** Basenames a migration writes beside a unit that say nothing about the unit
 * itself: a manifest and a licence pair arrive WITH the move. */
const PACKAGING = new Set(["package.json", "LICENSE", "LICENSE-CODE"]);

/**
 * The default relink rule: whether one file's whole change is something other
 * than authoring.
 *
 * Two exemptions. A packaging file (`PACKAGING`) is judged before existence,
 * because it ARRIVES with a migration -- asking whether it changed would file
 * every first migration as authoring. A markdown file whose only difference is
 * where its links point (`blindLinks`) is exempt because a link is a markdown
 * idea and a walk that retargets one is not the unit's own author speaking. A
 * file that moved without changing is the same file, checked before the
 * markdown gate so a non-markdown file (a manifest's sibling data file) that
 * moved untouched is spared too.
 *
 * This is a default and not the rule: a house whose migration writes different
 * packaging, or that wants no link exemption at all, passes its own function of
 * the same shape to {@link touchedUnits} instead.
 *
 * @param {{from: string|null, to: string|null}} change
 * @param {string} base
 * @param {string} head
 * @param {string} root
 * @returns {boolean}
 */
export function defaultRelink(change, base, head, root) {
  const { from, to } = change;
  const leaf = (to ?? from ?? "").split("/").pop();
  if (PACKAGING.has(leaf)) return true;
  if (!from || !to) return false;
  const before = show(root, base, from);
  const after = show(root, head, to);
  if (before === null || after === null) return false;
  if (before === after) return true;
  if (!to.endsWith(".md")) return false;
  return blindLinks(before) === blindLinks(after);
}

/** The unit owning a repository-relative path, or null. */
function unitFor(path, units, root) {
  const p = String(path).replace(/\\/g, "/");
  for (const u of units) {
    const prefix = `${relative(root, u.dir).split(sep).join("/")}/`;
    if (p.startsWith(prefix)) return u;
  }
  return null;
}

/**
 * The units a diff range touches, each flagged for whether it was AUTHORED (at
 * least one change the relink rule does not exempt) or merely RELINKED (every
 * change exempt). An untouched unit does not appear. Each entry in `files`
 * carries the same `authored` verdict for that one file, so a caller that
 * classifies the unit as a whole (`authored`/`relinkOnly`) can still tell which
 * of its files earned that verdict and which merely rode along -- see
 * {@link authoredFiles} for the caller that wants exactly that.
 *
 * Pass `isRelink` to use a house's own rule in place of {@link defaultRelink};
 * it is called once per changed file as `isRelink(change, base, head, root)`.
 *
 * PAIRING WITH A RATCHET: a wall that charges only what a pull request wrote in
 * (rather than the whole house) filters `isolationErrors`/`filenameErrors` down
 * to the ids `touchedUnits` marks `authored`, and only THOSE findings feed
 * {@link ratchet} -- a unit this diff only relinked, or never touched at all,
 * owes nothing:
 *
 * ```js
 * const authored = new Set(
 *   touchedUnits(house, { base, head }).filter((u) => u.authored).map((u) => u.id),
 * );
 * const findings = isolationErrors(house).filter((f) => authored.has(f.unit));
 * ratchet({ name: "isolation", findings, baseline: 0 });
 * ```
 *
 * A wall that reads only ONE kind of file inside a unit (a house's plot-zero
 * gate, reading only `plot_*.md`, say) must not stop at the unit-level flag: a
 * unit is `authored` the moment ANY of its files earns that verdict, so a
 * relinked plot sitting beside an unrelated authored persona reads `authored:
 * true` at the unit level though the plot itself was never touched by a human.
 * Read `files[].authored` (or call {@link authoredFiles}) to charge the file
 * that actually earned the verdict, not the unit it happens to share a
 * directory with.
 *
 * @param {ReturnType<typeof resolveHouse>} house
 * @param {{ base: string, head: string, isRelink?: typeof defaultRelink }} range
 * @returns {{ id: string, dir: string, authored: boolean, relinkOnly: boolean,
 *   files: { path: string, authored: boolean }[] }[]}
 */
export function touchedUnits(house, { base, head, isRelink = defaultRelink }) {
  if (!base || !head) throw new Error("touchedUnits: both base and head are required");
  const units = unitsOf(house);
  const byUnit = new Map();
  for (const change of changePairs(house.root, base, head)) {
    for (const side of [change.to, change.from]) {
      if (!side) continue;
      const owner = unitFor(side, units, house.root);
      if (!owner) continue;
      if (!byUnit.has(owner.id)) byUnit.set(owner.id, { unit: owner, changes: [] });
      const entry = byUnit.get(owner.id);
      if (!entry.changes.some((c) => c.from === change.from && c.to === change.to))
        entry.changes.push(change);
    }
  }

  const out = [];
  for (const { unit, changes } of byUnit.values()) {
    const files = changes
      .map((c) => ({ path: c.to ?? c.from, authored: !isRelink(c, base, head, house.root) }))
      .sort((a, b) => a.path.localeCompare(b.path));
    out.push({
      id: unit.id,
      dir: unit.dir,
      authored: files.some((f) => f.authored),
      relinkOnly: !files.some((f) => f.authored),
      files,
    });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * The file-level complement to {@link touchedUnits}: which files a diff range
 * actually authored, per unit, rather than which units it touched.
 *
 * A wall scoped to `touchedUnits`'s unit-level `authored` cannot tell a unit's
 * own change from a change belonging to a file it never reads (the plot-zero
 * case in `touchedUnits`'s own doc): it either charges the whole unit for one
 * authored file among many relinked ones, or -- scoped the other way -- misses
 * an authored file sitting in a unit some OTHER file merely relinked. Reading
 * `files[].authored` off `touchedUnits` answers this already; `authoredFiles`
 * is the same answer reshaped for a caller that wants a lookup by unit id
 * instead of a rescan of the array.
 *
 * @param {ReturnType<typeof resolveHouse>} house
 * @param {{ base: string, head: string, relink?: typeof defaultRelink }} range
 * @returns {Map<string, string[]>} unit id -> its authored file paths (sorted).
 *   A unit with no authored file (relink-only, or untouched) carries no entry
 *   at all -- an empty array and a missing key would read the same to a
 *   caller, so there is only one of them.
 */
export function authoredFiles(house, { base, head, relink = defaultRelink }) {
  const out = new Map();
  for (const unit of touchedUnits(house, { base, head, isRelink: relink })) {
    const files = unit.files.filter((f) => f.authored).map((f) => f.path);
    if (files.length) out.set(unit.id, files);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Unit isolation: a unit's own links stay inside its own directory.

/**
 * A house's isolation policy: `isolationPolicy` in the nearest
 * `khai-guard.config.json` walking up from `root` ({@link findGuardConfig}),
 * same resolution `loadWorkPolicy` uses so a migrated house's config (one
 * directory above its content) is still found.
 *
 * `declared` is false when the key is absent, and that is a caller's signal to
 * skip the wall rather than run it with an empty `allow` -- a house with a real
 * cross-unit idiom (one unit's position held one way and cited by name from
 * another) is red on every such link until it writes down what it means to
 * allow, and a wall red on content a house wrote on purpose is not yet a wall
 * (see `khai-tests house check`). Declaring the key, even with `allow: []`, is
 * the house's own statement that it is ready to be held to this.
 *
 * @param {string} root
 * @returns {{ declared: boolean, allow: string[] }}
 */
export function loadIsolationPolicy(root) {
  const path = findGuardConfig(root);
  if (!path) return { declared: false, allow: [] };
  let cfg;
  try {
    cfg = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return { declared: false, allow: [] };
  }
  if (!cfg || typeof cfg.isolationPolicy !== "object" || cfg.isolationPolicy === null)
    return { declared: false, allow: [] };
  const allow = Array.isArray(cfg.isolationPolicy.allow) ? cfg.isolationPolicy.allow : [];
  return { declared: true, allow };
}

/** A basename glob (`*` only) compiled to a RegExp, anchored both ends. */
function basenameGlob(pattern) {
  const re = String(pattern)
    .split("*")
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${re}$`);
}

/** Every markdown file under `dir`, as `{ file, text }` with `file` absolute. */
function walkMarkdown(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith(".") || e.name === "node_modules") continue;
      const full = join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith(".md")) out.push(full);
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}

/**
 * Every relative markdown link inside a unit that resolves outside that unit's
 * own directory.
 *
 * Resolved, not spelled: `path.resolve` against the linking file's own
 * directory, checked to be the unit dir or below it. A string prefix test on
 * the raw target (does it contain `..`, does it contain `/`) cannot tell a link
 * that nests two directories DEEPER inside the same unit from one that escapes
 * it, and would forbid the first to catch the second.
 *
 * A package specifier (`@scope/pkg/...`) and a URL scheme are not filesystem
 * paths and are never findings here -- a unit reaching another PACKAGE by name
 * is a dependency, not an escape, and is npm's question to answer, not this
 * one's. `allow` exempts a link by its target's basename against a glob (`*`
 * only): a house with a documented cross-unit idiom (one unit's position held
 * one way, cited by name from another) declares it there instead of the wall
 * being red on content it wrote on purpose.
 *
 * @param {ReturnType<typeof resolveHouse>} house
 * @param {{ allow?: string[] }} [opts]
 * @returns {{ unit: string, file: string, target: string, message: string }[]}
 */
export function isolationErrors(house, { allow = [] } = {}) {
  const allowRes = allow.map(basenameGlob);
  const errors = [];
  for (const unit of unitsOf(house)) {
    for (const file of walkMarkdown(unit.dir)) {
      const text = readFileSync(file, "utf8");
      const here = dirname(file);
      const relFile = relative(house.root, file);
      for (const [, raw] of text.matchAll(/\]\(([^()\s]+)\)/g)) {
        const target = raw.split("#")[0];
        if (!target) continue;
        if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue; // a URL scheme
        if (target.startsWith("@")) continue; // a package specifier, not a path
        const base = target.split("/").pop();
        if (allowRes.some((re) => re.test(base))) continue;
        const abs = resolve(here, target);
        if (abs !== unit.dir && !abs.startsWith(unit.dir + sep)) {
          errors.push({
            unit: unit.id,
            file: relFile,
            target,
            message: `${relFile}: link "${target}" escapes unit "${unit.id}"`,
          });
        }
      }
    }
  }
  return errors;
}

// ---------------------------------------------------------------------------
// ASCII filenames: a path component NFC and NFD agree on.

/**
 * Every path component under a unit's own directory carrying a non-ASCII
 * character, one unit (`contentDir`'s own subdirectories, plus each
 * production) at a time.
 *
 * macOS stores a path decomposed (NFD) and Linux composed (NFC), so the same
 * accented filename is a different byte sequence on each, and a link written
 * against one no longer matches a checkout on the other. Scoped to a house's
 * own units rather than the whole root, so a node_modules dependency or a
 * translator's working file elsewhere in the tree is not this wall's business.
 *
 * Shaped like {@link isolationErrors}'s findings (one `unit` per entry) so both
 * walls scope to `touchedUnits` the same way.
 *
 * @param {ReturnType<typeof resolveHouse>} house
 * @returns {{ unit: string, file: string }[]}
 */
export function filenameErrors(house) {
  const offenders = [];
  const check = (unitId, full) => {
    if (/[^\x00-\x7F]/.test(full.split(sep).pop()))
      offenders.push({ unit: unitId, file: relative(house.root, full) });
  };
  const walk = (unitId, dir) => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      const full = join(dir, e.name);
      check(unitId, full);
      if (e.isDirectory()) walk(unitId, full);
    }
  };
  for (const unit of unitsOf(house)) {
    check(unit.id, unit.dir);
    walk(unit.id, unit.dir);
  }
  return offenders.sort((a, b) => a.file.localeCompare(b.file));
}

// ---------------------------------------------------------------------------
// The ratchet: a debt that only shrinks.

/**
 * Small and pure: `findings.length <= baseline` is the whole rule. Every wall
 * in this module returns findings rather than a verdict for exactly this --
 * one caller can hold a house's WHOLE debt to a known baseline while it pays it
 * down, and another (see {@link touchedUnits}'s doc) can hold a pull request to
 * zero on only what it authored, off the same finding list.
 *
 * @param {{ name: string, findings: unknown[], baseline: number }} args
 * @returns {{ ok: boolean, message: string }}
 */
export function ratchet({ name, findings, baseline }) {
  const count = findings.length;
  const ok = count <= baseline;
  const message = ok
    ? `${name}: ${count} finding(s), baseline ${baseline}.`
    : `${name}: ${count} finding(s) exceeds baseline ${baseline} ` +
      `(${count - baseline} new, not paid down elsewhere).`;
  return { ok, message };
}
