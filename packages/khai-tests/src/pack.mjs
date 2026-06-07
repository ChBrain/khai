// The engine kind for the serve engine: package a khai content engine as a
// portable zip in the cultures layout. khai-tests owns this because it owns the
// engine validator — an engine is packaged THROUGH its conformance check, so a
// non-conforming engine is never shipped. The zip carries authored/generated
// overhead at the root and the member files flat under engine/; it carries no
// code, manifest, or tests (those build the engine, they do not serve it).

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import arch from "@chbrain/khai-arch";
import { packBundle } from "@chbrain/khai-pack";
import { validateEnginePackage } from "./validate.mjs";

const require = createRequire(import.meta.url);
const ARCH_VERSION = require("@chbrain/khai-arch/package.json").version;

/** Render the WIRES card (from the manifest) as markdown overhead. */
export function renderCard(card) {
  const head = `# ${card.id} — WIRES\n\n*${card.type ?? "engine"}${
    card.anchor ? ` · anchor: ${card.anchor}` : ""
  }*\n`;
  const body = card.chapters.map((c) => `\n## ${c}\n\n${card.sections[c]}\n`).join("");
  return head + body;
}

/**
 * Package the engine at `pkgDir` into a cultures-layout zip via khai-pack.
 * Returns the packBundle result plus the conformance findings. If the engine
 * does not conform, returns `{ ok: false, errors }` and does not pack.
 *
 * @param {string} pkgDir  the engine package directory
 */
export async function packEngine(pkgDir) {
  const pkgPath = join(pkgDir, "package.json");
  if (!existsSync(pkgPath)) throw new Error(`packEngine: no package.json in ${pkgDir}`);
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (!pkg.khai || !pkg.khai.engine)
    throw new Error(`packEngine: ${pkgDir} is not a khai engine (no khai.engine in package.json)`);

  // Package through the validator: conformance is the gate to ship.
  const results = await validateEnginePackage(pkgDir);
  const errors = results.flatMap((r) => r.errors ?? []);
  const warnings = results.flatMap((r) => r.warnings ?? []);
  if (errors.length > 0)
    return { name: pkg.khai.engine, ok: false, errors, warnings, zip: null, zipSha256: null };

  const manifest = pkg.khai;
  const members = arch.engineMembers(manifest);

  // Overhead at the root: the generated README, the authored REFERENCES, the
  // rendered WIRES card, and a license note derived from the package license.
  const overhead = [
    { path: "README.md", data: arch.renderEngineReadme(pkg) },
    { path: "REFERENCES.md", data: readFileSync(join(pkgDir, "REFERENCES.md"), "utf8") },
    { path: "CARD.md", data: renderCard(arch.engineCard(manifest)) },
    {
      path: "LICENSE",
      data: `${pkg.name} content is licensed under ${pkg.license}.\nSee REFERENCES.md for sources and attribution.\n`,
    },
  ];

  if (existsSync(join(pkgDir, "registry.json"))) {
    overhead.push({
      path: "registry.json",
      data: readFileSync(join(pkgDir, "registry.json"), "utf8"),
    });
  }

  // Content flat under engine/: the member files only.
  const content = {
    dir: "engine",
    files: members.map((m) => ({ path: m.file, data: readFileSync(join(pkgDir, m.file), "utf8") })),
  };

  const packed = packBundle({
    name: manifest.engine,
    overhead,
    content,
    stamp: { kind: "engine", engine: manifest.engine, canon: `@chbrain/khai-arch@${ARCH_VERSION}` },
  });

  return { ...packed, ok: true, errors, warnings: [...packed.warnings, ...warnings] };
}
