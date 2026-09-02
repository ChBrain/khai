#!/usr/bin/env node
// house-drift: which houses run which kit version, computed from outside every
// house.
//
// khai-guard's own `drift` subcommand (packages/khai-guard/bin/khai-guard.mjs)
// answers this from INSIDE one house: it reads that house's own lockfile
// against the registry, so it tells one house that it is behind. Nothing tells
// the kit which houses are behind, because no house's drift check can see any
// other house, and the kit has never had a reason to look outward before now. A
// house stamped before its own drift workflow existed sat many minor versions
// behind with nothing to say so from inside; this is the same failure read from
// the other side, aggregated across every house on the bill at once.
//
// The bill is packages/khai-plays/registry/*.json (loadRegistry), one card per
// house with a `repo` field. For each house this fetches package-lock.json from
// the default branch of that repo over the GitHub REST contents API, reads
// every locked @chbrain/* version, and compares it to the version this repo's
// OWN packages/*/package.json declares at main -- the kit's own account of
// itself, never a registry round trip, because the kit is always exactly what
// main says it is.
//
// It reports and never bumps, exactly like `khai-guard drift`: a kit bump in a
// house is a migration, not a version edit, and this script has no standing to
// start one. Exit is always 0; the caller (a scheduled workflow) decides what
// to do with the finding.
//
// Usage:
//   node scripts/house-drift.mjs                 # every house on the bill, over the network
//   node scripts/house-drift.mjs --json           # machine-readable rows
//   node scripts/house-drift.mjs --local <dir>    # one house's lockfile from disk, no network
//
// --local is the test seam: no token, no network, so it is what lets this
// script be run and verified without depending on a GitHub credential existing
// at all. Point it at a checked-out house (its package-lock.json on disk) and
// it prints that one house's table.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

// A minimal semver reader rather than a dependency: every version this script
// ever compares is one this repo's own `changeset version` wrote (the kit
// manifests) or one a house's own release wrote (its locked @chbrain/*
// versions), so both sides are always plain `major.minor.patch`, optionally
// with a prerelease or build tag this script has no reason to compare. Pulling
// in the `semver` package for three lines of arithmetic would be a dependency
// this script does not otherwise need, undeclared anywhere else in the kit.
const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/;

/** @param {string} v @returns {[number,number,number]|null} */
function semverParts(v) {
  const m = SEMVER_RE.exec(String(v ?? ""));
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/**
 * The coarsest level two versions differ at, in semver's own vocabulary
 * (`major`, `minor`, `patch`), or `null` when they are equal. Either argument
 * failing to parse as `major.minor.patch` returns `"unreachable"`, read by the
 * caller exactly like a version this script could not fetch at all -- a string
 * that cannot be compared is exactly as unusable as one that never arrived.
 *
 * @param {string} locked
 * @param {string} kit
 * @returns {"major"|"minor"|"patch"|"unreachable"|null}
 */
function semverDiffLevel(locked, kit) {
  const a = semverParts(locked);
  const b = semverParts(kit);
  if (!a || !b) return "unreachable";
  if (a[0] !== b[0]) return "major";
  if (a[1] !== b[1]) return "minor";
  if (a[2] !== b[2]) return "patch";
  return null;
}

/**
 * The kit's own account of itself: every direct `packages/<name>/package.json`
 * at the root of the workspace, name -> version. Deliberately one level deep
 * only (`packages/*`, not `packages/engines/*` or `packages/composites/*`): a
 * house's package-lock.json holds the tooling packages (`khai-tests`,
 * `khai-guard`, `khai-arch`, and the rest) as its own dependencies, never an
 * individual engine or composite, so those two directories hold nothing this
 * comparison needs and their many hundreds of manifests would only slow it
 * down. Pure filesystem read of the checkout the script runs from, so this is
 * always "the kit at main" when the workflow runs on main and never a
 * registry round trip that could answer something else.
 *
 * @param {string} [packagesDir]
 * @returns {Record<string,string>}
 */
export function loadKitVersions(packagesDir = join(repoRoot, "packages")) {
  const versions = {};
  if (!existsSync(packagesDir)) return versions;
  for (const name of readdirSync(packagesDir).sort()) {
    const manifestPath = join(packagesDir, name, "package.json");
    if (!existsSync(manifestPath)) continue;
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      if (manifest?.name && manifest?.version) versions[manifest.name] = manifest.version;
    } catch {
      // A malformed manifest here is a kit-repo defect, not a house-drift
      // finding -- skip it rather than fail the whole report over it.
    }
  }
  return versions;
}

/**
 * Every `@chbrain/*` package a lockfile has locked, name -> version. Reads the
 * npm v2+ `packages` map (`node_modules/<name>`), the shape every lockfile in
 * this fleet uses. A workspace's own internal packages resolve with no
 * `version` field (a `link` entry) and are skipped, which matters for a house
 * like khai-cultures whose own published packages also carry the `@chbrain/`
 * scope: an entry with nothing to compare is not a drift finding, it is the
 * house looking at itself.
 *
 * @param {object} lock  a parsed package-lock.json
 * @returns {Record<string,string>}
 */
