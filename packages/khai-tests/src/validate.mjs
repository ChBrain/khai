// Conformance validator. Pulls the section contract from the canon
// (@chbrain/khai-arch) so it never restates it, then composes the rule atoms.
// Exposed for both package mode (one package/file) and suite mode (the whole
// workspace) - same code, two callers.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import {
  types,
  engineCard,
  referenceCard,
  playCard,
  planCard,
  orderCard,
  renderEngineReadme,
  engineMembers,
  compositionOrder,
} from "@chbrain/khai-arch";
import * as khaiArch from "@chbrain/khai-arch";
import {
  parseDoc,
  checkEncoding,
  checkFrontmatter,
  checkH1,
  checkTitle,
  checkH2SetAndOrder,
  checkOwner,
  checkExtensions,
  checkLinks,
  checkWiring,
  checkClauseDash,
  checkLinkText,
  checkNoFooter,
  checkHasFrontmatter,
  looseFiles,
  sectionBody,
} from "@chbrain/khai-rules";
import { resolveLanguage } from "@chbrain/khai-language";

const typeIds = Object.keys(types);

/**
 * Read and JSON-parse a file, returning `fallback` (default null) if it is
 * missing, unreadable, or malformed. Installed dependencies and consumer files
 * are untrusted input: a single bad package.json must not crash a gate (the
 * pre-commit hook, the project validator) with a raw stack trace, so callers
 * degrade gracefully instead of throwing.
 * @param {string} path
 * @param {*} [fallback]
 */
export function readJsonOr(path, fallback = null) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

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
    const card = ((readJsonOr(pkgPath) ?? {}).khai ?? {}).card ?? {};
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
export function validateContentFile(
  text,
  { type, baseDir, owner, allowed, exemptLinks, resolvedLanguage },
) {
  const contract = types[type];
  if (!contract) return [`unknown khai type "${type}" (not in canon)`];
  const doc = parseDoc(text);

  // Per-type extra frontmatter keys (e.g. persona's `type:`) are owned by the
  // canon. Pull them when khai-arch declares them; guarded so this kit keeps
  // working against a canon that has not yet shipped the declaration.
  const extra =
    typeof khaiArch.frontmatterExtras === "function" ? khaiArch.frontmatterExtras(type) : {};

  // The full H2 list spells the type's mnemonic. A "TO ___" type carries a two
  // section prefix ahead of its chapters: the "T" (the group above) and the "O"
  // (Owner, the origin). A type whose mnemonic does not begin with "TO "
  // (instructions=HACKS, play=ENACTS, engines=WIRE) carries neither -- its
  // chapters spell the whole word. The canon owns the prefix vocabulary; the
  // kit pulls it (guarded so it keeps working against a canon that has not yet
  // shipped the declaration). The T slot is the group, never a re-name of the
  // H1, so there is no Title==H1 echo check -- presence in the H2 set is the
  // whole contract for it.
  const prefix =
    typeof khaiArch.toPrefix === "function"
      ? khaiArch.toPrefix(type)
      : contract.mnemonic.startsWith("TO ")
        ? ["Taxonomy", "Owner"]
        : [];

  // The Title -> Taxonomy rename has landed end to end (canon, this kit's
  // fixtures, the engine content), so the T slot is the canon word and stands
  // alone -- no migration tolerance for the legacy "Title" spelling.
  const h2Errors = checkH2SetAndOrder(doc, { expected: [...prefix, ...contract.chapters] });

  const errors = [
    ...checkEncoding(text),
    ...checkFrontmatter(doc, { typeIds, extra }),
    ...h2Errors,
    ...checkExtensions(doc, { allowed: new Set(allowed ?? []) }),
  ];
  if (type === "play") {
    try {
      playCard(text);
    } catch (err) {
      errors.push(`play (ENACTS): ${err.message}`);
    }
  }
  if (type === "plan") {
    try {
      planCard(text);
      const targetsBody = sectionBody(doc.body, "Targets");
      if (targetsBody) {
        // Only an unchecked task-list item (`- [ ]` / `* [ ]`) is a pending
        // target; a bare "[ ]" elsewhere in the prose or a code span is not.
        const pendingCount = targetsBody.filter((line) => /^\s*[-*+]\s+\[ \]/.test(line)).length;
        if (pendingCount > 0) {
          errors.push(`plan has ${pendingCount} pending target(s) [ ]`);
        }
      }
    } catch (err) {
      errors.push(`plan (TO DO IT): ${err.message}`);
    }
  }
  if (type === "order") {
    try {
      orderCard(text);
      const targetsBody = sectionBody(doc.body, "Targets");
      if (targetsBody) {
        // Only an unchecked task-list item (`- [ ]` / `* [ ]`) is a pending
        // target; a bare "[ ]" elsewhere in the prose or a code span is not.
        const pendingCount = targetsBody.filter((line) => /^\s*[-*+]\s+\[ \]/.test(line)).length;
        if (pendingCount > 0) {
          errors.push(`order has ${pendingCount} pending target(s) [ ]`);
        }
      }
    } catch (err) {
      errors.push(`order (DO IT): ${err.message}`);
    }
  }
  errors.push(...checkH1(doc, { type }).errors);
  // The frontmatter `title` must be present and echo the body's name (the H1,
  // or `## Name` for a play). One pattern for every instance -- including the
  // content surfaces will generate downstream.
  errors.push(...checkTitle(doc, { type, resolvedLanguage }));
  // Owner (the "O") is the origin stamp; pin its value only when the caller
  // asserts whose the content is (engine content). The T slot carries no value
  // check -- it is the group above, enforced solely by the H2 set.
  if (prefix.length && owner) errors.push(...checkOwner(doc, { expected: owner }));
  if (baseDir) errors.push(...checkLinks(text, baseDir, { exempt: exemptLinks }));

  // The declared frontmatter type must match the package's manifest type.
  if (doc.ok && doc.data.khai && doc.data.khai !== type)
    errors.push(`frontmatter khai "${doc.data.khai}" != package type "${type}"`);
  return errors;
}

