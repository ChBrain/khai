// The Playwright instruction collector.
//
// Every khai package that publishes typed content ships a
// `playwright_instructions.md`: a HACKS instance saying how a Playwright wires
// that package into a play. 376 of them exist across the engines and composites
// and the validator has required one since the beginning -- and until now nothing
// read them for the Playwright. The guidance a package wrote about its own wiring
// reached the author only if a model happened to open the file, which is a person
// remembering doing a computer's job.
//
// So this walks the DECLARED dependency closure and returns what it finds. The
// closure is the point: a repository gets the instructions of the packages IT
// installs, never a global list, so a cultures house gets the language engine and
// its tongues and a different house gets its own. Nothing about any domain enters
// khai.
//
// Two layers, because five sections times N packages is a context bomb and the
// Playwright only casts from a few of them:
//
//   `law`      -- one Knowledge bullet a package exports from index.mjs, always
//                 collected, cheap enough to carry for the whole closure.
//   `sections` -- the five HACKS chapters, read on demand.
//
// The order is the dependency depth, computed rather than chosen: a package is
// listed after everything it depends on, so an engine's primitives are read
// before the content package that fills them. That is exactly the relationship
// between the language engine's grip and a tongues package's varieties.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseDoc, sectionBody } from "@chbrain/khai-rules";
import { types } from "@chbrain/khai-arch";

/** The guide's filename IS the contract. It is not declared in the manifest and
 * must not be: `validateEnginePackage` has hard-coded this name and failed a
 * package without one since the convention began, so a `khai.instructions` key
 * would be a second source of truth for a fact the validator already enforces,
 * and the two would drift. `files: ["*.md"]` already carries it into the
 * published tarball. */
export const PLAYWRIGHT_INSTRUCTIONS = "playwright_instructions.md";

/** The HACKS chapters, from the canon rather than typed out here. */
const INSTRUCTION_CHAPTERS = types.instructions?.chapters ?? [
  "Human",
  "Agent",
  "Collaboration",
  "Knowledge",
  "System",
];

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
};

/** Resolve a declared dependency to its installed directory, walking up through
 * node_modules so a workspace-hoisted install resolves like a flat one. The same
 * walk the package-specifier link contract uses -- one notion of "installed". */
