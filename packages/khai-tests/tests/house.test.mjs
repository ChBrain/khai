// The one resolver every wall in src/house.mjs goes through, held to both
// layouts a collection house can take, plus the walls themselves.
//
// The workspace case is proven against a tree built here rather than against
// this workspace's own packages/, because no khai-tests fixture wants to carry
// a whole migrated house. The point of resolveHouse is the same either way: it
// is keyed on what a manifest declares, never on a directory name, so a
// resolver reading the wrong thing certifies an empty house rather than failing
// loudly -- see house.mjs's own header for why that is the class this closes.

import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveHouse,
  unitsOf,
  emptyUnitDirs,
  touchedUnits,
  authoredFiles,
  defaultRelink,
  isolationErrors,
  loadIsolationPolicy,
  filenameErrors,
  ratchet,
} from "../src/house.mjs";

const tmps = [];
function tmpDir(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tmps.push(dir);
  return dir;
}
afterEach(() => {
  while (tmps.length) rmSync(tmps.pop(), { recursive: true, force: true });
});

function writeJson(path, data) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2));
}

/** A flat house: root package.json declares khai.collection, content sits under it. */
function flatHouse({ units = ["alpha"] } = {}) {
  const root = tmpDir("khai-house-flat-");
  writeJson(join(root, "package.json"), {
    name: "@chbrain/some-house",
    khai: { collection: { dir: "plays", key: "plays", anchor: "play_" } },
  });
  for (const id of units) {
    mkdirSync(join(root, "plays", id), { recursive: true });
    writeFileSync(join(root, "plays", id, `play_${id}.md`), "---\nkhai: play\n---\n");
  }
  return root;
}

/** A workspace house: a packages/<house> manifest declares the collection, and
 * production packages stand beside it. */
function workspaceHouse({ monolith = ["alpha"], migrated = ["beta"], houseDir = "house" } = {}) {
  const root = tmpDir("khai-house-ws-");
  writeJson(join(root, "package.json"), {
    name: "@chbrain/some-house-workspace",
    private: true,
    workspaces: ["packages/*"],
  });
  writeJson(join(root, "packages", houseDir, "package.json"), {
    name: "@chbrain/some-house",
    khai: { collection: { dir: "plays", key: "plays", anchor: "play_" } },
  });
  for (const id of monolith) {
    const dir = join(root, "packages", houseDir, "plays", id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `play_${id}.md`), "---\nkhai: play\n---\n");
  }
  for (const id of migrated) {
    const dir = join(root, "packages", `some-house-${id}`);
    mkdirSync(dir, { recursive: true });
    writeJson(join(dir, "package.json"), {
      name: `@chbrain/some-house-${id}`,
      khai: { class: "house", production: id, anchor: `play_${id}.md` },
    });
    writeFileSync(join(dir, `play_${id}.md`), "---\nkhai: play\n---\n");
  }
  return root;
}

