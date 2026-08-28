// What a package promises, held against what it ships.
//
// Dormant until the source lands (tests first, source second). The guard is the
// module's existence rather than a string probe, so the import below is dynamic.
//
// The class: a manifest names content the tarball does not contain. khai-cultures
// met it twice -- a tongues package whose `files: ["*.md"]` reached only the
// package root while all sixty varieties lived below it (5 files of 65, and 236
// links 404ing), and a house whose `files` carried `cultures/**` and no
// `groups/**` (a registry describing nineteen groups, none of them present).
// Different mistakes, one failure: the manifest is the promise, `files` is the
// delivery, and nothing holds them to each other.
//
// khai had one too, invisible for the same reason: `validateEnginePackage`
// requires a Playwright guide with `existsSync` and search-space's `files` named
// its content explicitly and matched no `playwright_instructions.md`, so the
// guide was on disk, passed the validator, and never shipped.
//
// So the answer is asked of npm rather than computed. A second implementation of
// the packing rules is a second thing to get wrong, and it would have agreed with
// all three bugs -- which is not hypothetical here: `publishesContent` reads
// `files` through a three-literal heuristic and is wrong about search-space
// today.

import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "src", "packing.mjs");
const DORMANT = !existsSync(SRC);

let packedFiles, checkPacking;
beforeAll(async () => {
  if (DORMANT) return;
  ({ packedFiles, checkPacking } = await import(SRC));
});

let tmp;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

const GUIDE = `---
khai: instructions
title: "A Guide"
---

# Instructions: A Guide
`;
const MEMBER = `---
khai: place
title: "A Place"
---

# Place: A Place
`;

/** A real npm workspace on disk, because the point is to ask npm. */
function workspace(pkgs) {
  tmp = mkdtempSync(join(tmpdir(), "khai-packing-"));
  writeFileSync(
    join(tmp, "package.json"),
    JSON.stringify({ name: "root", private: true, version: "0.0.0", workspaces: ["packages/*"] }),
  );
  for (const [dir, spec] of Object.entries(pkgs)) {
    const d = join(tmp, "packages", dir);
    mkdirSync(d, { recursive: true });
    writeFileSync(
      join(d, "package.json"),
      JSON.stringify({
        name: spec.name,
        version: "1.0.0",
        type: "module",
        main: "./index.mjs",
        ...(spec.files ? { files: spec.files } : {}),
        khai: { class: "element", members: (spec.members ?? []).map((file) => ({ file })) },
      }),
    );
    writeFileSync(join(d, "index.mjs"), "export const x = 1;\n");
    for (const m of spec.members ?? []) {
      mkdirSync(dirname(join(d, m)), { recursive: true });
      writeFileSync(join(d, m), MEMBER);
    }
    if (spec.guide) writeFileSync(join(d, "playwright_instructions.md"), GUIDE);
  }
  return tmp;
}

describe.skipIf(DORMANT)("packedFiles: what npm says is in the box", () => {
  it("reports each package's packed paths, keyed by package name", () => {
    const root = workspace({
      a: { name: "@scope/a", files: ["index.mjs", "*.md"], members: ["place_one.md"] },
    });
    const packed = packedFiles(root);
    expect(packed.get("@scope/a")).toBeInstanceOf(Set);
    expect(packed.get("@scope/a").has("place_one.md")).toBe(true);
    expect(packed.get("@scope/a").has("package.json")).toBe(true);
  });

  it("packs every workspace in ONE npm invocation", () => {
    // 376 engines and composites at ~1s each is six minutes and would not be run;
    // batched it is one call. The design rests on this, so it is pinned: three
    // packages come back from one ask.
    const root = workspace({
      a: { name: "@scope/a", files: ["index.mjs", "*.md"] },
      b: { name: "@scope/b", files: ["index.mjs", "*.md"] },
      c: { name: "@scope/c", files: ["index.mjs", "*.md"] },
    });
    expect([...packedFiles(root).keys()].sort()).toEqual(["@scope/a", "@scope/b", "@scope/c"]);
  });
});

describe.skipIf(DORMANT)("checkPacking: the promise held against the delivery", () => {
  it("is silent when everything the manifest names is in the box", () => {
    const root = workspace({
      a: {
        name: "@scope/a",
        files: ["index.mjs", "*.md"],
        members: ["place_one.md"],
        guide: true,
      },
    });
    expect(checkPacking(root, packedFiles(root))).toEqual([]);
  });

  it("catches a member the tarball does not contain (the tongues bug)", () => {
    // `*.md` reaches only the package root; the member lives below it.
    const root = workspace({
      a: { name: "@scope/a", files: ["index.mjs", "*.md"], members: ["varieties/place_one.md"] },
    });
    const found = checkPacking(root, packedFiles(root));
    expect(found).toHaveLength(1);
    expect(found[0].package).toBe("@scope/a");
    expect(found[0].missing).toContain("varieties/place_one.md");
  });

  it("catches a Playwright guide on disk that never ships (the khai bug)", () => {
    // search-space's exact shape: content named explicitly, no `*.md`, so the
    // guide matched nothing. `validateEnginePackage` passed it every time.
    const root = workspace({
      a: {
        name: "@scope/a",
        files: ["index.mjs", "place_*.md"],
        members: ["place_one.md"],
        guide: true,
      },
    });
    const found = checkPacking(root, packedFiles(root));
    expect(found).toHaveLength(1);
    expect(found[0].missing).toEqual(["playwright_instructions.md"]);
  });

  it("does not demand a guide from a package that ships none", () => {
    // The rule is "what is there must ship", not "everything must exist" --
    // whether a guide is REQUIRED is validateEnginePackage's question and stays
    // there. Two gates answering one question is how they come to disagree.
    const root = workspace({
      a: { name: "@scope/a", files: ["index.mjs", "*.md"], members: ["place_one.md"] },
    });
    expect(checkPacking(root, packedFiles(root))).toEqual([]);
  });

  it("says nothing about a package npm did not report", () => {
    // An empty or partial map means the pack could not be read, not that every
    // package is hollow. Guessing here would fail every consumer that scopes the
    // ask to a subset.
    const root = workspace({
      a: { name: "@scope/a", files: ["index.mjs"], members: ["place_one.md"] },
    });
    expect(checkPacking(root, new Map())).toEqual([]);
  });

  it("names the package and every missing file, not just the first", () => {
    const root = workspace({
      a: {
        name: "@scope/a",
        files: ["index.mjs"],
        members: ["place_one.md", "place_two.md"],
        guide: true,
      },
    });
    const found = checkPacking(root, packedFiles(root));
    expect(found[0].missing.sort()).toEqual([
      "place_one.md",
      "place_two.md",
      "playwright_instructions.md",
    ]);
  });
});

describe.skipIf(DORMANT)("the khai workspace itself", () => {
  it("ships everything every one of its manifests names", () => {
    // The corpus check, and the reason the batched ask matters: 388 packages in
    // one invocation, about eight seconds.
    const root = join(here, "..", "..", "..");
    const packed = packedFiles(root);
    expect(packed.size).toBeGreaterThan(300);
    expect(checkPacking(root, packed)).toEqual([]);
  });
});
