// Conformance validator. Pulls the section contract from the canon
// (@chbrain/khai-arch) so it never restates it, then composes the rule atoms.
// Exposed for both package mode (one package/file) and suite mode (the whole
// workspace) - same code, two callers.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { pathToFileURL } from "node:url";
import { resolveCollectionAt, resolveCollections, safePackageJson } from "./collection.mjs";
import { computeRegistry } from "./registry.mjs";
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
  titleCollisions,
  sectionBody,
} from "@chbrain/khai-rules";
import { resolveLanguage } from "@chbrain/khai-language";

const typeIds = Object.keys(types);

// The licence an instance must declare is computed from the canon, never
// configured per repo: each authoring template stamps a `license:` into the
// content generated from it, so the template *is* the ruling and one change in
// khai-arch reaches every consumer on the next dependency bump. A type the
// canon ships no template for (e.g. order) carries no expectation, and a canon
// too old to export `templates` yields none — the kit keeps working, it just
// cannot enforce what the canon does not declare.
const canonLicenses = new Map();
function canonLicenseFor(type) {
  if (!canonLicenses.has(type)) {
    const text = khaiArch.templates?.[type]?.text;
    const declared = text ? parseDoc(text).data?.license : null;
    canonLicenses.set(type, typeof declared === "string" ? declared : null);
  }
  return canonLicenses.get(type);
}

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
 * The Playwright wiring guide every engine ships: a `khai: instructions` file
 * (HACKS) explaining the engine's model so an LLM Playwright wires it from
 * understanding. It is dev-steering, not engine content -- not a manifest
 * member, exempt from the loose-file check, validated as instructions, and
 * excluded from a tour.
 */
const PLAYWRIGHT_INSTRUCTIONS = "playwright_instructions.md";

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
  const mds = readdirSync(pkgDir).filter(
    (f) => f.endsWith(".md") && f !== "CHANGELOG.md" && f !== PLAYWRIGHT_INSTRUCTIONS,
  );
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

// The resolved-verdict vocabulary for a plan's targets is canon, not the kit's
// to restate: pull it from @chbrain/khai-arch (guarded with the same vocabulary
// as a fallback so the kit keeps working against a canon that has not yet shipped
// the export). `[ ]` is open (the live edge), exempt here; a resolved (non-open)
// mark outside the canon set is no verdict at all, so any plan that carries it is
// a finding -- in a play or anywhere, whatever its status. (Whether an open `[ ]`
// is allowed is the separate, status-gated completion check; see the caller.)
const PLAN_VERDICTS = Array.isArray(khaiArch.planVerdicts)
  ? khaiArch.planVerdicts
  : ["x", "f", "w", "-"];
