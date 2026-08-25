// THIS repository's own docs/SCIENCE.md must equal a fresh build.
//
// science-drift.test.mjs already proves the drift gate works -- on fixtures, in
// a tmpdir, with two invented engines. It has never once looked at khai's own
// index, and neither did anything else: `khai-tests science verify` exists as a
// CLI subcommand but is run by no hook, no ci.yml job, and no test. The result
// was what an unwatched generated file always does. The `disability` engine
// shipped, its rows were never built into the index, and docs/SCIENCE.md sat a
// whole engine out of date -- 374 engines and 1703 scholars against a tree
// holding 375 and 1706 -- until a later PR happened to run the builder for an
// unrelated reason and the diff fell out.
//
// A gate that proves the mechanism is not a gate on the artefact.

import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyScienceIndex, collectScience, SCIENCE_INDEX_PATH } from "../index.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const packagesDir = join(repoRoot, "packages");

// The suite is published, and downstream houses install it without khai's own
// engines tree. There the gate has nothing to hold.
const HAS_TREE =
  existsSync(join(packagesDir, "engines")) && existsSync(join(repoRoot, SCIENCE_INDEX_PATH));

/** Every engine/composite dir whose manifest declares a `khai.type`. */
function typedUnits() {
  const out = [];
  for (const kind of ["engines", "composites"]) {
    const base = join(packagesDir, kind);
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base, { withFileTypes: true })) {
      if (!name.isDirectory()) continue;
      const manifest = join(base, name.name, "package.json");
      if (!existsSync(manifest)) continue;
      const khai = JSON.parse(readFileSync(manifest, "utf8")).khai;
      // No `type` means infra that roots on no cast element (spine lifts the
      // class:meta architecture itself). collectScience skips those by design,
      // so the gate has to skip them the same way or it fails on a rule.
      if (khai?.engine && khai.type) out.push(khai.engine);
    }
  }
  return out.sort();
}

describe.skipIf(!HAS_TREE)("gate: this repo's science index is not stale", () => {
  // Checked first, because an equality gate over an empty collection is green
  // for the wrong reason: a collector that silently returned nothing would
  // render an empty index, match an equally empty committed one, and pass. That
  // is the shape of the failure this whole file exists to prevent, so it does
  // not get to hide inside the gate meant to catch it.
  it("collects every typed unit that is actually on disk", () => {
    const onDisk = typedUnits();
    const collected = collectScience(repoRoot)
      .byEngine.map((e) => e.engine)
      .sort();

    expect(onDisk.length).toBeGreaterThan(0);
    expect(collected).toEqual(onDisk);
  });

  it("matches a fresh build of every Origin table", () => {
    // verifyScienceIndex answers "out of date" and stops -- right for a CLI
    // exit code, thin for somebody reading a failing suite. Naming the first
    // differing line would need `renderForRoot` exported, which is source and
    // belongs in its own PR; the fix is one command either way.
    expect(verifyScienceIndex(repoRoot)).toEqual([]);
  });
});