describe("resolveHouse: keyed on what a manifest declares, in either layout", () => {
  it("resolves the root itself when the root's own manifest declares the collection", () => {
    const root = flatHouse();
    const house = resolveHouse(root);
    expect(house.packageDir).toBe(root);
    expect(house.name).toBe("@chbrain/some-house");
    expect(house.collection).toEqual({ dir: "plays", key: "plays", anchor: "play_" });
    expect(house.contentDir).toBe(join(root, "plays"));
    expect(house.productions).toEqual([]);
  });

  it("resolves the historical no-config house from the default collection dir alone", () => {
    const root = tmpDir("khai-house-default-");
    mkdirSync(join(root, "plays", "alpha"), { recursive: true });
    const house = resolveHouse(root);
    expect(house.packageDir).toBe(root);
    expect(house.collection).toEqual({ dir: "plays", key: "plays", anchor: "play_" });
  });

  it("resolves packages/<house> once the house takes the workspace shape, and finds its productions", () => {
    const root = workspaceHouse({ monolith: ["alpha", "gamma"], migrated: ["beta"] });
    const house = resolveHouse(root);
    expect(house.packageDir).toBe(join(root, "packages", "house"));
    expect(house.name).toBe("@chbrain/some-house");
    expect(house.contentDir).toBe(join(root, "packages", "house", "plays"));
    expect(house.productions).toEqual([
      {
        id: "beta",
        name: "@chbrain/some-house-beta",
        dir: join(root, "packages", "some-house-beta"),
        pkg: expect.any(Object),
      },
    ]);
  });

  it("follows the name and not the directory, so a rename or an odd dir name is still found", () => {
    const root = workspaceHouse({ houseDir: "not-the-obvious-name", monolith: [], migrated: [] });
    const house = resolveHouse(root);
    expect(house.packageDir).toBe(join(root, "packages", "not-the-obvious-name"));
  });

  it("throws rather than falling back when nothing declares a house", () => {
    const root = tmpDir("khai-house-empty-");
    writeJson(join(root, "package.json"), { name: "@chbrain/not-a-house" });
    expect(() => resolveHouse(root)).toThrow(/no manifest under/);
  });

  it("throws on more than one manifest declaring khai.collection, rather than guessing", () => {
    const root = workspaceHouse();
    writeJson(join(root, "packages", "second", "package.json"), {
      name: "@chbrain/second-house",
      khai: { collection: "plays" },
    });
    expect(() => resolveHouse(root)).toThrow(/more than one manifest/);
  });

  it("picks one of several declarers by { name }, rather than staying ambiguous", () => {
    // The shape khai-cultures ships today: its tongues package declares its
    // OWN khai.collection ("tongues", unrelated to the culture units) right
    // beside the house's own. A bare resolveHouse(root) cannot break that tie
    // and must not guess; { name } is how a caller who knows which package it
    // means says so.
    const root = workspaceHouse();
    writeJson(join(root, "packages", "tongues", "package.json"), {
      name: "@chbrain/some-house-tongues",
      khai: { collection: { dir: ".", key: "tongues", anchor: "position_language_" } },
    });
    expect(() => resolveHouse(root)).toThrow(/more than one manifest/);
    const house = resolveHouse(root, { name: "@chbrain/some-house" });
    expect(house.packageDir).toBe(join(root, "packages", "house"));
    const tongues = resolveHouse(root, { name: "@chbrain/some-house-tongues" });
    expect(tongues.packageDir).toBe(join(root, "packages", "tongues"));
  });
});

describe("unitsOf: content-dir units plus each production", () => {
  it("combines both homes and sorts by id", () => {
    const root = workspaceHouse({ monolith: ["gamma", "alpha"], migrated: ["beta"] });
    const house = resolveHouse(root);
    expect(unitsOf(house).map((u) => u.id)).toEqual(["alpha", "beta", "gamma"]);
  });

  it("throws when a unit is in two places at once, both carrying an anchor", () => {
    const root = workspaceHouse({ monolith: ["delta"], migrated: [] });
    mkdirSync(join(root, "packages", "some-house-delta"), { recursive: true });
    writeJson(join(root, "packages", "some-house-delta", "package.json"), {
      name: "@chbrain/some-house-delta",
      khai: { class: "house", production: "delta" },
    });
    const house = resolveHouse(root);
    expect(() => unitsOf(house)).toThrow(/two places at once/);
  });

  it("resolves to one unit when a migration's git mv leaves the old dir behind, empty", () => {
    // git tracks no empty directories, but the filesystem does: `git mv` moved
    // `epsilon`'s anchor file into its own production package and the source
    // directory it came from was never pruned. The leftover carries no anchor
    // file at all, so it is not a second copy of the unit -- it is nothing.
    const root = workspaceHouse({ monolith: ["epsilon"], migrated: [] });
    const leftover = join(root, "packages", "house", "plays", "epsilon");
    rmSync(join(leftover, "play_epsilon.md"));
    writeJson(join(root, "packages", "some-house-epsilon", "package.json"), {
      name: "@chbrain/some-house-epsilon",
      khai: { class: "house", production: "epsilon" },
    });
    writeFileSync(
      join(root, "packages", "some-house-epsilon", "play_epsilon.md"),
      "---\nkhai: play\n---\n",
    );
    const house = resolveHouse(root);
    const units = unitsOf(house);
    expect(units.map((u) => u.id)).toEqual(["epsilon"]);
    expect(units[0].dir).toBe(join(root, "packages", "some-house-epsilon"));
  });

  it("reports a unit's own leftover, empty directory only through the explicit call", () => {
    const root = workspaceHouse({ monolith: ["epsilon"], migrated: [] });
    const leftover = join(root, "packages", "house", "plays", "epsilon");
    rmSync(join(leftover, "play_epsilon.md"));
    writeJson(join(root, "packages", "some-house-epsilon", "package.json"), {
      name: "@chbrain/some-house-epsilon",
      khai: { class: "house", production: "epsilon" },
    });
    writeFileSync(
      join(root, "packages", "some-house-epsilon", "play_epsilon.md"),
      "---\nkhai: play\n---\n",
    );
    const house = resolveHouse(root);
    expect(unitsOf(house).map((u) => u.id)).toEqual(["epsilon"]);
    expect(emptyUnitDirs(house)).toEqual([{ id: "epsilon", dir: leftover }]);
  });
});