// Build the mark class from the canon set, escaping each mark so a verdict like
// `-` is a literal in the class, never a range, whatever its position.
const RESOLVED_MARK = new RegExp(
  `^[${PLAN_VERDICTS.map((v) => v.replace(/[-\]\\^]/g, "\\$&")).join("")}]$`,
  "i",
);
const VERDICT_LIST = PLAN_VERDICTS.map((v) => `[${v}]`).join(", ");
function targetVerdictErrors(targetsBody, label) {
  const errors = [];
  for (const line of targetsBody) {
    const m = /^\s*[-*+]\s+\[(.)\]/.exec(line);
    if (!m || m[1] === " " || RESOLVED_MARK.test(m[1])) continue;
    errors.push(
      `${label} target has unresolved verdict "[${m[1]}]"; a resolved ${label} target is one of ${VERDICT_LIST}`,
    );
  }
  return errors;
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
  { type, baseDir, owner, allowed, exemptLinks, resolvedLanguage, license, resolvePackageDir },
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
  // The licence is part of the frontmatter contract when the caller pins an
  // expectation (validateInstanceFile pins the canon's): a missing field leaves
  // the content unprotected, a different one re-licenses it on the quiet.
  if (license) {
    const declared = doc.data?.license;
    if (typeof declared !== "string")
      errors.push(`frontmatter license missing (canon declares "${license}")`);
    else if (declared !== license)
      errors.push(`frontmatter license "${declared}" != canon licence "${license}"`);
  }
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
        // The verdict vocabulary holds for every plan, in a play or anywhere
        // else, whatever its status: a resolved (non-open) target must carry a
        // valid verdict. `[ ]` is the open/live edge and is exempt here.
        errors.push(...targetVerdictErrors(targetsBody, "plan"));
        // Completion is the `closed` state: a plan is closed only when every
        // target is resolved, so no open `[ ]` may remain. A draft/active plan is
        // mid-scheme -- an in-world plan staged in a play holds its open targets
        // as forward intent -- so `[ ]` is allowed until it closes.
        if (doc.data?.status === "closed") {
          // Only an unchecked task-list item (`- [ ]` / `* [ ]`) is a pending
          // target; a bare "[ ]" elsewhere in the prose or a code span is not.
          const pendingCount = targetsBody.filter((line) => /^\s*[-*+]\s+\[ \]/.test(line)).length;
          if (pendingCount > 0) {
            errors.push(`plan has ${pendingCount} pending target(s) [ ]`);
          }
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
        // Same vocabulary as a plan. An order has no status lifecycle, so it must
        // complete: the verdict gate applies and no open `[ ]` may remain.
        errors.push(...targetVerdictErrors(targetsBody, "order"));
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
  if (baseDir)
    errors.push(...checkLinks(text, baseDir, { exempt: exemptLinks, resolvePackageDir }));

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

/** Every `.md` in the dir that declares `khai:` frontmatter (a content instance).
 * A leading BOM is tolerated in the probe so a BOM-prefixed instance is still
 * discovered -- and then flagged by checkEncoding ("BOM present") -- instead of
 * being skipped and left silently unvalidated. */
function instanceFiles(pkgDir) {
  return readdirSync(pkgDir)
    .filter((f) => f.endsWith(".md"))
    .filter((f) => /^\uFEFF?---\r?\n[\s\S]*?\bkhai:/.test(readFileSync(join(pkgDir, f), "utf8")));
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

  // A `class: meta` engine is the spine -- the flavored instructions and the
  // architecture (the extension point) a world runs on -- not a content engine
  // wired into a house/element chapter. So it carries no WIRES card and no
  // card-rendered README: those two ceremonies are content-engine only. Its
  // members are meta-type instances (instructions, architecture) and validate
  // against the canon exactly like any other instance, so everything below the
  // two gated blocks (members, REFERENCES/LORE, orphan check, compose, docs) is
  // identical. The discriminator is the canon's own `class` vocabulary, declared
  // on the manifest -- computed, not judged.
  const isMeta = manifest.class === "meta";

  // WIRES card: the engine must declare a valid card. khai-arch owns the shape
  // (engineCard throws on a missing slug, missing/empty chapter, or foreign
  // key); the kit surfaces that as a package error so a cardless engine fails.
  // A meta engine is the spine, not wired into a chapter, so it carries none.
  if (!isMeta) {
    try {
      engineCard(manifest);
    } catch (err) {
      results.push({ file: "package.json", errors: [`WIRES card: ${err.message}`] });
    }
  }

  // README: generated, never hand-edited. The canon renders it from the manifest
  // (renderEngineReadme), so a missing or drifted README is a real error -- the
  // pointer must never disagree with the source of truth. Deterministic: the
  // answer is in the bytes, so this gates (unlike the advisory docs lane). The
  // renderer keys off the WIRES card, so a meta engine (cardless) has no
  // generated README to hold to.
  if (!isMeta) {
    try {
      const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
      const expected = renderEngineReadme(pkg);
      const readmePath = join(pkgDir, "README.md");
      if (!existsSync(readmePath))
        results.push({
          file: "README.md",
          errors: ["missing; run the canon's renderEngineReadme"],
        });
      else if (readFileSync(readmePath, "utf8") !== expected)
        results.push({
          file: "README.md",
          errors: ["drifted from the manifest; regenerate with the canon's renderEngineReadme"],
        });
    } catch (err) {
      results.push({ file: "README.md", errors: [`cannot render from manifest: ${err.message}`] });
    }
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
  // A meta engine is the exception: its parts (instructions, architecture) are
  // independent sibling instances, not a single-root composition tree, so it
  // reads its members as a flat list rather than desugaring through the canon.
  let members = [];
  if (isMeta) {
    members = Array.isArray(manifest.members) ? manifest.members : [];
    if (members.length === 0)
      results.push({
        file: "package.json",
        errors: [
          "a meta engine must declare its members (the instructions/architecture instances)",
        ],
      });
  } else {
    try {
      members = engineMembers(manifest);
    } catch (err) {
      results.push({ file: "package.json", errors: [`manifest members: ${err.message}`] });
    }
  }
  const referenced = new Set(members.map((m) => m.file));

  // referenced files exist + conform (each against its declared member type).
  // Collect each member's display title (the H1 name) so the collision check
  // below can find two kinds sharing one title. Only manifest members are
  // billed here, so the Playwright guide (not a member) is never in the set and
  // its by-design root-name reuse cannot false-fire.
  const titleElements = [];
  for (const m of members) {
    const path = join(pkgDir, m.file);
    if (!existsSync(path)) {
      results.push({ file: m.file, errors: [`manifest references missing file: ${m.file}`] });
      continue;
    }
    const text = readFileSync(path, "utf8");
    const errors = validateContentFile(text, {
      type: m.type,
      baseDir: pkgDir,
      owner,
      allowed: (manifest.extensions ?? {})[m.file],
      // Hard links out of an engine/composite member resolve only through the
      // package's own declared dependencies -- the composite contract.
      resolvePackageDir: packageDirResolver(pkgDir),
    });
    if (errors.length) results.push({ file: m.file, errors });
    const { name } = checkH1(parseDoc(text), { type: m.type });
    if (name) titleElements.push({ file: m.file, kind: m.type, title: name });
  }

  // collision: no two members across kinds share a display title (computed). A
  // meta engine is the spine, not a cast: its parts (instructions, architecture)
  // are two facets of one spine and may co-name it, so the collision check --
  // which polices a navigable cast -- does not apply to it, exactly as the WIRES
  // card and generated README do not.
  if (!isMeta) {
    const collisions = titleCollisions(titleElements);
    if (collisions.length) results.push({ file: "package.json", errors: collisions });
  }

  // no orphan content: every khai instance file must be a declared member
  // (the Playwright wiring guide is dev-steering, not a member -- exempt).
  for (const file of instanceFiles(pkgDir)) {
    if (file === PLAYWRIGHT_INSTRUCTIONS) continue;
    if (!referenced.has(file))
      results.push({ file, errors: [`content file not referenced in manifest: ${file}`] });
  }

  // The Playwright wiring guide is required: every engine ships one, including
  // the meta engine (spine carries a short guide that points at the Roadie), so
  // there is no carve-out -- a missing guide is a finding. When present it is
  // validated as an instructions instance (HACKS, each chapter non-empty).
  const piPath = join(pkgDir, PLAYWRIGHT_INSTRUCTIONS);
  if (!existsSync(piPath)) {
    results.push({
      file: PLAYWRIGHT_INSTRUCTIONS,
      errors: ["missing; every engine ships a Playwright wiring guide"],
    });
  } else {
    const errors = validateContentFile(readFileSync(piPath, "utf8"), {
      type: "instructions",
      baseDir: pkgDir,
      resolvePackageDir: packageDirResolver(pkgDir),
    });
    if (errors.length) results.push({ file: PLAYWRIGHT_INSTRUCTIONS, errors });
  }

  // compose() smoke test - executes package code; trusted callers only. The
  // composable units are the tree's leaves (canon compositionOrder), general
  // across shapes. The call shape follows the manifest: an explicit-members
  // engine composes a leaf file; the anchor+expressions shorthand composes an
  // expression name (kept so existing engines are unaffected). A meta engine
  // composes a flavor, defaulting when called bare, so the smoke is a bare call.
  if (executeCompose) {
    try {
      const mod = await import(pathToFileURL(join(pkgDir, "index.mjs")).href);
      const calls = isMeta
        ? [undefined]
        : Array.isArray(manifest.members)
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

function requirementsFromEngine(entry) {
  // Accept a bare khai manifest (the exported wiringRequirements contract) or
  // the { khai, name } pair project mode collects, so a requirement can carry
  // the engine's npm name for qualified-link matching.
  const manifest = entry?.khai ?? entry;
  const pkgName = entry?.khai ? entry.name : undefined;
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
      package: pkgName,
      targets: new Set(files.filter(Boolean).map((f) => f.split("/").pop())),
    });
  }
  return reqs;
}

/** Collect wiring requirements from a set of engine manifests. */
export function wiringRequirements(manifests) {
  return manifests.flatMap(requirementsFromEngine);
}

// --- reviewer-assist: source-language leak into the English `title` ----------
// `title` is the English-facing label; `declared` is the name as it stands in the
// source. The two diverge for a common noun (declared "König" -> title "The King")
// and coincide for a proper noun or cognate (Rapunzel/Rapunzel, Horn/Horn), so no
// script can tell "keep" from "translate": a blanket title===declared rewrite would
// corrupt the proper nouns. This check therefore never fails and never edits -- it
// raises AUDIT findings a human triages. Two buckets, per the contract:
//   (a) the title carries a source-language marker (orthography, a connective
//       phrase, or an observed common noun) -- the high-signal case;
//   (b) the title equals the declared source name -- the low-signal case (mostly
//       proper nouns, surfaced so a stray untranslated common noun is not missed).

// Curated source-language markers, keyed by the resolved language so a new source
// adds its own set without touching the logic. German is the only source in play.
// Deliberately high-precision over a Title-cased English label: a *bare* umlaut is
// not a marker, because a proper name keeps its orthography in English (Büchner,
// Dörfling) and would only train reviewers to ignore the audit; the title===declared
// bucket below surfaces those gently instead. What stays:
//   - a Title-cased German connective binding two words: the tell of a Title-cased
//     German slug ("Tonne Im Meer", "Lied Von Herz Und Leber"). A lowercased "von"
//     in an English-rendered name ("Wenzel von Tronka") is deliberately not matched.
//   - the common nouns observed leaking from Title-cased German slugs (matched
//     Title-cased, so an English word mid-title is not caught).
const SOURCE_MARKERS = {
  german: [
    /\b(?:Und|Im|Von|Zu|Auf|Aus|Mit|Der|Die|Das|Dem|Den)\s+\w/,
    /\b(?:Wald|H(?:ue|ü)tte|Becher|V(?:oe|ö)gel|Vogel|Sau|Kirche|K(?:oe|ö)nig|Goldschmied|Goldei|Tonne|Meer|Stube|Schloss|Brunnen|Eierhandel|Spruchwirkung|Wunschkraft|Zitrone|Messer|Bodenloch|Voegel|Wuensche|Erwaehlt|Versoehnung)\b/,
  ],
};

/**
 * Reviewer-assist audit for source-language text leaking into `title`. Returns
 * AUDIT-level findings only (never errors, never warnings): the call to translate
 * or keep is the reviewer's, not the gate's. English content (no resolved source
 * language) is exempt -- there is no second language to leak. A file is reported
 * once: the high-signal marker bucket takes precedence over the title===declared
 * bucket, so a flagged file is not double-counted.
 * @param {ReturnType<typeof parseDoc>} doc
 * @param {string} [resolvedLanguage]
 * @returns {{ level: "audit", message: string }[]}
 */
export function titleLeakAudit(doc, resolvedLanguage) {
  if (!doc.ok) return [];
  const title = doc.data?.title;
  if (typeof title !== "string" || title.trim() === "") return [];
  const lang = resolvedLanguage && resolvedLanguage !== "english" ? resolvedLanguage : null;
  if (!lang) return []; // an English label over an English source has nothing to leak
  const markers = SOURCE_MARKERS[lang] ?? [];
  if (markers.some((re) => re.test(title)))
    return [
      {
        level: "audit",
        message:
          `title "${title}" may carry ${lang} text; \`title\` is the English label and the ` +
          `source name belongs in \`declared\` (translate a common noun, keep a proper noun)`,
      },
    ];
  const declared = doc.data?.declared;
  if (typeof declared === "string" && declared.trim() !== "" && title.trim() === declared.trim())
    return [
      {
        level: "audit",
        message:
          `title equals declared ("${title}"); confirm this is a proper noun or cognate, ` +
          `not an untranslated ${lang} common noun`,
      },
    ];
  return [];
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
  {
    baseDir,
    requirements = [],
    owner,
    levels,
    resolvedLanguage,
    license,
    resolvePackageDir,
    ambiguous,
  } = {},
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
    resolvePackageDir,
    // "canon" resolves to whatever licence the installed canon's template for
    // this type stamps; an explicit string pins it; absent means no check
    // (direct callers validating structure only).
    license: license === "canon" ? canonLicenseFor(type) : license,
  }).map((m) => ({
    level: "fail",
    message: m,
  }));
  for (const req of requirements) {
    if (req.on !== type) continue;
    const level = resolveLevel(req, levels);
    for (const m of checkWiring(doc, { ...req, ambiguous })) findings.push({ level, message: m });
  }
  // Reviewer-assist (audit only): does the English `title` carry source-language
  // text? Never gates -- the translate/keep call is the reviewer's.
  findings.push(...titleLeakAudit(doc, resolvedLanguage));
  return findings;
}

/**
 * A dependency-scoped package resolver for hard (package-specifier) links: a
 * package resolves only when the consumer's own package.json DECLARES it (deps
 * or devDeps) and it is installed (walking up through node_modules, so a
 * workspace-hoisted install resolves the same as a flat one). Undeclared or
 * missing -> null, and the link check fails closed: the hard-reference
 * contract is "a link without a dependency is a build error".
 */
function packageDirResolver(fromDir) {
  const pkgJson = readJsonOr(join(fromDir, "package.json")) ?? {};
  const declared = new Set([
    ...Object.keys(pkgJson.dependencies ?? {}),
    ...Object.keys(pkgJson.devDependencies ?? {}),
  ]);
  return (name) => {
    if (!declared.has(name)) return null;
    let dir = fromDir;
    for (;;) {
      const candidate = join(dir, "node_modules", name);
      if (existsSync(join(candidate, "package.json"))) return candidate;
      const parent = dirname(dir);
      if (parent === dir) return null;
      dir = parent;
    }
  };
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
      .map((p) => readJsonOr(p))
      .filter((pkg) => pkg?.khai?.engine)
      .map((pkg) => ({ khai: pkg.khai, name: pkg.name }))
  );
}

