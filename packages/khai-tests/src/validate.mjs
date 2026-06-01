// Conformance validator. Pulls the section contract from the canon
// (@chbrain/khai-arch) so it never restates it, then composes the rule atoms.
// Exposed for both package mode (one package/file) and suite mode (the whole
// workspace) — same code, two callers.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { types } from "@chbrain/khai-arch";
import { parseDoc } from "./parse.mjs";
import {
  checkEncoding,
  checkFrontmatter,
  checkH1,
  checkH2SetAndOrder,
  checkTitle,
  checkOwner,
  checkExtensions,
  checkLinks,
  checkWiring,
} from "./rules.mjs";

const typeIds = Object.keys(types);

/** @typedef {{ file: string, errors: string[] }} FileResult */

/**
 * Validate one content file's text against a type contract. `owner` pins the
 * Owner block to an exact expectation (engine content, owned by the project);
 * omit it to validate structure only without asserting whose it is (a
 * consumer's own instance files). The Owner *section* is always required by the
 * canon H2 set; only the value check is conditional.
 */
export function validateContentFile(text, { type, baseDir, owner, allowed, exemptLinks }) {
  const contract = types[type];
  if (!contract) return [`unknown khai type "${type}" (not in canon)`];
  const doc = parseDoc(text);

  const errors = [
    ...checkEncoding(text),
    ...checkFrontmatter(doc, { typeIds }),
    ...checkH2SetAndOrder(doc, {
      expected: ["Title", "Owner", ...contract.chapters],
    }),
    ...checkExtensions(doc, { allowed: new Set(allowed ?? []) }),
  ];
  const { name, errors: h1Errors } = checkH1(doc, { type });
  errors.push(...h1Errors);
  errors.push(...checkTitle(doc, { name }));
  if (owner) errors.push(...checkOwner(doc, { expected: owner }));
  if (baseDir) errors.push(...checkLinks(text, baseDir, { exempt: exemptLinks }));

  // The declared frontmatter type must match the package's manifest type.
  if (doc.ok && doc.data.khai && doc.data.khai !== type)
    errors.push(`frontmatter khai "${doc.data.khai}" != package type "${type}"`);
  return errors;
}

/** Read an engine package's `khai` manifest from its package.json. */
function readManifest(pkgDir) {
  const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
  return { manifest: pkg.khai, name: pkg.name };
}

/** Every `.md` in the dir that declares `khai:` frontmatter (a content instance). */
function instanceFiles(pkgDir) {
  return readdirSync(pkgDir)
    .filter((f) => f.endsWith(".md"))
    .filter((f) => /^---\n[\s\S]*?\bkhai:/.test(readFileSync(join(pkgDir, f), "utf8")));
}

/**
 * Validate a whole engine package: every referenced content file against the
 * canon and manifest<->filesystem consistency. This is the untrusted-safe
 * surface — it only reads and statically analyses markdown + JSON, and never
 * executes package code.
 *
 * The compose() smoke test executes the package's index.mjs and is therefore
 * gated behind `{ executeCompose: true }`. Trusted callers (this workspace's
 * own suite) opt in; callers validating untrusted, user-submitted packages
 * (e.g. the configuration website) must leave it off, or a malicious index.mjs
 * would run in their process.
 *
 * @param {string} pkgDir
 * @param {{ executeCompose?: boolean }} [opts]
 * @returns {Promise<FileResult[]>}
 */
export async function validateEnginePackage(pkgDir, { executeCompose = false } = {}) {
  const results = [];
  const { manifest } = readManifest(pkgDir);
  if (!manifest) return [{ file: pkgDir, errors: ["package.json has no `khai` manifest"] }];

  const { type, anchor, expressions = {} } = manifest;
  const referenced = [anchor, ...Object.values(expressions)];
  const owner = { Project: "khai", Engine: manifest.engine };

  // referenced files exist + conform
  for (const file of referenced) {
    const path = join(pkgDir, file);
    if (!existsSync(path)) {
      results.push({ file, errors: [`manifest references missing file: ${file}`] });
      continue;
    }
    const errors = validateContentFile(readFileSync(path, "utf8"), {
      type,
      baseDir: pkgDir,
      owner,
      allowed: (manifest.extensions ?? {})[file],
    });
    if (errors.length) results.push({ file, errors });
  }

  // no orphan content: every khai instance file must be referenced
  for (const file of instanceFiles(pkgDir)) {
    if (!referenced.includes(file))
      results.push({ file, errors: [`content file not referenced in manifest: ${file}`] });
  }

  // compose() smoke test — executes package code; trusted callers only
  if (executeCompose) {
    try {
      const mod = await import(pathToFileURL(join(pkgDir, "index.mjs")).href);
      for (const name of Object.keys(expressions)) {
        const out = mod.compose({ expression: name });
        if (!out || typeof out !== "string")
          results.push({
            file: "index.mjs",
            errors: [`compose({expression:"${name}"}) returned no string`],
          });
      }
    } catch (err) {
      results.push({ file: "index.mjs", errors: [`compose() smoke failed: ${err.message}`] });
    }
  }

  return results;
}

