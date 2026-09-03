// A published khai house, read from outside it.
//
// `@chbrain/khai-tests` answers "where does a unit live" from a WORKTREE: it
// walks a workspace, reads manifests, consults git. That is the producing
// vantage, and it is no use to a consumer, who has an installed dependency tree
// and nothing else -- no worktree, no history, and no promise about how
// node_modules is laid out. This file is the same question from the other side.
//
// WHY IT EXISTS. A house that runs a migration ratchet keeps its content in two
// places, and for a while only the producing side was told. Every consumer went
// on resolving a unit by the rule that was true before the ratchet -- the
// umbrella's collection directory, one subdirectory per unit -- and the registry
// had already recorded that the rule was false for a growing share of its
// entries. A consumer read the record and ignored that half of it. The website's
// download producer would have dropped 47 of 316 cultures on the next dependency
// bump, logged one line each, and exited zero; and because the ratchet is
// one-way, the number a consumer can resolve only ever falls. On the day the
// last unit migrates, that consumer reads an empty house, reports nothing
// wrong, and publishes nothing.
//
// So: no consumer constructs a path to a unit, ever again. The registry entry
// carries `source` -- the npm package that ships the files and the path below
// its root -- and the resolver npm itself provides turns that into a directory.
// Both halves are written down; neither side infers the other's layout.
//
// AND IT FAILS CLOSED. Every list here refuses to be quietly short. A unit whose
// package will not resolve is an error naming it, not a skipped iteration,
// because a producer that ships 269 of 316 and reports success is the exact
// shape of failure this package was written to end. A caller who genuinely
// wants a partial house asks for one, and is handed the losses to print.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { linkTarget } from "./links.mjs";

/**
 * What a file inside a unit is for. Only `member` and `doc` are CONTENT; the
 * rest is the house's own bookkeeping.
 *
 * The distinction is an allowlist on purpose, and the inversion matters. A
 * consumer that took "every file in this directory" to mean content was right
 * about a unit directory under an umbrella and wrong about a package root,
 * which carries a manifest, a licence pair, a Playwright guide, a coverage
 * waiver list and a changelog beside the same content -- a set that grows with
 * the PACKAGING, not with the content. A denylist of those names would need
 * editing in every consumer each time the packaging gained a file. So content
 * is what the registry vouches for plus a closed set of companion documents,
 * and `packaging` is simply everything else, named but never enumerated.
 */
export const ROLES = Object.freeze({
  MEMBER: "member",
  DOC: "doc",
  SIDECAR: "sidecar",
  PACKAGING: "packaging",
});

/** The companion documents a unit may carry beside its members. Closed. */
const DOCS = new Set(["README.md", "REFERENCES.md"]);

/** Per-item metadata the build already folded into the registry entry. */
const SIDECARS = new Set(["geo.json"]);

/** Whether a role counts as the unit's content. */
export const isContent = (role) => role === ROLES.MEMBER || role === ROLES.DOC;

const posix = (p) => String(p).split("\\").join("/");

/**
 * Open a published house from an installed dependency tree.
 *
 * `resolve` is INJECTED, never imported, and this is not ceremony. A resolver
 * called from inside this package resolves against this package's own
 * node_modules; under a hoisted install that happens to give the right answer,
 * and the first time the tree is not hoisted it gives a wrong one silently. The
 * consumer's own module is the only correct resolution root, so the consumer
 * hands it over:
 *
 *   import { createRequire } from "node:module";
 *   const house = openHouse("@chbrain/khai-cultures", {
 *     resolve: createRequire(import.meta.url).resolve,
 *   });
 *
 * @param {string} specifier the house's npm name
 * @param {{ resolve: (s: string) => string }} opts
 */
export function openHouse(specifier, { resolve } = {}) {
  if (typeof resolve !== "function")
    throw new TypeError(
      `openHouse(${specifier}): pass { resolve } -- createRequire(import.meta.url).resolve ` +
        `from the CONSUMING module. Resolving from inside this package would read this ` +
        `package's node_modules, which is right only by luck under a hoisted install.`,
    );

  const packageDir = resolveDir(specifier, resolve, specifier);
  const pkg = readJson(join(packageDir, "package.json"));
  const registry = readJson(join(packageDir, "registry.json"));

  const keys = Object.keys(registry).filter((k) => Array.isArray(registry[k]));
  if (!keys.length)
    throw new Error(
      `openHouse(${specifier}): its registry.json holds no collection array. This is not ` +
        `a khai house registry, or it was never built.`,
    );

  return new House({ specifier, packageDir, pkg, registry, keys, resolve });
}

