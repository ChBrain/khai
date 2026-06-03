// Conformance validator. Pulls the section contract from the canon
// (@chbrain/khai-arch) so it never restates it, then composes the rule atoms.
// Exposed for both package mode (one package/file) and suite mode (the whole
// workspace) - same code, two callers.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { types, engineCard, renderEngineReadme } from "@chbrain/khai-arch";
import {
  parseDoc,
  checkEncoding,
  checkFrontmatter,
  checkH1,
  checkH2SetAndOrder,
  checkTitle,
  checkOwner,
  checkExtensions,
  checkLinks,
  checkWiring,
  checkClauseDash,
  checkLinkText,
  checkNoFooter,
  checkHasFrontmatter,
  looseFiles,
} from "@chbrain/khai-rules";

const typeIds = Object.keys(types);

/** @typedef {{ file: string, errors: string[], warnings?: string[] }} FileResult */

/**
 * The engine docs standard, run over a package's own `.md` files (excluding the
 * changeset-generated CHANGELOG). These are advisory by nature: they surface as
 * `warnings`, never `errors`, so a downstream consumer is informed but not
 * failed while the world migrates. Our own suite holds engines to zero warnings.
 * Pure file analysis; never executes package code.
 * @param {string} pkgDir
 * @returns {{ file: string, errors: string[], warnings: string[] }[]}
 */
export function engineDocChecks(pkgDir) {
  const out = [];
  const mds = readdirSync(pkgDir).filter((f) => f.endsWith(".md") && f !== "CHANGELOG.md");
  for (const f of mds) {
    const text = readFileSync(join(pkgDir, f), "utf8");
    const warnings = [
      ...checkClauseDash(text),
      ...checkLinkText(text),
      ...checkNoFooter(text),
      ...(f === "REFERENCES.md" ? checkHasFrontmatter(text) : []),
    ];
    // These docs (README, REFERENCES) are not content instances, so checkEncoding
    // never runs over them; hold them to the house voice here. em/en-dash is the
    // LLM's tell and is never sanctioned in prose (the CVI's numeric-range
    // exception is for " - " only, caught by checkClauseDash above).
    if (/[–—]/.test(text)) warnings.push("en/em-dash present; use , ; : or ()");
    if (warnings.length) out.push({ file: f, errors: [], warnings });
  }
  const loose = looseFiles(
    mds.map((f) => ({ name: f, text: readFileSync(join(pkgDir, f), "utf8") })),
  );
  if (loose.length)
    out.push({
      file: pkgDir,
      errors: [],
      warnings: loose.map((f) => `loose file: "${f}" has no link into the engine graph`),
    });

  // Card prose lives in package.json (JSON), outside the .md checks above, yet
  // it is what the website renders. Hold it to the same voice: no clause dash,
  // no em/en-dash. (em/en is checkEncoding's job for .md content files, but the
  // card is neither, so it is checked here.)
  const pkgPath = join(pkgDir, "package.json");
  if (existsSync(pkgPath)) {
    const card = (JSON.parse(readFileSync(pkgPath, "utf8")).khai ?? {}).card ?? {};
    for (const [chapter, prose] of Object.entries(card)) {
      if (typeof prose !== "string") continue;
      const warnings = checkClauseDash(prose).map((w) => w.replace(/^line \d+: /, ""));
      if (/[–—]/.test(prose)) warnings.push("en/em-dash present; use , ; : or ()");
      if (warnings.length) out.push({ file: `package.json#card.${chapter}`, errors: [], warnings });
    }
  }
  return out;
}

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
 * surface - it only reads and statically analyses markdown + JSON, and never
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

  // WIRES card: the engine must declare a valid card. khai-arch owns the shape
  // (engineCard throws on a missing slug, missing/empty chapter, or foreign
  // key); the kit surfaces that as a package error so a cardless engine fails.
  try {
    engineCard(manifest);
  } catch (err) {
    results.push({ file: "package.json", errors: [`WIRES card: ${err.message}`] });
  }

  // README: generated, never hand-edited. The canon renders it from the manifest
  // (renderEngineReadme), so a missing or drifted README is a real error -- the
  // pointer must never disagree with the source of truth. Deterministic: the
  // answer is in the bytes, so this gates (unlike the advisory docs lane).
  try {
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    const expected = renderEngineReadme(pkg);
    const readmePath = join(pkgDir, "README.md");
    if (!existsSync(readmePath))
      results.push({ file: "README.md", errors: ["missing; run the canon's renderEngineReadme"] });
    else if (readFileSync(readmePath, "utf8") !== expected)
      results.push({
        file: "README.md",
        errors: ["drifted from the manifest; regenerate with the canon's renderEngineReadme"],
      });
  } catch (err) {
    results.push({ file: "README.md", errors: [`cannot render from manifest: ${err.message}`] });
  }

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

  // compose() smoke test - executes package code; trusted callers only
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

  // Engine docs standard: advisory warnings, never fatal (see engineDocChecks).
  results.push(...engineDocChecks(pkgDir));

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
/** The severity levels, weakest to strongest. Only `fail` gates (non-zero
 * exit); `warn` and `audit` report. The engine declares a default per
 * requirement (`requires[].level`); a world overrides per requirement id. */