/** Discover engine packages under <root>/packages/engines/*. */
export function discoverEnginePackages(root) {
  const dir = join(root, "packages", "engines");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((d) => join(dir, d))
    .filter((p) => statSync(p).isDirectory() && existsSync(join(p, "package.json")));
}

/** Walk up from a file to the nearest package.json carrying a `khai` manifest. */
export function findEnginePackageFor(file) {
  let dir = dirname(file);
  for (let i = 0; i < 8; i++) {
    const pkgPath = join(dir, "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      if (pkg.khai) return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// ===========================================================================
// Consumer surface: validating a project that *uses* engines, as opposed to an
// engine package itself. Instance files (the consumer's personas, plots, ...)
// are discovered by their `khai:` frontmatter, not by a manifest. Each is
// validated against its canon type, and then against every wiring requirement
// the installed engines declare. This is the layer the configurator website and
// downstream repos (Cultures) call. It never executes consumer code.
// ===========================================================================

/**
 * A wiring requirement, as an engine declares it in its manifest `requires`:
 *   "requires": { "on": "persona", "section": "Projection", "link": "expression" }
 * `on` is the instance type the requirement applies to; `section` is the H2 the
 * link must appear under; `link` selects which manifest files satisfy it
 * ("anchor", "expression", or "any"). The kit resolves these to basenames and
 * enforces that a matching link is present.
 */
function requirementsFromEngine(manifest) {
  const reqs = [];
  for (const r of [].concat(manifest.requires ?? [])) {
    const which = r.link ?? "any";
    const files =
      which === "anchor"
        ? [manifest.anchor]
        : which === "expression"
          ? Object.values(manifest.expressions ?? {})
          : [manifest.anchor, ...Object.values(manifest.expressions ?? {})];
    reqs.push({
      engine: manifest.engine,
      on: r.on,
      section: r.section,
      targets: new Set(files.filter(Boolean).map((f) => f.split("/").pop())),
    });
  }
  return reqs;
}

/** Collect wiring requirements from a set of engine manifests. */
export function wiringRequirements(manifests) {
  return manifests.flatMap(requirementsFromEngine);
}

/**
 * Validate one consumer instance file: structure against its canon type, plus
 * any wiring requirements whose `on` matches the instance's declared khai type.
 *
 * @param {string} text  the instance file contents
 * @param {{ baseDir?: string, requirements?: object[], owner?: object }} opts
 * @returns {string[]} errors (empty = pass)
 */
export function validateInstanceFile(text, { baseDir, requirements = [], owner } = {}) {
  const doc = parseDoc(text);
  const type = doc.data?.khai;
  if (typeof type !== "string") return ["instance has no `khai:` type in frontmatter"];

  // Links into installed engine content resolve via npm, not the local tree, so
  // every wiring target is exempt from the local broken-link check.
  const exemptLinks = new Set(requirements.flatMap((r) => [...r.targets]));
  const errors = validateContentFile(text, { type, baseDir, owner, exemptLinks });
  for (const req of requirements) {
    if (req.on !== type) continue;
    errors.push(...checkWiring(doc, req));
  }
  return errors;
}

/** Read the `khai` manifest from each installed engine under node_modules. */
function installedEngineManifests(root) {
  const scopeDir = join(root, "node_modules", "@chbrain");
  if (!existsSync(scopeDir)) return [];
  return readdirSync(scopeDir)
    .map((name) => join(scopeDir, name, "package.json"))
    .filter((p) => existsSync(p))
    .map((p) => JSON.parse(readFileSync(p, "utf8")).khai)
    .filter((khai) => khai && khai.engine);
}

/** Every `.md` under a dir tree that declares `khai:` frontmatter. */
function findInstanceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findInstanceFiles(full));
    else if (entry.name.endsWith(".md") && /^---\n[\s\S]*?\bkhai:/.test(readFileSync(full, "utf8")))
      out.push(full);
  }
  return out;
}

/**
 * Validate a consuming project: discover its instance files and check each
 * against the canon and against the wiring requirements declared by the engines
 * it has installed. `contentDir` is where the consumer's own `.md` instances
 * live; `root` is where node_modules (the installed engines) resolves from.
 *
 * @param {{ root: string, contentDir?: string, owner?: object }} opts
 * @returns {FileResult[]}
 */
export function validateProject({ root, contentDir = root, owner } = {}) {
  const requirements = wiringRequirements(installedEngineManifests(root));
  const results = [];
  for (const file of findInstanceFiles(contentDir)) {
    const errors = validateInstanceFile(readFileSync(file, "utf8"), {
      baseDir: dirname(file),
      requirements,
      owner,
    });
    if (errors.length) results.push({ file, errors });
  }
  return results;
}
