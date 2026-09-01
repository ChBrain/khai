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
 * How to spawn npm, by platform: the binary and whether it needs a shell. On
 * Windows npm is a `.cmd` shim, and since Node's CVE-2024-27980 hardening
 * execFileSync REFUSES to run a `.cmd` without `shell: true`, throwing EINVAL
 * before the process starts. Naming the binary is necessary and not sufficient.
 *
 * A second definition rather than an import: @chbrain/khai-guard exports the same
 * function with the full reasoning, and khai-tests does not depend on it.
 *
 * @param {string} [platform] defaults to the host's
 * @returns {{ bin: "npm"|"npm.cmd", shell: boolean }}
 */
export function npmCommand(platform = process.platform) {
  return platform === "win32" ? { bin: "npm.cmd", shell: true } : { bin: "npm", shell: false };
}

export function packedFiles(root, { names = null } = {}) {
  const args = ["pack", "--dry-run", "--json"];
  if (names && names.length > 0) for (const n of names) args.push("-w", n);
  else args.push("--workspaces");
  const npm = npmCommand();
  const raw = execFileSync(npm.bin, args, {
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