/** Basenames shipped by more than one installed engine: the collisions a bare
 * wiring link cannot disambiguate, so the kit demands the qualified form. */
function sharedMemberBasenames(installed) {
  const owners = new Map();
  for (const { khai } of installed) {
    let files;
    try {
      files = engineMembers(khai).map((m) => m.file.split("/").pop());
    } catch {
      continue;
    }
    for (const base of new Set(files)) {
      owners.set(base, (owners.get(base) ?? 0) + 1);
    }
  }
  return new Set([...owners.entries()].filter(([, n]) => n > 1).map(([base]) => base));
}

/** Every `.md` under a dir tree that declares `khai:` frontmatter. A leading BOM
 * is tolerated in the probe so a BOM-prefixed instance is still discovered -- and
 * then flagged by checkEncoding ("BOM present") -- instead of being skipped and
 * left silently unvalidated. */
function findInstanceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findInstanceFiles(full));
    else if (
      entry.name.endsWith(".md") &&
      /^\uFEFF?---\r?\n[\s\S]*?\bkhai:/.test(readFileSync(full, "utf8"))
    )
      out.push(full);
  }
  return out;
}

/**
 * Deterministic JSON for structural equality: object keys are sorted (so key
 * order and pretty-print formatting never cause a false diff) while array order
 * is preserved (so a re-sorted entry list *is* a diff). Used to compare a
 * committed registry against a fresh build.
 * @param {unknown} value
 * @returns {string}
 */
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    // Drop undefined-valued keys, mirroring JSON.stringify (how the registry is
    // written): an in-memory `{ kind: undefined }` serialises to no key at all, so
    // the committed file — which never had it — must compare equal.
    return `{${Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

/**
 * Validate a house's `registry.json` against its collection directory: schema
 * shape, blurb constraints, bidirectional directory sync, and title alignment
 * with each item's anchor frontmatter. The collection (dir, registry key, item
 * anchor) is resolved from package.json and defaults to plays, so a play house
 * is validated exactly as before.
 *
 * @param {string} root house root containing `registry.json` and the collection dir
 * @returns {{ file: string, errors: string[], warnings: string[], audit: string[] }[]}
 */
export function validateCollectionRegistry(root) {
  const collections = resolveCollections(safePackageJson(root));
  const primary = collections[0];
  const errors = [];
  const registryPath = join(root, "registry.json");

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
  for (const c of collections) {
    if (!Array.isArray(registry[c.key])) {
      errors.push(`registry.json must have a '${c.key}' array`);
    }
  }

  if (errors.length > 0) {
    return [{ file: registryPath, errors, warnings: [], audit: [] }];
  }

  // The ids each collection declares, so a referencing entry can be checked to
  // cast only members that actually exist.
  const idsByKey = {};
  for (const c of collections) {
    idsByKey[c.key] = new Set(
      registry[c.key].filter((it) => it && typeof it.id === "string").map((it) => it.id),
    );
  }

  // Validate every collection's entries, directory sync, and title alignment.
  // The numbering invariant (further below) runs once, against the primary only.
  for (const collection of collections) {
    const noun = collection.key.replace(/s$/, "");
    const itemsDir = join(root, collection.dir);
    // Check the collection array items
    const registryItems = registry[collection.key];
    const itemIds = new Set();

    for (let i = 0; i < registryItems.length; i++) {
      const item = registryItems[i];
      if (typeof item !== "object" || item === null) {
        errors.push(`${collection.key}[${i}] must be an object`);
        continue;
      }
      if (typeof item.id !== "string" || !/^[a-z0-9_]+$/.test(item.id)) {
        errors.push(
          `${collection.key}[${i}] id must match pattern ^[a-z0-9_]+$, got ${JSON.stringify(item.id)}`,
        );
        continue;
      }
      if (itemIds.has(item.id)) {
        errors.push(`duplicate ${noun} id in registry: "${item.id}"`);
      }
      itemIds.add(item.id);

      if (typeof item.title !== "string" || !item.title.trim()) {
        errors.push(`${noun} "${item.id}" must have a non-empty title`);
      }

      if (typeof item.description !== "string") {
        errors.push(`${noun} "${item.id}" must have a description string`);
      } else {
        const desc = item.description;
        if (desc.length < 10 || desc.length > 120) {
          errors.push(
            `${noun} "${item.id}" description must be between 10 and 120 characters (got ${desc.length})`,
          );
        }

        // Check blurb constraints: one sentence, ending in period, no HTML, no markdown except inline code
        const plain = desc.replace(/`[^`]+`/g, "");
        if (!plain.endsWith(".") || plain.endsWith("..")) {
          errors.push(
            `${noun} "${item.id}" description must consist of exactly one sentence ending in a period`,
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
              `${noun} "${item.id}" description must consist of exactly one sentence (ending in a period ".")`,
            );
          }
        }

        if (/<[^>]+>/.test(plain)) {
          errors.push(`${noun} "${item.id}" description must not contain HTML tags`);
        }
        // `_` alone is not flagged: an underscore in prose is usually an
        // identifier (snake_case), not emphasis. Bold/italic markers (** __ *) and
        // link brackets ([ ]) still are.
        if (/\*\*|__|\*|\[|\]/.test(plain)) {
          errors.push(
            `${noun} "${item.id}" description must not contain markdown formatting (other than inline code formatting if needed)`,
          );
        }
      }

      // kind discriminator: validated when present (the build stamps it on every
      // entry) and required to match its collection's. Left optional here so a
      // registry built before kind existed still verifies until it is rebuilt;
      // tightening absence into an error is a separate, coordinated migration.
      if (item.kind !== undefined && item.kind !== collection.kind) {
        errors.push(
          `${noun} "${item.id}" must declare kind "${collection.kind}" (got ${JSON.stringify(item.kind)})`,
        );
      }

      // iso is optional; when present it must be a non-empty string (ISO 3166 /
      // 3166-2). Absent means the entry is non-mappable.
      if (item.iso !== undefined && (typeof item.iso !== "string" || !item.iso.trim())) {
        errors.push(`${noun} "${item.id}" iso, when present, must be a non-empty string`);
      }

      // references: only a referencing collection carries them, and each must name
      // an existing member of the referenced collection (a derived cast, never a
      // dangling pointer).
      if (item.references !== undefined) {
        if (!collection.references) {
          errors.push(`${noun} "${item.id}" has references but its collection references nothing`);
        } else if (!Array.isArray(item.references)) {
          errors.push(`${noun} "${item.id}" references must be an array`);
        } else {
          const known = idsByKey[collection.references] || new Set();
          for (const ref of item.references) {
            if (!known.has(ref)) {
              errors.push(
                `${noun} "${item.id}" references "${ref}", which is not a ${collection.references} member`,
              );
            }
          }
        }
      }
    }

    // Directory bidirectional sync
    let subdirs = [];
    if (existsSync(itemsDir)) {
      try {
        subdirs = readdirSync(itemsDir, { withFileTypes: true })
          .filter((e) => e.isDirectory() && !e.name.startsWith("."))
          .map((e) => e.name);
      } catch (err) {
        errors.push(`failed to read ${collection.dir} directory: ${err.message}`);
      }
    }

    // Rule A: For every subdirectory under the collection dir (excluding hidden/ignored
    // folders), there must be a corresponding item in registry.json by directory name.
    for (const subdir of subdirs) {
      if (!itemIds.has(subdir)) {
        errors.push(`${noun} subdirectory "${subdir}" has no corresponding entry in registry.json`);
      }
    }

    // Rule B: For every item in the registry's collection array, there must be a
    // corresponding directory under the collection dir with that name.
    for (const id of itemIds) {
      if (!subdirs.includes(id)) {
        errors.push(
          `registry.json declares ${noun} "${id}" but directory "${collection.dir}/${id}" is missing`,
        );
      }
    }

    // (numbering invariant moved below, after the per-collection loop — it counts
    // the primary collection only, so referencing collections never move it.)

    // Title Alignment:
    // Parse the playbook frontmatter (the `play_*.md` under `plays/<id>/`, matching
    // how buildRegistry discovers it) and verify that its `title` matches the `title`
    // declared for that play in `registry.json`. buildRegistry falls back to the id
    // when frontmatter has no title, so the comparison applies the same fallback to
    // keep build -> verify idempotent.
    for (const item of registryItems) {
      if (!item || typeof item.id !== "string" || !item.id) continue;
      const itemDir = join(itemsDir, item.id);
      if (!existsSync(itemDir)) continue;
      let anchorFileName;
      try {
        anchorFileName = readdirSync(itemDir).find(
          (f) => f.startsWith(collection.anchor) && f.endsWith(".md"),
        );
      } catch {
        // unreadable dir already surfaced by the bidirectional-sync checks
      }
      if (!anchorFileName) continue;
      const anchorFile = join(itemDir, anchorFileName);
      try {
        const text = readFileSync(anchorFile, "utf8");
        const doc = parseDoc(text);
        if (doc.ok && doc.data) {
          const fmTitle = doc.data.title || item.id;
          if (fmTitle !== item.title) {
            errors.push(
              `${noun} "${item.id}": title in playbook frontmatter ("${fmTitle}") does not match title in registry.json ("${item.title}")`,
            );
          }
        } else {
          errors.push(`${noun} "${item.id}": failed to parse frontmatter of ${anchorFile}`);
        }
      } catch (err) {
        errors.push(`${noun} "${item.id}": failed to read anchor ${anchorFile}: ${err.message}`);
      }
    }
  } // end per-collection loop

  // Numbering invariant: the minor version tracks the PRIMARY item count. A house
  // adds a primary item with a minor bump, so the minor *is* that count — computed,
  // not chosen; referencing collections (e.g. groups) never move it. Two
  // unreconciled paths (a manual version edit vs. a minor changeset) can drift the
  // version from the count, and nothing else catches it; assert it here so the
  // mismatch is a red build. The scheme only holds while major stays 0, so a
  // non-zero major is itself the finding.
  {
    const noun = primary.key.replace(/s$/, "");
    const count = registry[primary.key].length;
    const versionMatch = /^(\d+)\.(\d+)\./.exec(String(registry.version).trim());
    if (!versionMatch) {
      errors.push(
        `registry.json version "${registry.version}" is not semver (MAJOR.MINOR.PATCH); ` +
          `cannot check that the minor tracks the ${noun} count`,
      );
    } else {
      const major = Number(versionMatch[1]);
      const minor = Number(versionMatch[2]);
      if (major !== 0) {
        errors.push(
          `registry.json version "${registry.version}" has major ${major}; a house stays 0.x ` +
            `so the minor tracks the ${noun} count (a major bump resets the minor and breaks the invariant)`,
        );
      } else if (minor !== count) {
        errors.push(
          `registry.json version minor (${minor}) must equal the ${noun} count (${count}); ` +
            `adding a ${noun} is a minor bump, so 0.${count}.x is expected`,
        );
      }
    }
  }

  // Build-drift gate: the committed registry.json must equal what the build
  // (computeRegistry) produces from source. This catches a hand-edited or stale
  // registry — a description no longer matching its play's frontmatter, a missing
  // or reordered entry, a drifted version — which the per-field checks above pass
  // individually but which a rebuild (the release `version` script) would silently
  // overwrite, turning a green house red only at release. The build is the single
  // writer; a hand edit is a finding. Compared structurally: object-key order and
  // JSON formatting are ignored, array order (the entry sort) is significant.
  // Only a real house can be rebuilt (computeRegistry needs package.json and the
  // collection dir); their absence is reported by other gates, so guard rather
  // than double-report. A partial fixture that lacks them simply skips this check.
  if (existsSync(join(root, "package.json"))) {
    try {
      const expected = computeRegistry(root).registryData;
      if (stableStringify(expected) !== stableStringify(registry)) {
        errors.push(
          "registry.json is out of date with its source; run `khai-tests registry build` " +
            "(the build is the single writer — do not hand-edit registry.json)",
        );
      }
    } catch (err) {
      errors.push(`could not rebuild registry.json to check it for drift: ${err.message}`);
    }
  }

  if (errors.length > 0) {
    return [{ file: registryPath, errors, warnings: [], audit: [] }];
  }
  return [];
}