// Real commits, because the interesting half of the relink rule (one word of
// prose is NOT a relink) needs an actual diff, and no fixture can fake one.
//
// GIT_DIR / GIT_WORK_TREE / GIT_INDEX_FILE are stripped from every call: a
// suite run from a git hook (the pre-push hook this kit's own gates run under)
// inherits those from the repository the hook fired in, and git honours the
// environment over `cwd` -- every "init" and "commit" below would silently
// operate on the real repo's index instead of the scratch one built here.
const SCRATCH_GIT_ENV = { ...process.env };
delete SCRATCH_GIT_ENV.GIT_DIR;
delete SCRATCH_GIT_ENV.GIT_WORK_TREE;
delete SCRATCH_GIT_ENV.GIT_INDEX_FILE;
function git(repo, ...args) {
  return execFileSync("git", args, { cwd: repo, encoding: "utf8", env: SCRATCH_GIT_ENV });
}
function initRepo(repo) {
  git(repo, "init", "-q", "-b", "main");
  git(repo, "config", "user.email", "t@example.com");
  git(repo, "config", "user.name", "t");
}
function commit(repo, msg) {
  git(repo, "add", "-A");
  git(repo, "commit", "-qm", msg);
  return git(repo, "rev-parse", "HEAD").trim();
}

describe("touchedUnits: anti-blindness across both homes", () => {
  it("sees a unit touched under contentDir AND a unit touched as a production, in one range", () => {
    const root = workspaceHouse({ monolith: ["alpha"], migrated: ["beta"] });
    initRepo(root);
    const base = commit(root, "base");

    writeFileSync(
      join(root, "packages", "house", "plays", "alpha", "persona_new.md"),
      "---\nkhai: persona\n---\n\nSomething entirely new.\n",
    );
    writeFileSync(
      join(root, "packages", "some-house-beta", "persona_new.md"),
      "---\nkhai: persona\n---\n\nSomething entirely new too.\n",
    );
    const head = commit(root, "touch both homes");

    const house = resolveHouse(root);
    const touched = touchedUnits(house, { base, head });
    expect(touched.map((u) => u.id)).toEqual(["alpha", "beta"]);
    expect(touched.every((u) => u.authored)).toBe(true);
  });

  it("flags a unit relinkOnly when every change is a link retarget, and authored on one word of prose", () => {
    const root = flatHouse({ units: ["alpha"] });
    initRepo(root);
    const file = join(root, "plays", "alpha", "persona_a.md");
    writeFileSync(
      file,
      "---\nkhai: persona\n---\n\nShe holds [the tongue](../beta/position_language_x.md).\n",
    );
    const base = commit(root, "base");

    writeFileSync(
      file,
      "---\nkhai: persona\n---\n\nShe holds [the tongue](@scope/pkg/position_language_x.md).\n",
    );
    const relinked = commit(root, "relink");

    const house = resolveHouse(root);
    const afterRelink = touchedUnits(house, { base, head: relinked });
    expect(afterRelink).toEqual([
      {
        id: "alpha",
        dir: join(root, "plays", "alpha"),
        authored: false,
        relinkOnly: true,
        files: [{ path: "plays/alpha/persona_a.md", authored: false }],
      },
    ]);

    writeFileSync(
      file,
      "---\nkhai: persona\n---\n\nShe still holds [the tongue](@scope/pkg/position_language_x.md).\n",
    );
    const written = commit(root, "prose");
    const afterProse = touchedUnits(house, { base, head: written });
    expect(afterProse[0].authored).toBe(true);
    expect(afterProse[0].relinkOnly).toBe(false);
  });

  it("does not charge a unit for moving into its own package, packaging included", () => {
    const root = tmpDir("khai-house-moved-");
    mkdirSync(join(root, "packages", "house", "plays", "alpha"), { recursive: true });
    writeJson(join(root, "packages", "house", "package.json"), {
      name: "@chbrain/some-house",
      khai: { collection: { dir: "plays", key: "plays", anchor: "play_" } },
    });
    writeJson(join(root, "package.json"), {
      name: "@chbrain/some-house-workspace",
      private: true,
      workspaces: ["packages/*"],
    });
    const play = "---\nkhai: play\n---\n\nA play with no origin plot at all.\n";
    writeFileSync(join(root, "packages", "house", "plays", "alpha", "play_alpha.md"), play);
    initRepo(root);
    const base = commit(root, "base");

    const to = join(root, "packages", "some-house-alpha");
    mkdirSync(to, { recursive: true });
    git(
      root,
      "mv",
      "packages/house/plays/alpha/play_alpha.md",
      "packages/some-house-alpha/play_alpha.md",
    );
    writeJson(join(to, "package.json"), {
      name: "@chbrain/some-house-alpha",
      khai: { class: "house", production: "alpha", anchor: "play_alpha.md" },
    });
    writeFileSync(join(to, "LICENSE"), "text\n");
    // `git mv` leaves the now-empty source directory on disk (git tracks no
    // empty dirs, but the filesystem does); a real migration removes it too.
    rmSync(join(root, "packages", "house", "plays", "alpha"), { recursive: true, force: true });
    const head = commit(root, "migrate");

    const house = resolveHouse(root);
    const touched = touchedUnits(house, { base, head });
    expect(touched).toEqual([
      { id: "alpha", dir: to, authored: false, relinkOnly: true, files: expect.any(Array) },
    ]);
  });

  it("takes a house's own relink rule in place of the default", () => {
    const root = flatHouse();
    initRepo(root);
    const file = join(root, "plays", "alpha", "persona_a.md");
    writeFileSync(file, "one\n");
    const base = commit(root, "base");
    writeFileSync(file, "two\n");
    const head = commit(root, "change");

    const house = resolveHouse(root);
    const alwaysRelink = () => true;
    const touched = touchedUnits(house, { base, head, isRelink: alwaysRelink });
    expect(touched[0].authored).toBe(false);
    expect(touched[0].relinkOnly).toBe(true);
  });

  it("requires both base and head", () => {
    const root = flatHouse();
    const house = resolveHouse(root);
    expect(() => touchedUnits(house, { base: "HEAD" })).toThrow(/base and head/);
  });
});