export const LEVELS = new Set(["audit", "warn", "fail"]);

/** A world override (by requirement id) wins over the engine's declared
 * default; an unknown value falls back to the engine default. */
function resolveLevel(req, levels) {
  const o = levels && levels[req.id];
  return LEVELS.has(o) ? o : req.level;
}

/** Bucket leveled findings into the print/return shape (fail -> errors,
 * warn -> warnings, audit -> audit), so the CLI renders one way. */
function bucket(findings) {
  const out = { errors: [], warnings: [], audit: [] };
  for (const f of findings) {
    const key = f.level === "fail" ? "errors" : f.level === "warn" ? "warnings" : "audit";
    out[key].push(f.message);
  }
  return out;
}

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
      // Stable id for world-override + reporting: engine, instance type, section.
      id: `${manifest.engine}:${r.on}:${r.section}`,
      engine: manifest.engine,
      on: r.on,
      section: r.section,
      // The engine declares how hard it asks; default fail (back-compat).
      level: LEVELS.has(r.level) ? r.level : "fail",
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
 * Structural conformance is always `fail` (an instance must match its canon
 * type). Wiring findings carry the requirement's resolved level, so a world can
 * tune how hard each engine's contract binds (the engine default, overridden by
 * `levels`). Returns leveled findings; empty = clean.
 *
 * @param {string} text  the instance file contents
 * @param {{ baseDir?: string, requirements?: object[], owner?: object, levels?: Record<string,string> }} opts
 * @returns {{ level: "audit"|"warn"|"fail", message: string }[]}
 */
export function validateInstanceFile(text, { baseDir, requirements = [], owner, levels } = {}) {
  const doc = parseDoc(text);
  const type = doc.data?.khai;
  if (typeof type !== "string")
    return [{ level: "fail", message: "instance has no `khai:` type in frontmatter" }];

  // Links into installed engine content resolve via npm, not the local tree, so
  // every wiring target is exempt from the local broken-link check.
  const exemptLinks = new Set(requirements.flatMap((r) => [...r.targets]));
  const findings = validateContentFile(text, { type, baseDir, owner, exemptLinks }).map((m) => ({
    level: "fail",
    message: m,
  }));
  for (const req of requirements) {
    if (req.on !== type) continue;
    const level = resolveLevel(req, levels);
    for (const m of checkWiring(doc, req)) findings.push({ level, message: m });
  }
  return findings;
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
 * `levels` overrides a requirement's level by its id (the world's call on how
 * hard each engine's contract binds). Each result buckets the file's findings
 * into errors (fail) / warnings (warn) / audit.
 *
 * @param {{ root: string, contentDir?: string, owner?: object, levels?: Record<string,string> }} opts
 * @returns {{ file: string, errors: string[], warnings: string[], audit: string[] }[]}
 */
export function validateProject({ root, contentDir = root, owner, levels } = {}) {
  const requirements = wiringRequirements(installedEngineManifests(root));
  const results = [];
  for (const file of findInstanceFiles(contentDir)) {
    const findings = validateInstanceFile(readFileSync(file, "utf8"), {
      baseDir: dirname(file),
      requirements,
      owner,
      levels,
    });
    if (findings.length) results.push({ file, ...bucket(findings) });
  }
  return results;
}
