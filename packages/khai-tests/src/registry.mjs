import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseDoc } from "@chbrain/khai-rules";
import { validatePlayhouseRegistry } from "./validate.mjs";

/**
 * Count the plays in a house: the same set the registry and the numbering guard
 * count, i.e. each non-hidden subdirectory of plays/ that holds a play_*.md.
 * @param {string} root
 * @returns {number}
 */
export function countPlays(root) {
  const playsDir = join(root, "plays");
  if (!existsSync(playsDir)) return 0;
  let n = 0;
  for (const e of readdirSync(playsDir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith(".")) continue;
    if (readdirSync(join(playsDir, e.name)).some((f) => f.startsWith("play_") && f.endsWith(".md")))
      n++;
  }
  return n;
}

/**
 * The house numbering rule, computed not chosen: the minor version IS the play
 * count. Derive the version from the count, preserving the major (a house stays
 * 0.x; the guard flags a non-zero major) and the patch (changeset-driven), but
 * resetting the patch to 0 whenever the count moves the minor, since a fresh
 * minor line starts at .0. This makes the build the single writer of the minor,
 * so a manual edit or a stray minor changeset that drifted it is healed on the
 * next build rather than shipped.
 * @param {string} currentVersion  the version currently in package.json
 * @param {number} count           the play count
 * @returns {string} the derived semver version
 */
export function deriveVersionFrom(currentVersion, count) {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(String(currentVersion ?? ""));
  const major = m ? Number(m[1]) : 0;
  const curMinor = m ? Number(m[2]) : -1;
  const patch = m ? Number(m[3]) : 0;
  return `${major}.${count}.${count === curMinor ? patch : 0}`;
}

/**
 * The derived version for a house at `root`: its package.json version with the
 * minor reconciled to the play count. Pure read; does not write.
 * @param {string} root
 * @returns {string}
 */
export function deriveHouseVersion(root) {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  return deriveVersionFrom(pkg.version, countPlays(root));
}

export function buildRegistry(root) {
  const packageJsonPath = join(root, "package.json");
  if (!existsSync(packageJsonPath)) {
    throw new Error(`missing package.json at ${root}`);
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const name = packageJson.name;

  const playsDir = join(root, "plays");
  if (!existsSync(playsDir)) {
    throw new Error(`missing plays directory at ${root}`);
  }

  const subdirs = readdirSync(playsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

  const plays = [];
  for (const id of subdirs) {
    const playSubdir = join(playsDir, id);
    const files = readdirSync(playSubdir);
    const playFileName = files.find((f) => f.startsWith("play_") && f.endsWith(".md"));
    if (!playFileName) {
      console.warn(`Warning: playbook file play_*.md not found in plays/${id}`);
      continue;
    }

    const playFile = join(playSubdir, playFileName);

    const text = readFileSync(playFile, "utf8");
    const doc = parseDoc(text);
    if (!doc.ok) {
      throw new Error(`failed to parse playbook frontmatter of plays/${id}/${playFileName}`);
    }

    const title = doc.data?.title || id;

    // Parse blurb description under ## Arc
    let description = "";
    const content = doc.body || "";
    const arcMatch = content.match(/^##\s+Arc\s*$/im);
    if (arcMatch) {
      const startIndex = arcMatch.index + arcMatch[0].length;
      const rest = content.slice(startIndex).trim();
      const nextHeadingMatch = rest.match(/^##\s+/m);
      const sectionText = nextHeadingMatch ? rest.slice(0, nextHeadingMatch.index).trim() : rest;
      const paragraphs = sectionText
        .split(/\r?\n\r?\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      description = paragraphs[0] || "";
    }

    plays.push({
      id,
      title,
      description,
    });
  }

  // plays are pushed in subdir order, which is already sorted by localeCompare
  // above, so the output is deterministic without a second sort.

  // The minor IS the play count: derive the version and reconcile package.json
  // (the published artifact; registry.json is not in the package files) so the
  // build is the single writer of the minor. registry.json then mirrors it, so
  // the numbering guard still meaningfully checks the committed registry against
  // the play count on disk.
  const version = deriveVersionFrom(packageJson.version, plays.length);
  if (packageJson.version !== version) {
    packageJson.version = version;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n", "utf8");
  }

  const registryData = {
    $schema: "http://json-schema.org/draft-07/schema#",
    name,
    version,
    plays,
  };

  const registryPath = join(root, "registry.json");
  writeFileSync(registryPath, JSON.stringify(registryData, null, 2) + "\n", "utf8");

  // build extracts blurbs best-effort; surface (without failing) anything the
  // verify gate will later reject so the author can fix it before committing.
  const check = verifyRegistry(root);
  if (!check.ok) {
    console.warn("Warning: built registry.json does not yet pass verification:");
    for (const err of check.errors) {
      console.warn(`  - ${err}`);
    }
  }
}

export function verifyRegistry(root) {
  const results = validatePlayhouseRegistry(root);
  if (results.length > 0) {
    return {
      ok: false,
      errors: results[0].errors,
    };
  }
  return { ok: true, errors: [] };
}
