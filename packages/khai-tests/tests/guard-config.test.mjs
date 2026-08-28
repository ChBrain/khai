// The policy loaders find khai-guard.config.json above the content root.
//
// Dormant until the source lands (tests first, source second). The guard is the
// module's existence, so the import below is dynamic.
//
// The class this closes: a house that takes khai's workspace shape moves its
// content into packages/<house>, and the science tooling's root moves with it --
// but khai-guard.config.json stays at the repository root, because lanes are a
// repository-level fact. `loadWorkPolicy(root)` and `scholarPolicy(root)` read
// `join(root, "khai-guard.config.json")` and return EMPTY policies when it is
// absent, so the moment a house migrates, its canon list, its contrast and
// support vocabulary and its homonym declarations all silently become defaults.
// The misfits house documents this exact failure shape from the other side: "a
// vocabulary declared where nothing reads it is indistinguishable from a
// vocabulary nobody has used."
//
// So the config is resolved the way the kit already resolves installed packages
// in instructions.mjs: walk up from the root until found. Nearest wins, so a
// package that carries its own config keeps it.

import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "src", "guard-config.mjs");
const DORMANT = !existsSync(SRC);

let findGuardConfig, loadWorkPolicy, scholarHomonyms;
beforeAll(async () => {
  if (DORMANT) return;
  ({ findGuardConfig } = await import(SRC));
  ({ loadWorkPolicy } = await import(join(here, "..", "src", "overlap.mjs")));
  ({ scholarHomonyms } = await import(join(here, "..", "src", "science.mjs")));
});

let tmp;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

const CONFIG = {
  workPolicy: { supportingMarkers: ["held as scaffolding"], canon: ["A Canon Work"] },
  scholarPolicy: { homonyms: { Hart: ["Julian Tudor", "Oliver"] } },
};

/** A workspace: config at the top, content root nested beneath it. */
function workspace({ atRoot = true, atPackage = false } = {}) {
  tmp = mkdtempSync(join(tmpdir(), "khai-guard-config-"));
  const pkg = join(tmp, "packages", "house");
  mkdirSync(pkg, { recursive: true });
  if (atRoot) writeFileSync(join(tmp, "khai-guard.config.json"), JSON.stringify(CONFIG));
  if (atPackage) {
    const local = {
      workPolicy: { supportingMarkers: ["the package's own marker"] },
      scholarPolicy: { homonyms: { Local: ["Only"] } },
    };
    writeFileSync(join(pkg, "khai-guard.config.json"), JSON.stringify(local));
  }
  return pkg;
}

describe.skipIf(DORMANT)("findGuardConfig: where the config is", () => {
  it("finds it in the root itself, which is every house today", () => {
    const pkg = workspace({ atRoot: false, atPackage: true });
    expect(findGuardConfig(pkg)).toBe(join(pkg, "khai-guard.config.json"));
  });

  it("finds it above the root, which is a migrated house", () => {
    const pkg = workspace();
    expect(findGuardConfig(pkg)).toBe(join(tmp, "khai-guard.config.json"));
  });

  it("prefers the nearest when both exist", () => {
    const pkg = workspace({ atRoot: true, atPackage: true });
    expect(findGuardConfig(pkg)).toBe(join(pkg, "khai-guard.config.json"));
  });

  it("returns null when no directory up the walk has one", () => {
    const pkg = workspace({ atRoot: false });
    expect(findGuardConfig(pkg)).toBeNull();
  });
});

describe.skipIf(DORMANT)("the loaders, through the walk", () => {
  it("loadWorkPolicy reads a workspace root's policy from a package root", () => {
    // The migration case, through the public loader: the vocabulary must not
    // silently become defaults the day the content moves down a level.
    const pkg = workspace();
    const policy = loadWorkPolicy(pkg);
    expect(policy.supportingMarkers).toContain("held as scaffolding");
    expect(policy.canon).toContain("a canon work");
  });

  it("scholarHomonyms reads the declarations from a package root", () => {
    // The half that fails LOUD when it goes blind (an undeclared surname
    // collates, a declared one left bare fails the wall) -- but loud with the
    // wrong diagnosis: the error would say the declarations are missing, and
    // they are in the config, one directory up, read by nothing.
    const pkg = workspace();
    expect(scholarHomonyms(pkg)).toHaveProperty("Hart");
  });

  it("a package's own config still wins, whole file and not per key", () => {
    // Nearest wins as a FILE: the nearer config's absent keys are absent, not
    // inherited from the one above. Merging two configs would make the
    // effective policy a computation no file shows, and a maintainer reading
    // the nearer file would be reading the wrong policy.
    const pkg = workspace({ atRoot: true, atPackage: true });
    const policy = loadWorkPolicy(pkg);
    expect(policy.supportingMarkers).toContain("the package's own marker");
    expect(policy.supportingMarkers).not.toContain("held as scaffolding");
    expect(scholarHomonyms(pkg)).toEqual({ Local: ["Only"] });
  });

  it("no config anywhere still means the empty policy, not an error", () => {
    const pkg = workspace({ atRoot: false });
    expect(scholarHomonyms(pkg)).toEqual({});
    const policy = loadWorkPolicy(pkg);
    expect(Array.isArray(policy.contrastMarkers)).toBe(true);
  });
});