describe("authoredFiles: which files a unit's own authored verdict is about", () => {
  it("marks a relinked file and an authored file in the same unit, each on its own", () => {
    const root = flatHouse({ units: ["alpha"] });
    initRepo(root);
    const plot = join(root, "plays", "alpha", "plot_origin.md");
    const persona = join(root, "plays", "alpha", "persona_a.md");
    writeFileSync(
      plot,
      "---\nkhai: plot\n---\n\nSees [a position](../beta/position_language_x.md).\n",
    );
    writeFileSync(persona, "---\nkhai: persona\n---\n\nHolds the old line.\n");
    const base = commit(root, "base");

    // The plot is only relinked: its one change is a link retarget. The
    // persona is authored: real prose changed. Both land in the same unit and
    // in the same commit, exactly the shape a walk-wide relink plus one real
    // edit produces.
    writeFileSync(
      plot,
      "---\nkhai: plot\n---\n\nSees [a position](@scope/pkg/position_language_x.md).\n",
    );
    writeFileSync(persona, "---\nkhai: persona\n---\n\nHolds the new line instead.\n");
    const head = commit(root, "relink the plot, rewrite the persona");

    const house = resolveHouse(root);
    const touched = touchedUnits(house, { base, head });
    expect(touched).toHaveLength(1);
    expect(touched[0].id).toBe("alpha");
    expect(touched[0].authored).toBe(true); // the unit as a whole: the persona carries it
    expect(touched[0].files).toEqual([
      { path: "plays/alpha/persona_a.md", authored: true },
      { path: "plays/alpha/plot_origin.md", authored: false },
    ]);

    // A wall reading only plot files off the unit-level `authored` flag would
    // charge the plot for the persona's edit. authoredFiles answers the
    // file-level question directly: the persona is in it, the plot is not.
    const authored = authoredFiles(house, { base, head });
    expect(authored.get("alpha")).toEqual(["plays/alpha/persona_a.md"]);
    expect(authored.get("alpha")).not.toContain("plays/alpha/plot_origin.md");
  });

  it("carries no entry for a unit that was only relinked", () => {
    const root = flatHouse({ units: ["alpha"] });
    initRepo(root);
    const file = join(root, "plays", "alpha", "persona_a.md");
    writeFileSync(
      file,
      "---\nkhai: persona\n---\n\nShe holds [the tongue](../beta/position_language_x.md).\n",
    );
    const base = commit(root, "base");
    writeFileSync(
      file,
      "---\nkhai: persona\n---\n\nShe holds [the tongue](@scope/pkg/position_language_x.md).\n",
    );
    const head = commit(root, "relink");

    const house = resolveHouse(root);
    const authored = authoredFiles(house, { base, head });
    expect(authored.has("alpha")).toBe(false);
  });
});

