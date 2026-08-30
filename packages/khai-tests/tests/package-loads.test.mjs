// Every package in this repo must actually load, and compose what it declares.
//
// This exists because a composite shipped to main whose index.mjs imported a
// `buildCompositeLoader` from @chbrain/khai-arch -- an export that does not
// exist. Importing the package threw at module evaluation, so nothing that
// installed it could use it, and it sat on main fully broken with EVERY GATE
// GREEN: npm run gates, the conformance kit, the whole suite.
//
// The reason is structural rather than careless. Nothing imports a composite
// except its own tests, and by rule 3 a build PR ships without tests -- so at
// the exact moment a package is introduced, the one thing that would load it is
// correctly absent. Every wall the repo had inspected the package's FILES;
// none of them ran it.
//
// So this one runs it. It is deliberately shallow -- import, check the manifest
// is the package it claims to be, compose every unit it declares -- because the
// point is not to test the content but to refuse the class of failure where a
// package is shipped that cannot be imported at all.

import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { compositionOrder } from "@chbrain/khai-arch";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const packagesDir = join(repoRoot, "packages");

/** Every engine/composite dir that declares a khai engine and ships an entry point. */
function shipped() {
  const out = [];
  for (const kind of ["engines", "composites"]) {
    const base = join(packagesDir, kind);
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base, { withFileTypes: true })) {
      if (!name.isDirectory()) continue;
      const dir = join(base, name.name);
      const manifestPath = join(dir, "package.json");
      if (!existsSync(manifestPath) || !existsSync(join(dir, "index.mjs"))) continue;
      const pkg = JSON.parse(readFileSync(manifestPath, "utf8"));
      if (pkg?.khai?.engine) out.push({ name: pkg.name, khai: pkg.khai });
    }
  }
  return out;
}

// Three shipping shapes, and a package's shape is DECLARED in its manifest
// rather than guessed from what happens to be exported:
//
//   class "meta"            compose() takes no argument and emits the whole
//                           contract; the ladder is layered elsewhere.
//   manifest.members        compose({ leaf }) over the exported `chains`, which
//                           must be exactly the canon's own leaves.
//   manifest.expressions    compose({ expression }) over the exported
//                           `expressions`, which must be exactly the declared ones.
//
// Deriving the expectation from the manifest, not the exports, is the whole
// point: a loader whose `chains` quietly came back empty would otherwise look
// like a package with nothing to compose, and pass. Here it fails, loudly, on
// the shape its own package.json claims.
function contractOf(khai) {
  if (khai.class === "meta") return { shape: "meta", units: null };
  if (Array.isArray(khai.members))
    return { shape: "chains", units: Object.keys(compositionOrder(khai)) };
  if (khai.expressions) return { shape: "expressions", units: Object.keys(khai.expressions) };
  return { shape: "unknown", units: [] };
}

const packages = shipped();

describe.skipIf(packages.length === 0)("gate: every package loads and composes", () => {
  // Green on an empty list is the failure this whole file is about, so the
  // count is asserted before anything is done with it.
  it("finds the packages on disk", () => {
    expect(packages.length).toBeGreaterThan(100);
  });

  for (const { name, khai } of packages) {
    it(`${name} imports and composes`, async () => {
      // By package name, not by path: that is how a consumer reaches it, and it
      // exercises the workspace link and the exports map at the same time.
      const mod = await import(name);

      expect(mod.manifest?.engine, `${name} exports no manifest`).toBe(khai.engine);
      expect(typeof mod.compose, `${name} exports no compose()`).toBe("function");

      const { shape, units } = contractOf(khai);
      expect(shape, `${name} declares neither members, expressions, nor class meta`).not.toBe(
        "unknown",
      );

      if (shape === "meta") {
        expect(mod.compose().length, `${name} composed empty`).toBeGreaterThan(0);
        return;
      }

      const exported = shape === "chains" ? mod.chains : mod.expressions;
      expect(Object.keys(exported ?? {}).sort(), `${name} exports the wrong ${shape}`).toEqual(
        [...units].sort(),
      );
      expect(units.length, `${name} declares no composable unit`).toBeGreaterThan(0);

      for (const unit of units) {
        const args = shape === "chains" ? { leaf: unit } : { expression: unit };
        expect(mod.compose(args).length, `${name} composed ${unit} empty`).toBeGreaterThan(0);
      }
    });
  }
});