class House {
  constructor({ specifier, packageDir, pkg, registry, keys, resolve }) {
    this.specifier = specifier;
    this.packageDir = packageDir;
    this.name = pkg.name ?? specifier;
    this.version = pkg.version ?? registry.version ?? null;
    this.registry = registry;
    this.resolve = resolve;
    // The primary collection is the one the house declares; the rest reference
    // it. `khai.collection` names the primary even when a house indexes several.
    const declared = pkg.khai?.collection;
    const primaryKey = typeof declared === "string" ? declared : declared?.key;
    this.keys = keys;
    this.primaryKey = keys.includes(primaryKey) ? primaryKey : keys[0];
  }

  /** The house's own entries for one collection, raw. */
  entries(key = this.primaryKey) {
    const rows = this.registry[key];
    if (!Array.isArray(rows)) throw new Error(`${this.name}: registry.json has no "${key}" array`);
    return rows;
  }

  /**
   * One entry resolved, or the reason it could not be. The single place an
   * entry becomes a directory: `units`, `unit` and `verify` all come through
   * here, so none of them can drift into a second opinion about what
   * "installed" means.
   */
  resolveEntry(entry) {
    const src = entry.source;
    if (!src || typeof src.package !== "string")
      return { id: entry.id, reason: "the registry entry carries no `source`" };
    let dir;
    try {
      dir = join(resolveDir(src.package, this.resolve, this.name), ...split(src.path));
    } catch (err) {
      return { id: entry.id, package: src.package, reason: err.message };
    }
    // Resolving is not finding. A resolver answers from a manifest and from its
    // own cache, so it can hand back a path for a directory that is not there --
    // a half-finished install, a package pruned after the first read. A unit
    // whose directory cannot be listed is missing, whatever the resolver says.
    if (!isDir(dir))
      return {
        id: entry.id,
        package: src.package,
        reason: `${src.package} resolves to ${dir}, which is not a readable directory`,
      };
    return { unit: { ...entry, house: this, dir, package: src.package } };
  }

  /**
   * Every unit of a collection, resolved to a directory on disk.
   *
   * Throws unless every one resolves. `{ partial: true }` returns
   * `{ resolved, missing }` instead, for a caller who has decided a hole is
   * acceptable and will say so out loud.
   */
  units(key = this.primaryKey, { partial = false } = {}) {
    const resolved = [];
    const missing = [];
    for (const entry of this.entries(key)) {
      const got = this.resolveEntry(entry);
      if (got.unit) resolved.push(got.unit);
      else missing.push(got);
    }

    if (partial) return { resolved, missing };
    if (missing.length) throw lost(this, key, resolved, missing);
    return resolved;
  }

  /** One unit by id, or null. Resolves that entry only, never the whole house. */
  unit(id, key = this.primaryKey) {
    const entry = this.entries(key).find((e) => e.id === id);
    if (!entry) return null;
    const got = this.resolveEntry(entry);
    if (got.unit) return got.unit;
    throw new Error(`${this.name}: unit "${id}" is listed but not installed -- ${got.reason}`);
  }

  /**
   * A unit's files, each with the role that decides whether it is content.
   *
   * `members[]` from the registry is the authority for what the house vouches
   * for; the directory is walked only to find what is actually there, so a file
   * the registry lists and the tree lacks shows up as drift rather than as a
   * read that throws halfway through a build.
   */
  filesOf(unit) {
    const listed = new Set((unit.members ?? []).map((m) => m.file));
    return readdirSync(unit.dir)
      .filter((f) => {
        try {
          return statSync(join(unit.dir, f)).isFile();
        } catch {
          return false;
        }
      })
      .sort()
      .map((file) => ({
        file,
        role: listed.has(file)
          ? ROLES.MEMBER
          : DOCS.has(file)
            ? ROLES.DOC
            : SIDECARS.has(file)
              ? ROLES.SIDECAR
              : ROLES.PACKAGING,
        path: join(unit.dir, file),
      }));
  }