describe("defaultRelink: the exported default, callable on its own", () => {
  it("treats packaging files as a relink regardless of content", () => {
    expect(defaultRelink({ from: "x/package.json", to: "x/package.json" }, "a", "b", ".")).toBe(
      true,
    );
  });
  it("is never a relink for an add or a delete", () => {
    expect(defaultRelink({ from: null, to: "x/persona_new.md" }, "a", "b", ".")).toBe(false);
  });
});

describe("isolationErrors: a unit's own links stay inside its own directory", () => {
  function isolatedHouse() {
    const root = flatHouse({ units: ["alpha", "beta"] });
    return root;
  }

  it("is clean when every link stays inside its own unit, however deeply nested", () => {
    const root = isolatedHouse();
    mkdirSync(join(root, "plays", "alpha", "sub"), { recursive: true });
    writeFileSync(
      join(root, "plays", "alpha", "sub", "persona_x.md"),
      "---\nkhai: persona\n---\n\nSees [the play](../play_alpha.md) and [a sibling](../../alpha/play_alpha.md).\n",
    );
    const house = resolveHouse(root);
    expect(isolationErrors(house)).toEqual([]);
  });

  it("flags a link that resolves outside its unit, via path resolution and not a string test", () => {
    const root = isolatedHouse();
    writeFileSync(
      join(root, "plays", "alpha", "persona_x.md"),
      "---\nkhai: persona\n---\n\nLinks [a neighbour](../beta/play_beta.md) directly.\n",
    );
    const house = resolveHouse(root);
    const errors = isolationErrors(house);
    expect(errors).toHaveLength(1);
    expect(errors[0].unit).toBe("alpha");
    expect(errors[0].target).toBe("../beta/play_beta.md");
  });

  it("never flags a package specifier or a URL", () => {
    const root = isolatedHouse();
    writeFileSync(
      join(root, "plays", "alpha", "persona_x.md"),
      "---\nkhai: persona\n---\n\n[a](@scope/pkg/position_x.md) and [b](https://example.com/x).\n",
    );
    const house = resolveHouse(root);
    expect(isolationErrors(house)).toEqual([]);
  });

  it("exempts a crossing link by its target's basename against an allow glob", () => {
    const root = isolatedHouse();
    writeFileSync(
      join(root, "plays", "alpha", "position_culture_x.md"),
      "---\nkhai: position\n---\n\nHolds [the parent](../beta/position_culture_y.md) one way.\n",
    );
    const house = resolveHouse(root);
    expect(isolationErrors(house)).toHaveLength(1);
    expect(isolationErrors(house, { allow: ["position_culture_*.md"] })).toEqual([]);
  });
});

describe("loadIsolationPolicy: declared or not, off khai-guard.config.json", () => {
  it("is undeclared when the config carries no isolationPolicy key", () => {
    const root = tmpDir("khai-isolation-cfg-");
    writeJson(join(root, "khai-guard.config.json"), { workPolicy: {} });
    expect(loadIsolationPolicy(root)).toEqual({ declared: false, allow: [] });
  });

  it("is undeclared when no config file exists at all", () => {
    const root = tmpDir("khai-isolation-nocfg-");
    expect(loadIsolationPolicy(root)).toEqual({ declared: false, allow: [] });
  });

  it("reads a declared allow list, empty or populated", () => {
    const root = tmpDir("khai-isolation-cfg2-");
    writeJson(join(root, "khai-guard.config.json"), {
      isolationPolicy: { allow: ["position_culture_*.md"] },
    });
    expect(loadIsolationPolicy(root)).toEqual({
      declared: true,
      allow: ["position_culture_*.md"],
    });
  });
});