/** Read an engine package's `khai` manifest from its package.json. */
function readManifest(pkgDir) {
  const pkg = readJsonOr(join(pkgDir, "package.json"));
  if (pkg === null) return { manifest: null, name: null, unreadable: true };
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
  const { manifest, unreadable } = readManifest(pkgDir);
  if (unreadable) return [{ file: "package.json", errors: ["cannot read or parse package.json"] }];
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

  // Reference warrant: every engine ships a REFERENCES.md conforming to the LORE
  // standard. khai-arch owns the shape (referenceCard throws on a missing,
  // misordered, foreign, or empty chapter); the kit surfaces that so a
  // non-conforming warrant fails -- the same teeth as the WIRES card.
  const refPath = join(pkgDir, "REFERENCES.md");
  if (!existsSync(refPath))
    results.push({
      file: "REFERENCES.md",
      errors: ["missing; every engine carries a LORE reference"],
    });
  else {
    try {
      referenceCard(readFileSync(refPath, "utf8"));
    } catch (err) {
      results.push({ file: "REFERENCES.md", errors: [`reference (LORE): ${err.message}`] });
    }
  }

  const owner = { Project: "khai", Engine: manifest.engine };

  // The composition tree, canon-normalized: the anchor+expressions shorthand and
  // the explicit `members` array desugar to the same { file, type, parent } list,
  // so the validator is shape-agnostic -- gender's depth-1 tree and a process
  // ladder (root -> channel -> width) validate through the identical code. Each
  // file is checked against its OWN member type, so a mixed-type tree is fine.
  let members = [];
  try {
    members = engineMembers(manifest);
  } catch (err) {
    results.push({ file: "package.json", errors: [`manifest members: ${err.message}`] });
  }
  const referenced = new Set(members.map((m) => m.file));

  // referenced files exist + conform (each against its declared member type)
  for (const m of members) {
    const path = join(pkgDir, m.file);
    if (!existsSync(path)) {
      results.push({ file: m.file, errors: [`manifest references missing file: ${m.file}`] });
      continue;
    }
    const errors = validateContentFile(readFileSync(path, "utf8"), {
      type: m.type,
      baseDir: pkgDir,
      owner,
      allowed: (manifest.extensions ?? {})[m.file],
    });
    if (errors.length) results.push({ file: m.file, errors });
  }

  // no orphan content: every khai instance file must be a declared member
  for (const file of instanceFiles(pkgDir)) {
    if (!referenced.has(file))
      results.push({ file, errors: [`content file not referenced in manifest: ${file}`] });
  }

  // compose() smoke test - executes package code; trusted callers only. The
  // composable units are the tree's leaves (canon compositionOrder), general
  // across shapes. The call shape follows the manifest: an explicit-members
  // engine composes a leaf file; the anchor+expressions shorthand composes an
  // expression name (kept so existing engines are unaffected).
  if (executeCompose) {
    try {
      const mod = await import(pathToFileURL(join(pkgDir, "index.mjs")).href);
      const calls = Array.isArray(manifest.members)
        ? Object.keys(compositionOrder(manifest)).map((leaf) => ({ leaf }))
        : Object.keys(manifest.expressions ?? {}).map((expression) => ({ expression }));
      for (const arg of calls) {
        const out = mod.compose(arg);
        if (!out || typeof out !== "string")
          results.push({
            file: "index.mjs",
            errors: [`compose(${JSON.stringify(arg)}) returned no string`],
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
      // A malformed package.json mid-walk must not crash the pre-commit gate;
      // treat it as "no manifest here" and keep walking up.
      const pkg = readJsonOr(pkgPath);
      if (pkg && pkg.khai) return dir;
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
  // Resolve link targets from the canon-normalized member tree, so `link` is
  // shape-agnostic: "anchor" is the root member, "expression" is every leaf (the
  // composable units a consumer links), "any" is the whole tree. The shorthand
  // (root = anchor, leaves = expressions) and an explicit ladder resolve the same.
  const members = engineMembers(manifest);
  const root = members.find((m) => m.parent === null)?.file;
  const parentFiles = new Set(members.map((m) => m.parent).filter(Boolean));
  const leaves = members.filter((m) => !parentFiles.has(m.file)).map((m) => m.file);
  for (const r of [].concat(manifest.requires ?? [])) {
    const which = r.link ?? "any";
    const files =
      which === "anchor" ? [root] : which === "expression" ? leaves : members.map((m) => m.file);
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
export function validateInstanceFile(
  text,
  { baseDir, requirements = [], owner, levels, resolvedLanguage } = {},
) {
  const doc = parseDoc(text);
  const type = doc.data?.khai;
  if (typeof type !== "string")
    return [{ level: "fail", message: "instance has no `khai:` type in frontmatter" }];

  // Links into installed engine content resolve via npm, not the local tree, so
  // every wiring target is exempt from the local broken-link check.
  const exemptLinks = new Set(requirements.flatMap((r) => [...r.targets]));
  const findings = validateContentFile(text, {
    type,
    baseDir,
    owner,
    exemptLinks,
    resolvedLanguage,
  }).map((m) => ({
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
  return (
    readdirSync(scopeDir)
      .map((name) => join(scopeDir, name, "package.json"))
      .filter((p) => existsSync(p))
      // An installed dependency with a malformed package.json is skipped, not fatal.
      .map((p) => readJsonOr(p)?.khai)
      .filter((khai) => khai && khai.engine)
  );
}

/** Every `.md` under a dir tree that declares `khai:` frontmatter. */
function findInstanceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findInstanceFiles(full));
    else if (
      entry.name.endsWith(".md") &&
      /^---\r?\n[\s\S]*?\bkhai:/.test(readFileSync(full, "utf8"))
    )
      out.push(full);
  }
  return out;
}

/**
 * Validate a playhouse's `registry.json` against its `plays/` directory:
 * schema shape, blurb constraints, bidirectional directory sync, and title
 * alignment with each play's frontmatter.
 *
 * @param {string} root playhouse root containing `registry.json` and `plays/`
 * @returns {{ file: string, errors: string[], warnings: string[], audit: string[] }[]}
 */
export function validatePlayhouseRegistry(root) {
  const errors = [];
  const registryPath = join(root, "registry.json");
  const playsDir = join(root, "plays");

  if (!existsSync(registryPath)) {
    return [
      {
        file: registryPath,
        // A playhouse (a project with a plays/ dir) must ship a registry.json;
        // the message points at the generator so the requirement is actionable.
        errors: ["missing registry.json at root; run `khai-tests registry build` to generate it"],
        warnings: [],
        audit: [],
      },
    ];
  }

  let registryText;
  try {
    registryText = readFileSync(registryPath, "utf8");
  } catch (err) {
    return [
      {
        file: registryPath,
        errors: [`failed to read registry.json: ${err.message}`],
        warnings: [],
        audit: [],
      },
    ];
  }

  let registry;
  try {
    registry = JSON.parse(registryText);
  } catch (err) {
    return [
      {
        file: registryPath,
        errors: [`failed to parse registry.json: ${err.message}`],
        warnings: [],
        audit: [],
      },
    ];
  }

  if (typeof registry !== "object" || registry === null) {
    return [
      {
        file: registryPath,
        errors: ["registry.json must be a JSON object"],
        warnings: [],
        audit: [],
      },
    ];
  }

  if (typeof registry.name !== "string" || !registry.name.trim()) {
    errors.push("registry.json must have a non-empty string 'name'");
  }
  if (typeof registry.version !== "string" || !registry.version.trim()) {
    errors.push("registry.json must have a non-empty string 'version'");
  }
  if (!Array.isArray(registry.plays)) {
    errors.push("registry.json must have a 'plays' array");
  }

  if (errors.length > 0) {
    return [{ file: registryPath, errors, warnings: [], audit: [] }];
  }

  // Check plays array items
  const registryPlays = registry.plays;
  const playIds = new Set();

  for (let i = 0; i < registryPlays.length; i++) {
    const play = registryPlays[i];
    if (typeof play !== "object" || play === null) {
      errors.push(`plays[${i}] must be an object`);
      continue;
    }
    if (typeof play.id !== "string" || !/^[a-z0-9_]+$/.test(play.id)) {
      errors.push(`plays[${i}] id must match pattern ^[a-z0-9_]+$, got ${JSON.stringify(play.id)}`);
      continue;
    }
    if (playIds.has(play.id)) {
      errors.push(`duplicate play id in registry: "${play.id}"`);
    }
    playIds.add(play.id);

    if (typeof play.title !== "string" || !play.title.trim()) {
      errors.push(`play "${play.id}" must have a non-empty title`);
    }

    if (typeof play.description !== "string") {
      errors.push(`play "${play.id}" must have a description string`);
    } else {
      const desc = play.description;
      if (desc.length < 10 || desc.length > 120) {
        errors.push(
          `play "${play.id}" description must be between 10 and 120 characters (got ${desc.length})`,
        );
      }

      // Check blurb constraints: one sentence, ending in period, no HTML, no markdown except inline code
      const plain = desc.replace(/`[^`]+`/g, "");
      if (!plain.endsWith(".") || plain.endsWith("..")) {
        errors.push(
          `play "${play.id}" description must consist of exactly one sentence ending in a period`,
        );
      } else {
        // A second sentence shows as a terminator followed by whitespace and a
        // new capitalized word. Counting raw periods (the old check) false-failed
        // a single sentence carrying a decimal ("v1.5"), a file name ("Node.js"),
        // or a lowercase abbreviation ("e.g."), none of which end a sentence.
        const multiSentence = /[.!?]\s+[A-Z]/.test(plain);
        const hasQuestionOrBang = /[?!]/.test(plain);
        if (multiSentence || hasQuestionOrBang) {
          errors.push(
            `play "${play.id}" description must consist of exactly one sentence (ending in a period ".")`,
          );
        }
      }

      if (/<[^>]+>/.test(plain)) {
        errors.push(`play "${play.id}" description must not contain HTML tags`);
      }
      // `_` alone is not flagged: an underscore in prose is usually an
      // identifier (snake_case), not emphasis. Bold/italic markers (** __ *) and
      // link brackets ([ ]) still are.
      if (/\*\*|__|\*|\[|\]/.test(plain)) {
        errors.push(
          `play "${play.id}" description must not contain markdown formatting (other than inline code formatting if needed)`,
        );
      }
    }
  }

  // Directory bidirectional sync
  let subdirs = [];
  if (existsSync(playsDir)) {
    try {
      subdirs = readdirSync(playsDir, { withFileTypes: true })
        .filter((e) => e.isDirectory() && !e.name.startsWith("."))
        .map((e) => e.name);
    } catch (err) {
      errors.push(`failed to read plays directory: ${err.message}`);
    }
  }

  // Rule A: For every subdirectory under plays/ (excluding hidden/ignored folders),
  // there must be a corresponding item in registry.json where id matches the directory name.
  for (const subdir of subdirs) {
    if (!playIds.has(subdir)) {
      errors.push(`play subdirectory "${subdir}" has no corresponding entry in registry.json`);
    }
  }

  // Rule B: For every item in the plays array of registry.json,
  // there must be a corresponding directory under plays/ with that name.
  for (const id of playIds) {
    if (!subdirs.includes(id)) {
      errors.push(`registry.json declares play "${id}" but directory "plays/${id}" is missing`);
    }
  }

  // Title Alignment:
  // Parse the playbook frontmatter (the `play_*.md` under `plays/<id>/`, matching
  // how buildRegistry discovers it) and verify that its `title` matches the `title`
  // declared for that play in `registry.json`. buildRegistry falls back to the id
  // when frontmatter has no title, so the comparison applies the same fallback to
  // keep build -> verify idempotent.
  for (const play of registryPlays) {
    if (!play || typeof play.id !== "string" || !play.id) continue;
    const playDir = join(playsDir, play.id);
    if (!existsSync(playDir)) continue;
    let playFileName;
    try {
      playFileName = readdirSync(playDir).find((f) => f.startsWith("play_") && f.endsWith(".md"));
    } catch {
      // unreadable dir already surfaced by the bidirectional-sync checks
    }
    if (!playFileName) continue;
    const playFile = join(playDir, playFileName);
    try {
      const text = readFileSync(playFile, "utf8");
      const doc = parseDoc(text);
      if (doc.ok && doc.data) {
        const fmTitle = doc.data.title || play.id;
        if (fmTitle !== play.title) {
          errors.push(
            `play "${play.id}": title in playbook frontmatter ("${fmTitle}") does not match title in registry.json ("${play.title}")`,
          );
        }
      } else {
        errors.push(`play "${play.id}": failed to parse frontmatter of ${playFile}`);
      }
    } catch (err) {
      errors.push(`play "${play.id}": failed to read playbook ${playFile}: ${err.message}`);
    }
  }

  if (errors.length > 0) {
    return [{ file: registryPath, errors, warnings: [], audit: [] }];
  }
  return [];
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
  const files = new Set(findInstanceFiles(contentDir));

  const ordersDir = join(root, "management", "orders");
  if (existsSync(ordersDir)) {
    for (const file of findInstanceFiles(ordersDir)) {
      files.add(file);
    }
  }

  for (const file of files) {
    const resolvedLanguage = resolveLanguage(file, root);
    const findings = validateInstanceFile(readFileSync(file, "utf8"), {
      baseDir: dirname(file),
      requirements,
      owner,
      levels,
      resolvedLanguage,
    });
    if (findings.length) results.push({ file, ...bucket(findings) });
  }

  const playsDir = join(root, "plays");
  if (existsSync(playsDir) && statSync(playsDir).isDirectory()) {
    const regResults = validatePlayhouseRegistry(root);
    if (regResults.length) results.push(...regResults);
  }

  return results;
}
