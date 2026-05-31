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
} from "./rules.mjs";

const typeIds = Object.keys(types);

/** @typedef {{ file: string, errors: string[] }} FileResult */

/** Validate one content file's text against a type contract + owner expectation. */
export function validateContentFile(text, { type, baseDir, owner, allowed }) {
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
  errors.push(...checkOwner(doc, { expected: owner }));
  if (baseDir) errors.push(...checkLinks(text, baseDir));

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
 * canon, manifest<->filesystem consistency, and a compose() smoke test.
 * @returns {Promise<FileResult[]>}
 */
export async function validateEnginePackage(pkgDir) {
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

  // compose() smoke test
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