describe("filenameErrors: any path component under a unit, non-ASCII", () => {
  it("is clean for pure ASCII names in both a content unit and a production", () => {
    const root = workspaceHouse({ monolith: ["alpha"], migrated: ["beta"] });
    const house = resolveHouse(root);
    expect(filenameErrors(house)).toEqual([]);
  });

  it("flags a non-ASCII directory name, and a non-ASCII file within it", () => {
    const root = flatHouse({ units: ["alpha"] });
    mkdirSync(join(root, "plays", "café"), { recursive: true });
    writeFileSync(join(root, "plays", "café", "play_x.md"), "---\nkhai: play\n---\n");
    writeFileSync(join(root, "plays", "alpha", "persona_élodie.md"), "---\nkhai: persona\n---\n");
    const house = resolveHouse(root);
    const findings = filenameErrors(house);
    expect(findings.some((f) => f.unit === "café")).toBe(true);
    expect(findings.some((f) => f.unit === "alpha" && f.file.includes("élodie"))).toBe(true);
  });

  it("flags a non-ASCII name inside a production package", () => {
    const root = workspaceHouse({ monolith: [], migrated: ["beta"] });
    writeFileSync(
      join(root, "packages", "some-house-beta", "persona_rené.md"),
      "---\nkhai: persona\n---\n",
    );
    const house = resolveHouse(root);
    expect(filenameErrors(house).some((f) => f.unit === "beta")).toBe(true);
  });
});

describe("ratchet: findings.length <= baseline, and nothing else", () => {
  it("is ok at or under the baseline", () => {
    expect(ratchet({ name: "x", findings: [1, 2], baseline: 2 })).toEqual({
      ok: true,
      message: expect.stringContaining("2 finding(s), baseline 2"),
    });
    expect(ratchet({ name: "x", findings: [], baseline: 0 }).ok).toBe(true);
  });

  it("fails over the baseline, and says how many are new", () => {
    const result = ratchet({ name: "x", findings: [1, 2, 3], baseline: 1 });
    expect(result.ok).toBe(false);
    expect(result.message).toContain("3 finding(s) exceeds baseline 1");
    expect(result.message).toContain("2 new");
  });
});

// The CLI is a thin caller over the library above; this is the one seam that
// proves the wiring itself (flag parsing, exit codes, the declared/undeclared
// isolation gate) rather than the functions it calls.
const CLI = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "cli.mjs");
function runCli(args, { expectFailure = false } = {}) {
  try {
    const stdout = execFileSync("node", [CLI, ...args], { encoding: "utf8" });
    if (expectFailure) throw new Error("expected khai-tests house check to exit non-zero");
    return { code: 0, stdout };
  } catch (err) {
    if (!expectFailure && err.status !== 0) throw err;
    return { code: err.status, stdout: err.stdout, stderr: err.stderr };
  }
}

describe("house check (CLI): the wiring around the library", () => {
  it("prints the resolved house and exits 0 when isolation is undeclared and filenames are clean", () => {
    const root = flatHouse();
    const { code, stdout } = runCli(["house", "check", root]);
    expect(code).toBe(0);
    expect(stdout).toContain("collection: plays");
    expect(stdout).toContain("isolation: not declared");
    expect(stdout).toContain("filenames: clean");
  });

  it("exits 1 and reports the escape once isolationPolicy is declared", () => {
    const root = flatHouse({ units: ["alpha", "beta"] });
    writeFileSync(
      join(root, "plays", "alpha", "persona_x.md"),
      "---\nkhai: persona\n---\n\n[out](../beta/play_beta.md)\n",
    );
    writeJson(join(root, "khai-guard.config.json"), { isolationPolicy: { allow: [] } });
    const clean = runCli(["house", "check", root], { expectFailure: true });
    expect(clean.code).toBe(1);
    expect(clean.stderr).toContain("isolation: 1 link(s) escape their unit");

    writeJson(join(root, "khai-guard.config.json"), {
      isolationPolicy: { allow: ["play_*.md"] },
    });
    const allowed = runCli(["house", "check", root]);
    expect(allowed.code).toBe(0);
  });

  it("exits 1 on a non-ASCII filename regardless of isolationPolicy", () => {
    const root = flatHouse();
    writeFileSync(join(root, "plays", "alpha", "persona_café.md"), "---\nkhai: persona\n---\n");
    const { code, stderr } = runCli(["house", "check", root], { expectFailure: true });
    expect(code).toBe(1);
    expect(stderr).toContain("filenames: 1 non-ASCII path component(s)");
  });

  it("fails to resolve, and exits 1, when nothing declares a house", () => {
    const root = tmpDir("khai-house-cli-empty-");
    writeJson(join(root, "package.json"), { name: "@chbrain/not-a-house" });
    const { code, stderr } = runCli(["house", "check", root], { expectFailure: true });
    expect(code).toBe(1);
    expect(stderr).toContain("no manifest under");
  });
});