/**
 * Back-compat alias for {@link validateCollectionRegistry}. The historical name
 * from when the only collection was plays; downstream importers may still use it.
 * @param {string} root
 */
export function validatePlayhouseRegistry(root) {
  return validateCollectionRegistry(root);
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
 * @param {{ root: string, contentDir?: string, owner?: object, levels?: Record<string,string>, license?: string|false }} opts
 * @returns {{ file: string, errors: string[], warnings: string[], audit: string[] }[]}
 */
/**
 * A needed position without a persona is a failure. In any directory that casts a
 * management company, every `position_*.md` must have at least one `persona_*.md`
 * whose Taxonomy links to it. (A persona pointing at a missing position is a
 * broken link, caught by checkLinks; this catches the reverse: an orphan
 * position.) Grouped per directory, so a chain cast and a house cast are each
 * checked against their own personas.
 *
 * @param {Iterable<string>} files  instance file paths
 * @returns {{ file: string, errors: string[] }[]}
 */
export function castErrors(files) {
  const byDir = new Map();
  for (const f of files) {
    const base = basename(f);
    const isPosition = /^position_.+\.md$/.test(base);
    const isPersona = /^persona_.+\.md$/.test(base);
    if (!isPosition && !isPersona) continue;
    const dir = dirname(f);
    if (!byDir.has(dir)) byDir.set(dir, { positions: [], linked: new Set() });
    const group = byDir.get(dir);
    if (isPosition) group.positions.push({ file: f, base });
    else
      for (const m of readFileSync(f, "utf8").matchAll(/position_[a-z0-9_]+\.md/g))
        group.linked.add(m[0]);
  }
  const results = [];
  for (const { positions, linked } of byDir.values())
    for (const pos of positions)
      if (!linked.has(pos.base))
        results.push({
          file: pos.file,
          errors: [
            `position has no persona: nothing links to ${pos.base} ` +
              `(a needed position without a persona is a failure)`,
          ],
        });
  return results;
}

/** Basenames of every relative markdown link target in a block of text. Mirrors
 * the private helper in khai-rules and the regex the house "isolated links" test
 * uses; inlined here so casting coverage owns no cross-package import. */
function castLinkBasenames(text) {
  const re = /\]\(([^()\s]+)\)/g;
  const out = [];
  let m;
  while ((m = re.exec(text))) {
    const target = m[1].split("#")[0];
    if (!target || /^[a-z]+:\/\//i.test(target)) continue;
    out.push(target.split(/[/\\]/).pop());
  }
  return out;
}

/**
 * A plot that names its company in plain prose ships uncast: structurally valid,
 * green in CI, yet bound to nothing until a human reads the rendered play. This
 * is the dual of castErrors (a needed position without a persona) lifted to the
 * play level — computed, not judged.
 *
 * A plot casts an element by linking it inline; the play's Company section is the
 * closed set of elements the play may field, so it is the source of truth for
 * what the cast is. A plot's cast is the intersection of its links with the
 * Company's links — which drops the structural Taxonomy link to the play itself
 * (a play never lists itself in its Company) without special-casing.
 *
 *   (a) a plot whose cast is empty is uncast — an error.
 *   (b) a Company element no plot casts is a dead entry — a warning, since the
 *       Company is an upper bound ("the closed cast this discussion MAY field"),
 *       not a mandate that every declared member be fielded.
 *
 * @param {string} root  project root (looks for plays/<id>/)
 * @returns {{ file: string, errors: string[], warnings: string[], audit: string[] }[]}
 */
export function castingCoverageErrors(root) {
  const collection = resolveCollectionAt(root);
  const itemsDir = join(root, collection.dir);
  if (!existsSync(itemsDir) || !statSync(itemsDir).isDirectory()) return [];

  let subdirs;
  try {
    subdirs = readdirSync(itemsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((e) => e.name);
  } catch {
    return [];
  }

  const results = [];
  for (const id of subdirs) {
    const playDir = join(itemsDir, id);
    let files;
    try {
      files = readdirSync(playDir).filter((f) => f.endsWith(".md"));
    } catch {
      continue;
    }
    const playFileName = files.find((f) => f.startsWith(collection.anchor));
    if (!playFileName) continue; // structure is the registry's concern, not casting's

    const playPath = join(playDir, playFileName);
    const parsed = parseDoc(readFileSync(playPath, "utf8"));
    const companyLines = parsed.body == null ? null : sectionBody(parsed.body, "Company");
    const company = new Set(companyLines ? castLinkBasenames(companyLines.join("\n")) : []);
    if (company.size === 0) continue; // no declared cast to measure a plot against

    const cast = new Set(); // union of every plot's casting links
    for (const plotFile of files.filter((f) => f.startsWith("plot_"))) {
      const plotPath = join(playDir, plotFile);
      const plotCast = castLinkBasenames(readFileSync(plotPath, "utf8")).filter((b) =>
        company.has(b),
      );
      for (const b of plotCast) cast.add(b);
      if (plotCast.length === 0) {
        results.push({
          file: plotPath,
          errors: [
            "plot casts nothing: its prose links no element of its play's Company " +
              "(cast the company by linking it inline, not naming it in plain text)",
          ],
          warnings: [],
          audit: [],
        });
      }
    }

    const dead = [...company].filter((b) => !cast.has(b));
    if (dead.length) {
      results.push({
        file: playPath,
        errors: [],
        warnings: dead.map((b) => `Company element cast by no plot: ${b}`),
        audit: [],
      });
    }
  }

  return results;
}

/**
 * The cast floor (order 1, cut-to-fit): a play that fields personas fields at
 * least three. A debate needs three voices; two is a duet, one a monologue. The
 * floor is CONDITIONAL: a play may field no persona at all (a structural play
 * that demonstrates plot shape, e.g. an engine's folktale, monomyth, or dramatic
 * arc), so it binds only once a play declares a persona in its Company. Computed,
 * not judged; the scope is the play's Company (its closed cast).
 *
 * The order's companion floor, "at least one plot per beat", is deferred here on
 * purpose: the canon has no "beat" to count against, so gating it would be judged,
 * not computed. It returns to the wall once the term is defined (a maintainer
 * ruling, possibly a canon change), per the audit's ratchet.
 *
 * @param {string} root  project root (looks for plays/<id>/)
 * @returns {{ file: string, errors: string[], warnings: string[], audit: string[] }[]}
 */
export function castFloorErrors(root) {
  const collection = resolveCollectionAt(root);
  const itemsDir = join(root, collection.dir);
  if (!existsSync(itemsDir) || !statSync(itemsDir).isDirectory()) return [];

  let subdirs;
  try {
    subdirs = readdirSync(itemsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((e) => e.name);
  } catch {
    return [];
  }

  const results = [];
  for (const id of subdirs) {
    const playDir = join(itemsDir, id);
    let files;
    try {
      files = readdirSync(playDir).filter((f) => f.endsWith(".md"));
    } catch {
      continue;
    }
    const playFileName = files.find((f) => f.startsWith(collection.anchor));
    if (!playFileName) continue; // structure is the registry's concern

    const playPath = join(playDir, playFileName);
    const parsed = parseDoc(readFileSync(playPath, "utf8"));
    const companyLines = parsed.body == null ? null : sectionBody(parsed.body, "Company");
    if (companyLines === null) continue;
    const personas = new Set(
      castLinkBasenames(companyLines.join("\n")).filter((b) => b.startsWith("persona_")),
    );
    // Conditional floor: a persona-less play is structural, not a debate; exempt.
    if (personas.size === 0 || personas.size >= 3) continue;
    results.push({
      file: playPath,
      errors: [
        `cast floor: a play that fields personas fields at least three (a debate needs ` +
          `three voices); this Company fields ${personas.size} (${[...personas].join(", ")})`,
      ],
      warnings: [],
      audit: [],
    });
  }

  return results;
}

export function validateProject({
  root,
  contentDir = root,
  owner,
  levels,
  license = "canon",
} = {}) {
  const installed = installedEngineManifests(root);
  const requirements = wiringRequirements(installed);
  // The consumer-side ambiguity rule: where two installed engines ship the
  // same member filename, a bare link names nothing determinate -- checkWiring
  // demands the package-qualified form for exactly these basenames.
  const ambiguous = sharedMemberBasenames(installed);
  // Hard (package-specifier) links resolve only through the project's own
  // declared dependencies.
  const resolvePackageDir = packageDirResolver(root);
  const results = [];
  const files = new Set(findInstanceFiles(contentDir));

  const ordersDir = join(root, "management", "orders");
  if (existsSync(ordersDir)) {
    for (const file of findInstanceFiles(ordersDir)) {
      files.add(file);
    }
  }

  // Collect each instance's display title per directory (the play/cast scope),
  // so the collision check below can find two kinds sharing one title within a
  // single play.
  const elementsByDir = new Map();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const resolvedLanguage = resolveLanguage(file, root);
    const findings = validateInstanceFile(text, {
      baseDir: dirname(file),
      requirements,
      owner,
      levels,
      resolvedLanguage,
      license,
      resolvePackageDir,
      ambiguous,
    });
    if (findings.length) results.push({ file, ...bucket(findings) });
    const doc = parseDoc(text);
    const kind = doc.data?.khai;
    const { name } = typeof kind === "string" ? checkH1(doc, { type: kind }) : { name: null };
    if (name) {
      const dir = dirname(file);
      if (!elementsByDir.has(dir)) elementsByDir.set(dir, []);
      elementsByDir.get(dir).push({ file: basename(file), kind, title: name });
    }
  }

  // A needed position without a persona is a failure (computed, not judged).
  results.push(...castErrors(files));

  // collision: within a play (a directory of instances) no two elements across
  // kinds share a display title, and a whole-phenomenon piece may not reuse the
  // play title. The Playwright wiring guide is dev-steering named after the
  // phenomenon, not a cast element, so it is exempt (as it is from the loose and
  // orphan checks).
  const exemptTitles = new Set([PLAYWRIGHT_INSTRUCTIONS]);
  for (const [dir, elements] of elementsByDir) {
    const collisions = titleCollisions(elements, { exempt: exemptTitles });
    if (collisions.length) results.push({ file: dir, errors: collisions, warnings: [], audit: [] });
  }

  const itemsDir = join(root, resolveCollectionAt(root).dir);
  if (existsSync(itemsDir) && statSync(itemsDir).isDirectory()) {
    const regResults = validateCollectionRegistry(root);
    if (regResults.length) results.push(...regResults);
    // Every plot must cast at least one element of its item's Company; a dead
    // Company entry is a warning. The dual of castErrors, at the item level.
    results.push(...castingCoverageErrors(root));
    // A play that fields personas fields at least three (a debate needs three
    // voices); a persona-less structural play is exempt.
    results.push(...castFloorErrors(root));
  }

  return results;
}
