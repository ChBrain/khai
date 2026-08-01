/**
 * khai-tour scenario: pack a scenario working folder into one flat bundle
 * (the "scenario station"). A scenario is a guest production staged from a
 * house's repertoire (a khai plays house, e.g. khai-cultures) plus whatever
 * an installed khai engine lends by law. It comes and goes; the house and the
 * engines answer for the material it borrows.
 *
 * Kept pure (bundle.mjs style): sources in, entries + warnings out; throws on
 * a gate failure. `packScenario` is the thin zip/I-O wrapper.
 *
 * Stations (see docs/TOUR.md and the brief this implements):
 *   1. parse the Company (+ the plots the Triggers section links), plus the
 *      play file itself
 *   2. resolve each name against the scenario folder, the house, the
 *      installed engines -- build / borrow / fail / collision
 *   3. widen by the engine ladder: one hop past the Company, structural
 *      (ancestor chain), not by following the pulled files' own links again
 *   4. compose the instructions (composeInstructions, reused, not forked)
 *   5. rewrite links: in-bundle -> bare basename; out-of-bundle -> an
 *      absolute GitHub URL, home
 *   6. gate: the play's H2 sequence, no em/en dash in any bundled md, every
 *      Company name resolved
 *   7. pack: strip frontmatter (stripFrontmatter, reused), one flat zip
 */

import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import { createRequire } from "node:module";
import {
  instructions as spineInstructions,
  houseRules as spineHouseRulesFragment,
  adaptions as spineAdaptions,
} from "@chbrain/khai-engine-spine";
import { engineMembers } from "@chbrain/khai-arch";
import { composeInstructions, systemBullets } from "./compose.mjs";
import { stripFrontmatter } from "./aggregator.mjs";
import { zip } from "./zip.mjs";

const require = createRequire(import.meta.url);

/** The play's required H2 sequence (the ENACTS chapters, gated exactly). */
const H2_GATE = ["Estate", "Name", "Arc", "Company", "Triggers", "Stakes"];

// U+2013 (en dash) / U+2014 (em dash). House Rules bans both from prose.
const DASH_RE = /[–—]/;

