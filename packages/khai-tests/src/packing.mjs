// What a package promises, held against what it ships.
//
// A manifest names content; `files` decides what reaches the tarball; and until
// now nothing held the two to each other. khai-cultures met the class twice --
// a tongues package whose `files: ["*.md"]` reached only the package root while
// all sixty varieties lived below it, shipping 5 files of 65 with every one of
// its 236 inbound links 404ing, and a house that shipped a registry describing
// nineteen groups and not one group file. khai met it once, in the quietest
// available form: `validateEnginePackage` requires a Playwright guide and asks
// `existsSync`, so an engine whose `files` named its content explicitly and
// matched no `playwright_instructions.md` passed every run with the guide on
// disk and absent from the tarball.
//
// Three different mistakes, one failure, and none of them visible in a diff,
// because a diff shows the working tree and what ships is the box.
//
// So the box is asked of npm, never computed. A second implementation of the
// packing rules is a second thing to get wrong, and it would have agreed with
// all three: `publishesContent` reads `files` through a three-literal heuristic
// and is wrong about that engine today.
//
// One invocation, not one per package. `npm pack --dry-run --json --workspaces`
// answers for the whole workspace in about the time a single package costs --
// 388 packages in roughly eight seconds against one second each -- which is what
// makes a corpus-wide wall affordable rather than a sampling scheme that has to
// reason about which packages are alike.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { resolveCollection } from "./collection.mjs";

/** The guide's filename, the same constant the validator enforces. */
const PLAYWRIGHT_INSTRUCTIONS = "playwright_instructions.md";

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
};

/**
 * Every workspace package directory under `root`, keyed by package name.
 *
 * Directory discovery, not packing semantics -- the trailing-`*` form npm
 * workspaces actually use is expanded and anything else is a literal path. The
 * root itself is included, so a single-package house is found the same way.
 */