  /** Just the content: members and companion docs, never packaging. */
  contentOf(unit) {
    return this.filesOf(unit).filter((f) => isContent(f.role));
  }

  /** One file's bytes. */
  read(unit, file) {
    return readFileSync(join(unit.dir, file));
  }

  /**
   * The npm name of every unit that ships as its own package, mapped to its id
   * -- what {@link linkTarget} needs to read a cast that has become a package
   * specifier. Built from the registry, so it is right at any point in a
   * migration without anyone maintaining a list.
   */
  packageIds(key = this.primaryKey) {
    const out = new Map();
    for (const entry of this.entries(key)) {
      const src = entry.source;
      // A unit whose path is "" IS its package; one that sits at a path below a
      // package shares that package with its siblings and is not addressable by
      // specifier alone.
      if (src?.package && !src.path) out.set(src.package, entry.id);
    }
    return out;
  }

  /**
   * Where a link cast from `unit` lands. The one rule, reading both shapes: a
   * relative path across one tarball, and a package specifier through npm.
   */
  linkTarget(href, unit, key = this.primaryKey) {
    return linkTarget(href, {
      fromFile: join(unit.dir, "x.md"),
      unitsDir: unitsDirFor(this, unit, key),
      packageIds: this.packageIds(key),
    });
  }

  /**
   * What the registry the house shipped and the tree that got installed
   * disagree about. Findings, never a throw: a caller asking this question has
   * already decided to look before acting.
   */
  verify(key = this.primaryKey) {
    const out = [];
    const { resolved, missing } = this.units(key, { partial: true });
    for (const m of missing)
      out.push({ kind: "unresolvable", id: m.id, package: m.package, detail: m.reason });

    for (const unit of resolved) {
      // This method promises findings and never a throw -- a caller asking what
      // disagrees has not yet decided to act, and must not be stopped by the
      // very fault it is asking about. A directory that vanishes between the
      // resolve and the read is such a fault, so it is caught and reported.
      let onDisk;
      try {
        onDisk = new Set(this.filesOf(unit).map((f) => f.file));
      } catch (err) {
        out.push({ kind: "unreadable", id: unit.id, package: unit.package, detail: err.message });
        continue;
      }
      for (const m of unit.members ?? [])
        if (!onDisk.has(m.file))
          out.push({
            kind: "drift",
            id: unit.id,
            detail: `registry lists ${m.file}, which the installed package does not carry`,
          });
    }
    return out;
  }
}

/** The collection directory a relative cast is measured against. */
function unitsDirFor(house, unit, key) {
  const src = unit.source;
  // A unit at a path below its package sits inside the collection directory;
  // its parent IS that directory. A unit that IS its package has no collection
  // directory on disk at all, and only the specifier shape can reach a sibling.
  return src?.path ? dirname(unit.dir) : join(house.packageDir, key);
}

const split = (p) => (p ? posix(p).split("/").filter(Boolean) : []);

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function resolveDir(specifier, resolve, askedBy) {
  try {
    return dirname(resolve(`${specifier}/package.json`));
  } catch (err) {
    throw new Error(
      `cannot resolve ${specifier}/package.json (asked for by ${askedBy}): ${err.message}. ` +
        `Either the package is not installed, or it declares an \`exports\` field that ` +
        `does not export "./package.json" -- which resolves in a workspace and fails ` +
        `for everyone who installs it.`,
    );
  }
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new Error(`cannot read ${path}: ${err.message}`);
  }
}

/** The error a short house raises. Names every loss: a count alone is a shrug. */
function lost(house, key, resolved, missing) {
  const ids = missing.map((m) => m.id).join(", ");
  return new Error(
    `${house.name}@${house.version}: ${missing.length} of ${resolved.length + missing.length} ` +
      `${key} are listed in the registry but not installed (${ids}). Each names the package ` +
      `that ships it in its \`source\`, and the house declares those packages as ` +
      `dependencies, so an install that has them all is the normal case and this is not. ` +
      `A producer that continued here would ship ${resolved.length} and report success. ` +
      `Pass { partial: true } to take the ${resolved.length} and handle the loss yourself.`,
  );
}