export function lockedChbrainVersions(lock) {
  const held = {};
  const pkgs = lock?.packages;
  if (!pkgs || typeof pkgs !== "object") return held;
  for (const [path, info] of Object.entries(pkgs)) {
    const m = /(?:^|\/)node_modules\/(@chbrain\/[^/]+)$/.exec(path);
    if (!m || !info?.version) continue;
    held[m[1]] = info.version;
  }
  return held;
}

/**
 * The comparison, pure: what one house's lockfile holds against what the kit
 * declares at main. Only packages the house actually depends on are rows --
 * comparing every kit package against every house would report "khai-arch: not
 * held" for a house that has no reason to depend on it, which is not drift,
 * it is a dependency graph the house never had. `behindBy` is the semver diff
 * type (`patch`, `minor`, `major`, ...matching semver's own vocabulary), null
 * when the versions match, and `"unreachable"` when either side cannot be read
 * as a version at all -- an invalid semver string is exactly as unusable to a
 * caller as a network failure, so both read the same in the table.
 *
 * @param {string} house       the house label for this row set
 * @param {Record<string,string>} held  lockedChbrainVersions() output
 * @param {Record<string,string>} kit   loadKitVersions() output
 * @returns {Array<{house:string, package:string, locked:string, kit:string|null, behindBy:string|null}>}
 */
export function compareToKit(house, held, kit) {
  const rows = [];
  for (const name of Object.keys(held).sort()) {
    const locked = held[name];
    const kitVersion = kit[name] ?? null;
    const behindBy = kitVersion ? semverDiffLevel(locked, kitVersion) : "unreachable";
    rows.push({ house, package: name, locked, kit: kitVersion, behindBy });
  }
  return rows;
}

/** One row's table cells, "unreachable" and "" (level) both spelled out. */
function renderRow(r) {
  const mark = r.behindBy === "unreachable" ? "unreachable" : (r.behindBy ?? "level");
  return `| ${r.house} | \`${r.package}\` | ${r.locked ?? "unreachable"} | ${r.kit ?? "unreachable"} | ${mark} |`;
}

/** @param {Array<ReturnType<typeof compareToKit>[number]>} rows */
export function renderTable(rows) {
  const head = [
    "| house | package | locked | kit | behind-by |",
    "| --- | --- | --- | --- | --- |",
  ];
  return [...head, ...rows.map(renderRow)].join("\n");
}

/**
 * Fetch `package-lock.json` from a repo's default branch over the GitHub REST
 * contents API. No `ref` is passed, so GitHub resolves the default branch
 * itself rather than this script guessing at `main` vs `master`. The raw media
 * type returns the file's bytes directly rather than the base64 envelope the
 * default JSON response wraps small files in and refuses for anything over
 * 1MB -- a lockfile-sized file either way, but the raw form is the one that
 * does not need decoding.
 *
 * Returns null on any failure (network, auth, missing file, bad JSON) rather
 * than throwing: one house being unreachable must not stop the report on
 * every other house, and the caller records the miss as an "unreachable" row.
 *
 * @param {string} owner
 * @param {string} repo
 * @param {string} token
 * @returns {Promise<object|null>}
 */
export async function fetchLockfile(owner, repo, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/package-lock.json`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.raw+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "khai-house-drift",
      },
    });
    if (!res.ok) return null;
    return JSON.parse(await res.text());
  } catch {
    return null;
  }
}

/** A `repo` card field ("https://github.com/<owner>/<repo>") to its two parts. */
export function ownerRepoFromUrl(repoUrl) {
  const m = /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(String(repoUrl ?? ""));
  return m ? { owner: m[1], repo: m[2] } : null;
}

async function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const localIdx = args.indexOf("--local");
  const localDir = localIdx !== -1 ? args[localIdx + 1] : null;

  const kit = loadKitVersions();
  let rows = [];

  if (localDir) {
    const lockPath = join(localDir, "package-lock.json");
    const label = localDir.replace(/\/+$/, "").split("/").pop();
    if (!existsSync(lockPath)) {
      console.error(`house-drift: no package-lock.json at ${lockPath}`);
      process.exit(2);
    }
    const lock = JSON.parse(readFileSync(lockPath, "utf8"));
    rows = compareToKit(label, lockedChbrainVersions(lock), kit);
  } else {
    // Load the bill from the package's own exported loader rather than reading
    // the registry directory by hand -- the loader is where card validation
    // lives, and a second reimplementation here would drift from it exactly as
    // the case this script exists to prevent.
    const { loadRegistry } = await import("@chbrain/khai-plays");
    const houses = loadRegistry();
    const token = process.env.HOUSE_DRIFT_TOKEN || process.env.GITHUB_TOKEN;
    for (const house of houses) {
      const parsed = ownerRepoFromUrl(house.repo);
      if (!parsed || !token) {
        rows.push({
          house: house.title,
          package: "(package-lock.json)",
          locked: null,
          kit: null,
          behindBy: "unreachable",
        });
        continue;
      }
      const lock = await fetchLockfile(parsed.owner, parsed.repo, token);
      if (!lock) {
        rows.push({
          house: house.title,
          package: "(package-lock.json)",
          locked: null,
          kit: null,
          behindBy: "unreachable",
        });
        continue;
      }
      rows.push(...compareToKit(house.title, lockedChbrainVersions(lock), kit));
    }
  }

  if (json) {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    console.log(renderTable(rows));
  }
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  main().catch((err) => {
    console.error(`house-drift: ${err.message}`);
    process.exit(1);
  });
}