// Every relative .md link a khai member makes: excludes http(s) and #anchors
// as targets, and captures an optional #anchor suffix separately so a rewrite
// can carry it through. Mirrors the reference implementation's LINK pattern.
const LINK_RE = /\]\((?!https?:\/\/|#)([^)#\s]+?\.md)(#[^)]*)?\)/g;

const readIfPresent = (path) => (path && existsSync(path) ? readFileSync(path, "utf8") : null);

/** The body of a markdown file between a `## <heading>` line and the next
 * `## ` (or EOF). Line-based, mirroring compose.mjs's systemBullets slicing so
 * chapter text is read the same way everywhere in khai-tour. */
function sectionBody(content, heading) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^## /.test(l));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n");
}

/** Every relative .md link target found in `text`, reduced to its basename
 * plus the qualifier the author left on the link, deduped by basename, in
 * order of first appearance. A qualifier disambiguates a library collision:
 * `denmark/position_janteloven.md` names the lending item; a scoped package
 * (`@chbrain/khai-engine-x/process_y.md`) names the lending engine in the
 * composite convention. `..` and `.` hops are dropped, never kept as
 * qualifiers: they locate, a qualifier identifies. Two different qualifiers
 * on one basename are both kept so resolve can reject the contradiction.
 * @returns {Map<string, Set<string>>} basename -> the qualifiers seen (may be empty)
 */
function mdLinkTargets(text) {
  const out = new Map();
  for (const m of text.matchAll(LINK_RE)) {
    const segments = m[1].split("/").filter((s) => s !== "." && s !== "..");
    const base = segments.pop();
    const qualifier = segments[0]?.startsWith("@")
      ? segments.slice(0, 2).join("/")
      : segments.pop();
    if (!out.has(base)) out.set(base, new Set());
    if (qualifier) out.get(base).add(qualifier);
  }
  return out;
}

/** The H2 sequence of a markdown file, in order, as written. */
function h2Sequence(content) {
  return [...content.matchAll(/^## (.+?)\s*$/gm)].map((m) => m[1]);
}

/** The first `node_modules/@chbrain` scope directory on the resolution path
 * for @chbrain/khai-engine-spine, or null if none carries one. */
function defaultScopeDir() {
  const candidates = require.resolve.paths("@chbrain/khai-engine-spine") ?? [];
  for (const dir of candidates) {
    const scope = join(dir, "@chbrain");
    if (existsSync(scope)) return scope;
  }
  return null;
}

/**
 * Discover installed khai engine packages (@chbrain/khai-engine-*) under a
 * node_modules/@chbrain scope, reading each one's declarative `khai` manifest
 * (package.json's `khai` block) via @chbrain/khai-arch's `engineMembers` --
 * the canon's own normalizer, not a re-derivation of the composition tree.
 *
 * `root` lets a caller (or a test) point at a sandboxed install instead of the
 * real monorepo. Default walks `require.resolve.paths` for
 * @chbrain/khai-engine-spine (a hard khai-tour dependency) to find the first
 * node_modules that actually carries an `@chbrain` scope -- `require.resolve`
 * itself is not used for this, since it follows a workspace's symlink to the
 * package's real path (`packages/engines/<name>`), not the node_modules
 * location the scope directory lives at.
 */
export function discoverEngines(root) {
  const scopeDir = root ? join(root, "node_modules", "@chbrain") : defaultScopeDir();
  if (!scopeDir || !existsSync(scopeDir)) return [];
  const out = [];
  for (const name of readdirSync(scopeDir)) {
    if (!name.startsWith("khai-engine-")) continue;
    const dir = join(scopeDir, name);
    const pkgPath = join(dir, "package.json");
    if (!existsSync(pkgPath)) continue;
    let pkg;
    try {
      pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    } catch {
      continue; // a malformed installed package.json is skipped, not fatal
    }
    if (!pkg?.khai?.engine) continue;
    let members;
    try {
      members = engineMembers(pkg.khai);
    } catch {
      continue; // a manifest khai-arch itself rejects cannot be widened by
    }
    out.push({ name: pkg.name ?? name, dir, repository: pkg.repository, members });
  }
  return out;
}

/** The ancestor chain (root first, ending at `base`) for a member basename
 * inside one engine's composition tree. Structural: derived from `parent`,
 * never by following the members' own links. */
function ancestorChain(engine, base) {
  const byFile = new Map(engine.members.map((m) => [m.file, m]));
  let cur = engine.members.find((m) => m.file.split("/").pop() === base);
  const chain = [];
  while (cur) {
    chain.unshift(cur.file);
    cur = cur.parent ? byFile.get(cur.parent) : null;
  }
  return chain;
}

/** The absolute GitHub blob URL for one of an engine's own member files,
 * derived from the engine package's own `repository` field (never a
 * hardcoded per-engine constant): `url` (git+... .git stripped) + `/blob/main`
 * + `directory`. Returns null when the installed engine carries no
 * repository info to derive it from. */
function engineHomeUrl(engine) {
  const repo = engine.repository;
  if (!repo || typeof repo.url !== "string") return null;
  const base = repo.url.replace(/^git\+/, "").replace(/\.git$/, "");
  const dir = repo.directory ? `/${repo.directory}` : "";
  return `${base}/blob/main${dir}`;
}

/**
 * The house's content collections: every registry.json entry names a
 * directory, `<arrayKey>/<entry.id>/` (e.g. a khai-cultures registry's
 * `cultures` array, entry `id: "denmark"`, names `cultures/denmark/`). Generic
 * over the array's key so this reads any khai plays house (cultures, plays,
 * ...), not just khai-cultures; an entry whose directory does not exist on
 * disk (a `groups`-style cross-reference with no content of its own) is
 * skipped rather than offered as a source.
 */
export function loadHouseCollections(houseDir) {
  if (!houseDir) return [];
  const registryPath = join(houseDir, "registry.json");
  if (!existsSync(registryPath)) {
    throw new Error(`loadHouseCollections: "${houseDir}" has no registry.json`);
  }
  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  const collections = [];
  for (const [key, value] of Object.entries(registry)) {
    if (!Array.isArray(value)) continue;
    for (const entry of value) {
      if (!entry || typeof entry.id !== "string") continue;
      const dir = join(houseDir, key, entry.id);
      if (existsSync(dir)) collections.push({ key, id: entry.id, dir });
    }
  }
  return collections;
}

/**
 * Resolve one member name against, in order: (a) the scenario folder,
 * (b) the house's content collections, (c) installed engine packages.
 * Exported (alongside `loadHouseCollections` and `discoverEngines`) so the
 * four verdicts and the collision message are directly unit-testable without
 * running the whole assemble pipeline.
 *
 * @returns {{verdict:"build",path:string}
 *   |{verdict:"borrow",path:string,house?:{key,id,dir},engine?:object}
 *   |{verdict:"fail"}
 *   |{verdict:"collision",candidates:string[]}}
 */
export function resolveScenarioName(name, { scenarioDir, houseCollections, engines, qualifier }) {
  const scenarioPath = join(scenarioDir, name);
  if (existsSync(scenarioPath)) return { verdict: "build", path: scenarioPath };

  let houseMatches = houseCollections.filter((c) => existsSync(join(c.dir, name)));
  let engineMatches = engines
    .map((engine) => ({
      engine,
      member: engine.members.find((m) => m.file.split("/").pop() === name),
    }))
    .filter((r) => r.member);

  // A qualifier narrows the field to the named lender before any verdict: the
  // item (`denmark`), the collection-qualified item (`cultures/denmark`), or
  // the engine package in the composite convention. A qualifier that matches
  // no lender holding the name falls through to the ordinary verdicts on an
  // empty field, i.e. "fail": naming the wrong lender is not a borrow.
  if (qualifier) {
    houseMatches = houseMatches.filter(
      (c) => c.id === qualifier || `${c.key}/${c.id}` === qualifier,
    );
    engineMatches = engineMatches.filter((r) => r.engine.name === qualifier);
  }

  if (houseMatches.length === 1) {
    const house = houseMatches[0];
    return { verdict: "borrow", path: join(house.dir, name), house };
  }
  if (houseMatches.length > 1) {
    return { verdict: "collision", candidates: houseMatches.map((c) => `${c.key}/${c.id}`) };
  }

  if (engineMatches.length === 1) {
    const { engine } = engineMatches[0];
    return { verdict: "borrow", path: join(engine.dir, name), engine };
  }
  if (engineMatches.length > 1) {
    return { verdict: "collision", candidates: engineMatches.map((r) => r.engine.name) };
  }

  return { verdict: "fail" };
}

/**
 * Assemble one scenario's bundle entries. Pure: reads the scenario folder,
 * the house (if given) and installed engines; throws a single aggregated
 * error if the gate rejects the result; otherwise returns entries + warnings
 * for the caller to pack (see `packScenario`) or inspect (tests).
 *
 * @param {object} config
 * @param {string} config.scenarioDir - the authored scenario working folder
 * @param {string} [config.houseDir] - a house checkout to borrow from
 * @param {string} [config.homeUrl] - GitHub blob-root prefix for the house
 *   (e.g. "https://github.com/ChBrain/khai-cultures/blob/main"); required
 *   whenever a borrowed file's link points outside the bundle
 * @param {string[]} [config.adaption=[]] - Adaption bullets at System
 * @param {string[]} [config.engines=[]] - engine-law bullets at Knowledge
 *   (prose, composeInstructions' `engines` option -- distinct from the
 *   installed engine *packages* widening pulls members from)
 * @param {string} [config.root] - node_modules resolution root for
 *   discovering installed engine packages (defaults to wherever
 *   @chbrain/khai-engine-spine itself resolves from)
 * @returns {{entries:{path:string,role:string,content:string}[], warnings:string[]}}
 */
export function buildScenarioBundle({
  scenarioDir,
  houseDir = null,
  homeUrl = null,
  adaption = [],
  engines = [],
  root = null,
} = {}) {
  if (!scenarioDir) throw new Error("buildScenarioBundle: `scenarioDir` is required");

  const warnings = [];
  const errors = [];

  // The one play file.
  const playCandidates = readdirSync(scenarioDir).filter((f) => /^play_.*\.md$/.test(f));
  if (playCandidates.length !== 1) {
    throw new Error(
      `buildScenarioBundle: expected exactly one play_*.md in "${scenarioDir}", found ` +
        `${playCandidates.length}${playCandidates.length ? ` (${playCandidates.join(", ")})` : ""}`,
    );
  }
  const playFile = playCandidates[0];
  const playContent = readFileSync(join(scenarioDir, playFile), "utf8");

  // Gate: the H2 sequence (checked here, thrown with the rest at the end).
  const headings = h2Sequence(playContent);
  const sequenceOk =
    headings.length === H2_GATE.length && headings.every((h, i) => h === H2_GATE[i]);
  if (!sequenceOk) {
    errors.push(
      `${playFile}: H2 sequence is [${headings.join(", ")}], expected [${H2_GATE.join(", ")}]`,
    );
  }

  // Station 1: parse the Company, the plots Triggers links, plus the play file.
  const companyBody = sectionBody(playContent, "Company") ?? "";
  const triggersBody = sectionBody(playContent, "Triggers") ?? "";
  const names = new Map([[playFile, new Set()]]);
  for (const source of [companyBody, triggersBody]) {
    for (const [base, qualifiers] of mdLinkTargets(source)) {
      if (!names.has(base)) names.set(base, new Set());
      for (const q of qualifiers) names.get(base).add(q);
    }
  }

  // Station 2: resolve each name against the scenario folder, the house, the
  // installed engines. A name qualified two different ways in one play is a
  // contradiction the author must settle, not a resolution to arbitrate.
  const houseCollections = loadHouseCollections(houseDir);
  const installedEngines = discoverEngines(root);

  const resolutions = new Map();
  for (const [name, qualifiers] of names) {
    if (qualifiers.size > 1) {
      errors.push(
        `${name}: qualified two ways (${[...qualifiers].sort().join(", ")}) -- settle the play on one lender`,
      );
      continue;
    }
    const [qualifier] = qualifiers;
    resolutions.set(
      name,
      resolveScenarioName(name, {
        scenarioDir,
        houseCollections,
        engines: installedEngines,
        qualifier,
      }),
    );
  }

  /** @type {Map<string,{content:string,collectionKey:?string,cultureId:?string}>} */
  const fileSet = new Map();
  for (const [name, r] of resolutions) {
    if (r.verdict === "fail") {
      errors.push(`${name}: not found in the scenario folder, the house, or an installed engine`);
      continue;
    }
    if (r.verdict === "collision") {
      errors.push(
        `${name}: collision (${r.candidates.join(", ")}) -- not guessed; qualify the link with its lender`,
      );
      continue;
    }
    fileSet.set(name, {
      content: readFileSync(r.path, "utf8"),
      collectionKey: r.house?.key ?? null,
      cultureId: r.house?.id ?? null,
    });
  }

  // Station 3: widen by the engine ladder. One hop past the Company: scan
  // every already-resolved file's links for a name an installed engine
  // claims, and pull in that member's whole ancestor chain -- structurally,
  // not by scanning the newly pulled files' own links a second time (the
  // transitive closure is cut here; anything further points home in station 5).
  const engineOwner = new Map(); // member basename -> the engine that claims it
  for (const engine of installedEngines) {
    for (const m of engine.members) engineOwner.set(m.file.split("/").pop(), engine);
  }
  const widened = new Set();
  for (const { content } of fileSet.values()) {
    for (const base of mdLinkTargets(content).keys()) {
      if (fileSet.has(base) || widened.has(base)) continue;
      const engine = engineOwner.get(base);
      if (!engine) continue;
      for (const file of ancestorChain(engine, base)) {
        if (!fileSet.has(file)) widened.add(file);
      }
    }
  }
  for (const file of widened) {
    const engine = engineOwner.get(file);
    fileSet.set(file, {
      content: readFileSync(join(engine.dir, file), "utf8"),
      collectionKey: null,
      cultureId: null,
    });
  }

  const inBundle = new Set(fileSet.keys());

  // Station 5: rewrite links inside every bundled file. In-bundle -> bare
  // basename. An engine member never bundled -> that engine's own GitHub URL.
  // Anything else relative -> the house's GitHub URL, resolved either against
  // the file's own source collection (a bare link) or the collection a
  // "../<id>/" link names explicitly.
  for (const [name, entry] of fileSet) {
    entry.content = entry.content.replace(LINK_RE, (whole, target, anchorRaw) => {
      const anchor = anchorRaw ?? "";
      const base = target.split("/").pop();
      if (inBundle.has(base)) return `](${base}${anchor})`;

      const engine = engineOwner.get(base);
      if (engine) {
        const url = engineHomeUrl(engine);
        if (url) return `](${url}/${base}${anchor})`;
        warnings.push(
          `${name}: cannot point "${base}" home -- engine "${engine.name}" has no repository info`,
        );
        return whole;
      }

      let collectionKey = entry.collectionKey;
      let cultureId = entry.cultureId;
      if (target.startsWith("../")) {
        cultureId = target.split("/")[1];
      }
      if (!homeUrl || collectionKey == null || cultureId == null) {
        warnings.push(`${name}: cannot point "${target}" home (no house context for it)`);
        return whole;
      }
      return `](${homeUrl}/${collectionKey}/${cultureId}/${base}${anchor})`;
    });
  }

  // Station 4: compose the deployed instructions -- Prose Standard from
  // spine, spine's own house rules, spine's scenario adaption (the directorial
  // minimum every guest production carries; spine owns those words, not the
  // caller), then the caller's extra adaption and engine bullets.
  const instructionsContent = composeInstructions(spineInstructions, {
    houseRules: systemBullets(spineHouseRulesFragment),
    adaption: [...systemBullets(spineAdaptions.scenario ?? ""), ...adaption],
    engines,
  });

  // Root files: README.md + REFERENCES.md are always the scenario's own
  // (they describe this scenario specifically); LICENSE falls back to the
  // house's when the scenario carries none of its own.
  const readme = readIfPresent(join(scenarioDir, "README.md"));
  if (readme === null)
    warnings.push("README.md: not found in the scenario folder; omitted from the bundle");
  const references = readIfPresent(join(scenarioDir, "REFERENCES.md"));
  if (references === null)
    warnings.push("REFERENCES.md: not found in the scenario folder; omitted from the bundle");
  const licenseContent =
    readIfPresent(join(scenarioDir, "LICENSE")) ??
    (houseDir ? readIfPresent(join(houseDir, "LICENSE")) : null);
  if (licenseContent === null)
    warnings.push("LICENSE: not found in the scenario folder or houseDir; omitted from the bundle");

  // Station 7 (frontmatter half): strip every consumable md. Station 7's zip
  // half is packScenario's job -- this function stays pure/IO-free.
  const entries = [{ path: "instructions.md", role: "instructions", content: instructionsContent }];
  if (readme !== null)
    entries.push({ path: "README.md", role: "readme", content: stripFrontmatter(readme) });
  if (references !== null)
    entries.push({
      path: "REFERENCES.md",
      role: "references",
      content: stripFrontmatter(references),
    });
  if (licenseContent !== null)
    entries.push({ path: "LICENSE", role: "license", content: licenseContent });
  for (const name of [...fileSet.keys()].sort()) {
    entries.push({
      path: name,
      role: "member",
      content: stripFrontmatter(fileSet.get(name).content),
    });
  }

  // Station 6 (the rest of the gate): no em/en dash in any bundled md.
  for (const entry of entries) {
    if (entry.path.endsWith(".md") && DASH_RE.test(entry.content)) {
      errors.push(`${entry.path}: contains an em-dash or en-dash`);
    }
  }

  if (errors.length) {
    throw new Error(`buildScenarioBundle: gate failed:\n- ${errors.join("\n- ")}`);
  }

  return { entries, warnings };
}

/**
 * Pack one scenario to a flat ZIP: the thin I-O wrapper over
 * `buildScenarioBundle` (mkdir + write, no directories inside the archive).
 *
 * @param {object} config - same shape as `buildScenarioBundle`, plus:
 * @param {string} config.outputDir - directory the zip is written into
 * @returns {{outputPath:string, entries:{path:string,role:string}[], warnings:string[]}}
 */
export function packScenario({ scenarioDir, outputDir, ...rest } = {}) {
  if (!outputDir) throw new Error("packScenario: `outputDir` is required");
  const bundle = buildScenarioBundle({ scenarioDir, ...rest });
  mkdirSync(outputDir, { recursive: true });
  const name = basename(scenarioDir.replace(/[\\/]+$/, "")) || "scenario";
  const outputPath = join(outputDir, `${name}.zip`);
  writeFileSync(outputPath, zip(bundle.entries.map((e) => ({ name: e.path, data: e.content }))));
  return {
    outputPath,
    entries: bundle.entries.map(({ path, role }) => ({ path, role })),
    warnings: bundle.warnings,
  };
}