export function workspacePackages(root) {
  const rootPkg = readJson(join(root, "package.json"));
  if (!rootPkg) return new Map();
  const dirs = [""];
  const patterns = Array.isArray(rootPkg.workspaces)
    ? rootPkg.workspaces
    : (rootPkg.workspaces?.packages ?? []);
  for (const pattern of patterns) {
    const p = String(pattern)
      .replace(/^\.?\//, "")
      .replace(/\/+$/, "");
    if (!p) continue;
    if (p.endsWith("/*")) {
      const parent = p.slice(0, -2);
      let entries = [];
      try {
        entries = readdirSync(join(root, parent), { withFileTypes: true });
      } catch {
        continue;
      }
      for (const e of entries) if (e.isDirectory()) dirs.push(`${parent}/${e.name}`);
    } else if (!p.includes("*")) {
      dirs.push(p);
    }
  }
  const out = new Map();
  for (const dir of dirs) {
    const pkg = readJson(join(root, dir, "package.json"));
    if (pkg?.name) out.set(pkg.name, join(root, dir));
  }
  return out;
}

/**
 * The paths `npm pack` would put in each package's tarball, keyed by package
 * name. One invocation for the whole workspace, or for `names` when given.
 *
 * Throws rather than returning an empty map when npm cannot be run: "the pack
 * could not be read" and "nothing is packed" are different facts, and collapsing
 * them is how a wall reports clean on a workspace it never opened.
 *
 * @param {string} root
 * @param {{ names?: string[] }} [opts]
 * @returns {Map<string, Set<string>>}
 */
/**
 * How to spawn npm, asked in the order that costs least to be wrong about: what
 * npm already told us first, a platform guess only if it did not tell us.
 *
 * Under `npm run` and `npx`, npm sets `npm_execpath` to its own CLI -- a plain
 * `.js` file -- and `npm_node_execpath` to the node that should run it. Spawning
 * `node <npm-cli.js>` is identical on every OS: no `.cmd` shim, no shell, no
 * platform branch. Two releases went into guessing what `npm` resolves to while
 * npm held the answer in an environment variable.
 *
 * A second definition rather than an import: @chbrain/khai-guard exports the same
 * function with the full reasoning, and khai-tests does not depend on it.
 *
 * @param {string[]} args
 * @param {object} [env]
 * @param {string} [platform]
 * @returns {{ file: string, args: string[], shell: boolean, via: string }}
 */
export function npmSpawn(args = [], env = process.env, platform = process.platform) {
  const cli = env?.npm_execpath;
  if (typeof cli === "string" && cli.endsWith(".js"))
    return {
      file: env.npm_node_execpath || process.execPath,
      args: [cli, ...args],
      shell: false,
      via: "npm_execpath",
    };
  return platform === "win32"
    ? { file: "npm.cmd", args: [...args], shell: true, via: "platform-guess" }
    : { file: "npm", args: [...args], shell: false, via: "platform-guess" };
}

export function packedFiles(root, { names = null } = {}) {
  const args = ["pack", "--dry-run", "--json"];
  if (names && names.length > 0) for (const n of names) args.push("-w", n);
  else args.push("--workspaces");
  const npm = npmSpawn(args);
  const raw = execFileSync(npm.file, npm.args, {
    shell: npm.shell,
    cwd: root,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });
  const out = new Map();
  for (const entry of JSON.parse(raw)) {
    if (!entry?.name) continue;
    out.set(entry.name, new Set((entry.files ?? []).map((f) => f.path)));
  }
  return out;
}

/**
 * The paths `npm pack` would put in every workspace package's tarball, working
 * whether or not the house has taken the workspace shape yet.
 *
 * `packedFiles` asks npm with `-w` or `--workspaces`, and npm refuses both
 * against a repo with no `workspaces` field: a flat house (root package.json IS
 * the content package, the shape khai-misfits held before its move) has none.
 * So a workspaces-less root is packed one directory at a time, through the same
 * plain `npm pack --dry-run --json` a flat house's own packing test ran before
 * this was lifted -- `workspacePackages` already resolves to just that one
 * directory for a flat root, so the loop below costs one invocation there and
 * the batched call keeps its one-invocation cost everywhere the workspace
 * exists.
 *
 * @param {string} root
 * @returns {Map<string, Set<string>>}
 */
export function packedFilesAny(root) {
  const rootPkg = readJson(join(root, "package.json"));
  if (rootPkg?.workspaces) return packedFiles(root);
  const out = new Map();
  for (const [name, dir] of workspacePackages(root)) {
    const npm = npmSpawn(["pack", "--dry-run", "--json"]);
    const raw = execFileSync(npm.file, npm.args, {
      shell: npm.shell,
      cwd: dir,
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
    for (const entry of JSON.parse(raw)) {
      if (entry?.name === name) out.set(name, new Set((entry.files ?? []).map((f) => f.path)));
    }
  }
  return out;
}

/**
 * Every file a package's own manifest names, as the package sees it.
 *
 * Deliberately narrow. The Playwright guide is required only when it is already
 * on disk, because whether a package OWES one is `validateEnginePackage`'s
 * question and stays there: two gates answering one question is how they come to
 * disagree. This gate asks only whether what is there ships.
 */
function promised(pkgDir, pkg) {
  const want = new Set();
  for (const m of pkg.khai?.members ?? []) if (m?.file) want.add(m.file);
  const main = typeof pkg.main === "string" ? pkg.main.replace(/^\.\//, "") : null;
  if (main) want.add(main);
  if (existsSync(join(pkgDir, PLAYWRIGHT_INSTRUCTIONS))) want.add(PLAYWRIGHT_INSTRUCTIONS);
  return [...want];
}

/**
 * Findings: one per package whose tarball is missing something its manifest
 * names. `[]` is clean.
 *
 * Only packages present in `packed` are judged. A name npm did not report was
 * not asked about -- a scoped ask, or a pack that failed -- and inventing a
 * verdict for it would fail every consumer that checks a subset.
 *
 * @param {string} root
 * @param {Map<string, Set<string>>} packed
 * @returns {{package: string, missing: string[]}[]}
 */
export function checkPacking(root, packed) {
  const dirs = workspacePackages(root);
  const findings = [];
  for (const [name, box] of packed) {
    const pkgDir = dirs.get(name);
    if (!pkgDir) continue;
    const pkg = readJson(join(pkgDir, "package.json"));
    if (!pkg) continue;
    const missing = promised(pkgDir, pkg).filter((p) => !box.has(p));
    if (missing.length > 0) findings.push({ package: name, missing });
  }
  return findings;
}

// Governance content a package must never ship: the gates, the vendor
// instruction files, and the tests that prove the content rather than being
// the content. `checkPacking` above asks "does the manifest's own promise
// ship"; this asks the opposite question, "does something the manifest never
// promised ship anyway" -- a `files` field that reaches too far (or is absent,
// so npm defaults to everything not gitignored) leaks it silently, and nothing
// else in the kit reads a tarball to catch that.
const GOVERNANCE_PREFIXES = ["tests/", ".husky/", ".github/"];
const GOVERNANCE_FILES = [
  "khai-guard.config.json",
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  "PERPLEXITY.md",
];
const isGovernancePath = (path) =>
  GOVERNANCE_FILES.includes(path) || GOVERNANCE_PREFIXES.some((p) => path.startsWith(p));

/**
 * Registry completeness held against the box, for every workspace package that
 * carries a `registry.json` (found by presence, never assumed to be the root --
 * a flat house and a migrated one are read the same way).
 *
 * Two rules. An entry with no `package` field is this package's own to ship, so
 * its anchor file (whichever file under `<dir>/<id>/` starts with the
 * collection's anchor prefix -- the same rule the registry build itself uses,
 * since a de-duplicated registry id does not always repeat in the filename)
 * must be in the tarball. An entry WITH one has moved to that package, so it
 * must be a declared dependency here and nothing under its id may still be in
 * this tarball -- a registry that still names a migrated entry as its own is a
 * promise nobody reading `dependencies` would find, and a tarball that still
 * ships it is the same content published twice.
 *
 * Governance never ships, checked against every packed package this call was
 * given regardless of whether it carries a registry.
 *
 * Anti-vacuous: a registry.json found with zero entries in its primary
 * collection is a finding, not a clean pass -- a registry naming nothing is not
 * proof that nothing needed to ship.
 *
 * @param {string} root
 * @param {Map<string, Set<string>>} packed
 * @returns {{package: string, path: string, reason: string}[]}
 */
export function checkRegistryPacking(root, packed) {
  const dirs = workspacePackages(root);
  const findings = [];

  for (const [name, dir] of dirs) {
    const box = packed.get(name);
    if (!box) continue; // not asked about -- no verdict, same rule checkPacking follows
    const pkg = readJson(join(dir, "package.json"));
    const registryPath = join(dir, "registry.json");
    if (!pkg || !existsSync(registryPath)) continue;

    const registry = readJson(registryPath);
    const collection = resolveCollection(pkg);
    const entries = Array.isArray(registry?.[collection.key]) ? registry[collection.key] : [];
    if (entries.length === 0) {
      findings.push({
        package: name,
        path: "registry.json",
        reason: `names 0 "${collection.key}" entries -- a registry with nothing in it is not a clean pack`,
      });
      continue;
    }

    const deps = pkg.dependencies ?? {};
    for (const entry of entries) {
      const id = entry?.id;
      if (typeof id !== "string" || !id) continue;
      const itemPrefix = `${collection.dir}/${id}/`;

      if (entry.package) {
        if (!deps[entry.package]) {
          findings.push({
            package: name,
            path: `${itemPrefix}${collection.anchor}${id}.md`,
            reason: `entry "${id}" names package "${entry.package}", which is not a declared dependency`,
          });
        }
        // Scanned against the BOX, never the disk: a fully migrated entry has
        // no directory left to read, and the question here is only "did
        // anything under this id's path make the tarball", not "is there an
        // anchor file to name".
        const stray = [...box].find((p) => p.startsWith(itemPrefix));
        if (stray) {
          findings.push({
            package: name,
            path: stray,
            reason: `entry "${id}" names package "${entry.package}" and is still shipped from here too`,
          });
        }
        continue;
      }

      // The anchor is whatever file in the item's own directory starts with
      // the collection's prefix -- the same rule registry.mjs's own build uses
      // (`files.find(f => f.startsWith(collection.anchor) ...)`), and not
      // necessarily `<anchor><id>.md`: a de-duplicated registry id (a house
      // prefixing a province by its country, `xx_region`) commonly names a
      // directory the anchor file inside it does not repeat (`play_region.md`).
      // Read from disk, so a registry id with nothing on disk to check is
      // skipped here rather than misreported -- that gap belongs to whichever
      // wall proves the registry against the source tree, not this one.
      let anchorFile;
      try {
        anchorFile = readdirSync(join(dir, collection.dir, id)).find(
          (f) => f.startsWith(collection.anchor) && f.endsWith(".md"),
        );
      } catch {
        continue;
      }
      if (!anchorFile) continue;
      const anchor = `${itemPrefix}${anchorFile}`;
      if (!box.has(anchor)) {
        findings.push({
          package: name,
          path: anchor,
          reason: `entry "${id}" carries no "package" field and its anchor file is not in the tarball`,
        });
      }
    }
  }

  for (const [name, box] of packed) {
    for (const path of box) {
      if (isGovernancePath(path)) {
        findings.push({ package: name, path, reason: "governance content must never ship" });
      }
    }
  }

  return findings;
}

/** Render registry-packing findings for a terminal. Pure: findings in, text out. */
export function renderRegistryPacking(findings) {
  if (findings.length === 0) {
    return "khai-tests packing: every registry entry is packed correctly, and governance ships nowhere.";
  }
  const lines = [`khai-tests packing: ${findings.length} finding(s).`, ""];
  for (const f of findings) lines.push(`  - ${f.package}: ${f.path} -- ${f.reason}`);
  return lines.join("\n");
}

/** Render findings for a terminal. Pure: findings in, text out. */
export function renderPacking(findings) {
  if (findings.length === 0)
    return "khai-tests packing: every manifest's content is in its tarball.";
  const lines = [
    `khai-tests packing: ${findings.length} package(s) promise what they do not ship.`,
    "",
  ];
  for (const f of findings) {
    lines.push(`## ${f.package}`);
    for (const m of f.missing)
      lines.push(`  - ${m} is named by the manifest and not in the tarball`);
    lines.push("");
  }
  lines.push("`files` decides the tarball. A glob that reaches only the package root will not");
  lines.push("reach content below it, and a list that names content explicitly will not reach a");
  lines.push("file nobody remembered to add.");
  return lines.join("\n");
}