function resolveFrom(fromDir, name) {
  let dir = fromDir;
  for (;;) {
    const candidate = join(dir, "node_modules", name);
    if (existsSync(join(candidate, "package.json"))) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * The declared dependency closure of `root`, deepest first.
 *
 * Declared, not scanned: a hoisted workspace puts every package's dependencies in
 * one directory, so a directory scan would hand a package the instructions of
 * things it never asked for. Walking declarations gives each repository exactly
 * its own tree.
 *
 * Depth-first post-order, so a package appears after everything it depends on;
 * a cycle (which npm permits) is broken by the visited set rather than looping.
 */
function closure(root, { includeDev = true } = {}) {
  const order = [];
  const seen = new Set();
  const walk = (dir, name) => {
    const key = dir;
    if (seen.has(key)) return;
    seen.add(key);
    const pkg = readJson(join(dir, "package.json"));
    if (!pkg) return;
    const deps = Object.keys({
      ...(pkg.dependencies ?? {}),
      // devDependencies only at the root: a consumer installs its own dev tools,
      // not its dependencies' -- npm does not install them transitively either.
      ...(includeDev && dir === root ? (pkg.devDependencies ?? {}) : {}),
    });
    for (const dep of deps) {
      const depDir = resolveFrom(dir, dep);
      if (depDir) walk(depDir, dep);
    }
    order.push({ dir, name: name ?? pkg.name, pkg });
  };
  walk(root, null);
  return order;
}

/** Does this package PUBLISH khai typed content? The rule the guide requirement
 * rests on, and the reason tooling is exempt without a carve-out: khai-tests and
 * khai-language each carry a `khai:`-framed design record, but both sit outside
 * `files`, so neither ships. A package that one day publishes content owes a
 * guide from that day, with nothing to remember. */
export function publishesContent(pkgDir) {
  if (!existsSync(pkgDir)) return false;
  let names;
  try {
    names = readdirSync(pkgDir);
  } catch {
    return false;
  }
  const pkg = readJson(join(pkgDir, "package.json")) ?? {};
  const files = Array.isArray(pkg.files) ? pkg.files : null;
  // No `files` field publishes (almost) everything, so the shipped set is the
  // directory itself; with one, a root-level `*.md` glob is what carries content.
  const shipsRootMarkdown =
    files === null || files.some((f) => f === "*.md" || f === "./*.md" || f === ".");
  if (!shipsRootMarkdown) return false;
  for (const name of names) {
    if (!name.endsWith(".md") || name === "CHANGELOG.md") continue;
    if (name === PLAYWRIGHT_INSTRUCTIONS) continue;
    const text = readFileSync(join(pkgDir, name), "utf8");
    if (/^﻿?---\r?\n[\s\S]*?\bkhai:/.test(text)) return true;
  }
  return false;
}

/** Read one guide into its chapters. Returns null when the package ships none. */
function readGuide(pkgDir) {
  const path = join(pkgDir, PLAYWRIGHT_INSTRUCTIONS);
  if (!existsSync(path)) return null;
  const doc = parseDoc(readFileSync(path, "utf8"));
  const sections = {};
  for (const chapter of INSTRUCTION_CHAPTERS) {
    const lines = sectionBody(doc.body, chapter);
    sections[chapter] = lines === null ? null : lines.join("\n").trim();
  }
  return { title: typeof doc.data?.title === "string" ? doc.data.title : null, sections };
}

/** A package's exported `law`: the one Knowledge bullet a deployed instructions
 * contract carries. Read from the manifest's own entry point, so it is computed
 * by the package rather than scraped from its prose. Executing package code is
 * the caller's choice, hence the opt-in -- the default reads nothing. */
async function readLaw(pkgDir, pkg) {
  const entry = pkg.main ?? "./index.mjs";
  const path = join(pkgDir, entry.replace(/^\.\//, ""));
  if (!existsSync(path)) return { law: null, error: null };
  try {
    // pathToFileURL on an ABSOLUTE path. A bare `file://` prefix on a relative
    // one is not a URL: the import throws, and the first draft caught it and
    // returned null -- reporting "this package exports no law" for every package
    // that exports one, in a form indistinguishable from the truth. Hence the
    // error is carried out rather than swallowed.
    const mod = await import(pathToFileURL(resolve(path)).href);
    const law = mod.law ?? mod.default?.law;
    return { law: typeof law === "string" && law.trim() ? law.trim() : null, error: null };
  } catch (err) {
    // A package whose entry point will not import contributes no law, and SAYS
    // so: "no law exported" and "could not read this package" are different
    // facts, and collapsing them is how a collector reports clean on a broken
    // tree.
    return { law: null, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Collect the Playwright instructions of every khai content package installed
 * for `root`.
 *
 * Returns one record per package that ships a guide, deepest dependency first:
 *
 *   { package, version, own, title, law, sections }
 *
 * `own` marks the root's own guide, so the Playwright can tell what this house
 * wrote from what it inherited -- the two carry different authority and merging
 * them would lose that.
 *
 * `sections` is populated only when asked for (`full`, or `only` naming
 * packages). The default carries `law` alone: five chapters times a large
 * closure is a context bomb, and a Playwright reads the chapters of the few
 * packages it actually casts from.
 *
 * `withLaw` executes each package's entry point. Off by default -- the caller
 * decides whether to run dependency code, exactly as `validateEnginePackage`
 * gates its compose() smoke test.
 *
 * @param {string} root
 * @param {{ full?: boolean, only?: string[], withLaw?: boolean, includeDev?: boolean }} [opts]
 * @returns {Promise<{package: string, version: string|null, own: boolean, title: string|null, law: string|null, sections: object|null}[]>}
 */
export async function collectInstructions(root, opts = {}) {
  const { full = false, only = null, withLaw = false, includeDev = true } = opts;
  const wanted = only ? new Set(only) : null;
  const out = [];
  for (const { dir, name, pkg } of closure(root, { includeDev })) {
    const guide = readGuide(dir);
    if (!guide) continue;
    const wantSections = full || (wanted ? wanted.has(name) : false);
    out.push({
      package: name,
      version: typeof pkg.version === "string" ? pkg.version : null,
      own: dir === root,
      title: guide.title,
      ...(withLaw ? await readLaw(dir, pkg) : { law: null, error: null }),
      sections: wantSections ? guide.sections : null,
    });
  }
  return out;
}

/** Render the collection for a terminal (and for a model reading that terminal).
 * Pure: records in, text out. */
export function renderInstructions(records) {
  if (!records.length) {
    return "khai-tests instructions: no installed package ships a Playwright guide.";
  }
  const lines = [
    `khai-tests instructions: ${records.length} package(s) ship a Playwright guide, ` +
      `dependencies first.`,
    "",
  ];
  for (const r of records) {
    const version = r.version ? `@${r.version}` : "";
    lines.push(`## ${r.package}${version}${r.own ? "  (this package)" : ""}`);
    if (r.title) lines.push(`_${r.title}_`);
    if (r.law) lines.push("", `- **Law:** ${r.law}`);
    // A package that could not be read is named, never passed over in silence.
    if (r.error) lines.push("", `- _law unreadable: ${r.error}_`);
    if (r.sections) {
      for (const [chapter, body] of Object.entries(r.sections)) {
        if (!body) continue;
        lines.push("", `### ${chapter}`, "", body);
      }
    }
    lines.push("");
  }
  if (records.every((r) => !r.sections)) {
    lines.push(
      "Only the law line is shown. Pass `--package <name>` for the chapters of the",
      "packages you are casting from, or `--full` for every chapter of every package.",
      "",
    );
  }
  return lines.join("\n");
}
