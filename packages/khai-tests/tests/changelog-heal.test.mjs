import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
// Namespace imports: healChangelogHeading and the changelog gate do not exist
// on main until the source lands, and a missing named import is a load-time
// crash even for a skipped suite.
import * as registry from "../src/registry.mjs";
import * as validate from "../src/validate.mjs";

// Dormant until the changelog-heal source lands on main: probe registry.mjs
// for the helper itself.
const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const DORMANT = !readFileSync(join(srcDir, "registry.mjs"), "utf8").includes(
  "healChangelogHeading",
);

// A minimal one-item house: package.json at a changesets-bumped 0.2.0 while
// the count derives 0.1.0, mirroring the count-moving release the heal exists
// for (khai issue 1040).
function writeHouse(dir) {
  mkdirSync(join(dir, "cultures", "wonderland"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "@chbrain/khai-cultures-demo",
      version: "0.2.0",
      khai: { collection: { dir: "cultures", key: "cultures", anchor: "play_" } },
    }),
  );
  writeFileSync(
    join(dir, "cultures", "wonderland", "play_wonderland.md"),
    `---\nkhai: play\ntitle: "Wonderland"\ndescription: "A single valid sentence about wonderland."\n---\n# Play: Wonderland\n\n## Arc\n\nA rabbit hole.\n`,
  );
}

const CHANGELOG_BUMPED = `# @chbrain/khai-cultures-demo

## 0.2.0

### Minor Changes

- abc1234: Stage wonderland.

## 0.1.1

### Patch Changes

- def5678: Fix a sentence.
`;

describe.skipIf(DORMANT)("healChangelogHeading", () => {
  let dir;

  beforeEach(() => {
    dir = join(tmpdir(), `khai-heal-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(dir, { recursive: true });
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("rewrites the top heading matching the stale version, and nothing else", () => {
    writeFileSync(join(dir, "CHANGELOG.md"), CHANGELOG_BUMPED);
    expect(registry.healChangelogHeading(dir, "0.2.0", "0.1.0")).toBe(true);
    const healed = readFileSync(join(dir, "CHANGELOG.md"), "utf8");
    expect(healed).toContain("## 0.1.0");
    expect(healed).not.toContain("## 0.2.0");
    // the historical patch heading and all body text survive byte for byte
    expect(healed).toContain("## 0.1.1");
    expect(healed).toContain("- abc1234: Stage wonderland.");
    expect(healed).toBe(CHANGELOG_BUMPED.replace("## 0.2.0", "## 0.1.0"));
  });

  it("leaves a top heading that is not the stale version untouched (historical heading)", () => {
    const historical = CHANGELOG_BUMPED.replace("## 0.2.0", "## 0.1.0");
    writeFileSync(join(dir, "CHANGELOG.md"), historical);
    // the between-releases state: manifest healed 0.3.0 -> 0.2.0, but the top
    // heading belongs to the previous release and must not be rewritten.
    expect(registry.healChangelogHeading(dir, "0.3.0", "0.2.0")).toBe(false);
    expect(readFileSync(join(dir, "CHANGELOG.md"), "utf8")).toBe(historical);
  });

  it("tolerates a missing CHANGELOG.md", () => {
    expect(registry.healChangelogHeading(dir, "0.2.0", "0.1.0")).toBe(false);
    expect(existsSync(join(dir, "CHANGELOG.md"))).toBe(false);
  });

  it("no-ops when stale and derived version are equal", () => {
    writeFileSync(join(dir, "CHANGELOG.md"), CHANGELOG_BUMPED);
    expect(registry.healChangelogHeading(dir, "0.2.0", "0.2.0")).toBe(false);
    expect(readFileSync(join(dir, "CHANGELOG.md"), "utf8")).toBe(CHANGELOG_BUMPED);
  });

  it("touches only the topmost heading when the stale number recurs below", () => {
    const doubled = CHANGELOG_BUMPED.replace("## 0.1.1", "## 0.2.0");
    writeFileSync(join(dir, "CHANGELOG.md"), doubled);
    registry.healChangelogHeading(dir, "0.2.0", "0.1.0");
    const healed = readFileSync(join(dir, "CHANGELOG.md"), "utf8");
    expect(healed.indexOf("## 0.1.0")).toBeGreaterThan(-1);
    expect(healed.indexOf("## 0.2.0")).toBeGreaterThan(healed.indexOf("## 0.1.0"));
  });
});

describe.skipIf(DORMANT)("buildRegistry heals the changelog with the manifest", () => {
  let dir;

  beforeEach(() => {
    dir = join(tmpdir(), `khai-heal-build-${process.pid}-${Math.random().toString(36).slice(2)}`);
    writeHouse(dir);
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("reconciles package.json, registry.json, and the top CHANGELOG heading together", () => {
    writeFileSync(join(dir, "CHANGELOG.md"), CHANGELOG_BUMPED);
    registry.buildRegistry(dir);
    expect(JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).version).toBe("0.1.0");
    expect(JSON.parse(readFileSync(join(dir, "registry.json"), "utf8")).version).toBe("0.1.0");
    const changelog = readFileSync(join(dir, "CHANGELOG.md"), "utf8");
    expect(changelog).toContain("## 0.1.0");
    expect(changelog).not.toContain("## 0.2.0");
  });

  it("builds cleanly when the house has no CHANGELOG.md", () => {
    registry.buildRegistry(dir);
    expect(JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).version).toBe("0.1.0");
    expect(existsSync(join(dir, "CHANGELOG.md"))).toBe(false);
  });
});

describe.skipIf(DORMANT)("validate: the top CHANGELOG heading must not exceed the manifest", () => {
  let dir;

  const changelogErrors = () =>
    validate
      .validateCollectionRegistry(dir)
      .flatMap((r) => r.errors)
      .filter((e) => e.includes("CHANGELOG.md heads at"));

  beforeEach(() => {
    dir = join(tmpdir(), `khai-heal-gate-${process.pid}-${Math.random().toString(36).slice(2)}`);
    writeHouse(dir);
    registry.buildRegistry(dir); // a reconciled house at 0.1.0
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("fails a heading above the registry version (the drift artifact)", () => {
    writeFileSync(join(dir, "CHANGELOG.md"), "# demo\n\n## 0.2.0\n\n- drifted entry\n");
    const errors = changelogErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("never shipped");
  });

  it("passes a heading equal to the registry version", () => {
    writeFileSync(join(dir, "CHANGELOG.md"), "# demo\n\n## 0.1.0\n\n- shipped entry\n");
    expect(changelogErrors()).toEqual([]);
  });

  it("passes a heading below the registry version (the between-releases state)", () => {
    writeFileSync(join(dir, "CHANGELOG.md"), "# demo\n\n## 0.0.1\n\n- older entry\n");
    expect(changelogErrors()).toEqual([]);
  });

  it("passes with no CHANGELOG.md at all", () => {
    expect(changelogErrors()).toEqual([]);
  });
});

// khai issue 1071: the heal is for a release only. In a working branch the top
// heading is the release already on the registry, so healing it to the count
// the branch is moving toward rewrites published history. The versions cannot
// discriminate, because a house in sync has heading === manifest in both
// states; pending changesets can.
const DORMANT_PENDING = !readFileSync(join(srcDir, "registry.mjs"), "utf8").includes(
  "hasPendingChangesets",
);

// A house whose manifest sits below the count-derived version, which is the
// real branch direction: content has been added, so the build moves the minor
// up. The top heading equals the manifest, the state a house is in for the
// first PR after any release, and the only state in which the bug fires.
function writeBranchHouse(dir) {
  writeHouse(dir);
  const pkgPath = join(dir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.version = "0.0.5";
  writeFileSync(pkgPath, JSON.stringify(pkg));
  writeFileSync(join(dir, "CHANGELOG.md"), "# demo\n\n## 0.0.5\n\n- the release on the registry\n");
}

function writeChangesetDir(dir, files) {
  mkdirSync(join(dir, ".changeset"), { recursive: true });
  for (const [name, body] of Object.entries(files)) {
    writeFileSync(join(dir, ".changeset", name), body);
  }
}

describe.skipIf(DORMANT_PENDING)("hasPendingChangesets", () => {
  let dir;

  beforeEach(() => {
    dir = join(tmpdir(), `khai-pending-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(dir, { recursive: true });
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("counts a pending changeset", () => {
    writeChangesetDir(dir, { "brave-pandas-clap.md": '---\n"@chbrain/x": patch\n---\n\nA fix.\n' });
    expect(registry.hasPendingChangesets(dir)).toBe(true);
  });

  // What a release looks like after `changeset version` has consumed them: the
  // directory survives, holding only its furniture.
  it("ignores the changesets furniture, so a consumed release reads as empty", () => {
    writeChangesetDir(dir, {
      "README.md": "# Changesets\n",
      "config.json": "{}\n",
      ".gitkeep": "",
    });
    expect(registry.hasPendingChangesets(dir)).toBe(false);
  });

  it("ignores README.md whatever its case", () => {
    writeChangesetDir(dir, { "readme.md": "# Changesets\n" });
    expect(registry.hasPendingChangesets(dir)).toBe(false);
  });

  // Not a changesets repo, so there is no release state to protect: the heal
  // keeps its previous behaviour. A decision, not an oversight.
  it("reads a tree with no .changeset directory as nothing pending", () => {
    expect(registry.hasPendingChangesets(dir)).toBe(false);
  });
});

describe.skipIf(DORMANT_PENDING)("buildRegistry heals only when no changeset is pending", () => {
  let dir;

  beforeEach(() => {
    dir = join(tmpdir(), `khai-heal-branch-${process.pid}-${Math.random().toString(36).slice(2)}`);
    writeBranchHouse(dir);
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  // The bug: pre-fix this rewrote 0.0.5 to 0.1.0, a version never published.
  it("leaves a published heading alone in a working branch", () => {
    writeChangesetDir(dir, { "add-a-thing.md": '---\n"@chbrain/x": minor\n---\n\nAdd a thing.\n' });
    registry.buildRegistry(dir);
    // the manifest is still reconciled: the build stays the single writer of it
    expect(JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).version).toBe("0.1.0");
    const changelog = readFileSync(join(dir, "CHANGELOG.md"), "utf8");
    expect(changelog).toContain("## 0.0.5");
    expect(changelog).not.toContain("## 0.1.0");
  });

  // The #1040 behaviour, which must survive: same house, changesets consumed.
  it("heals the heading in a release, with the directory present but empty of changesets", () => {
    writeChangesetDir(dir, { "README.md": "# Changesets\n", "config.json": "{}\n" });
    registry.buildRegistry(dir);
    const changelog = readFileSync(join(dir, "CHANGELOG.md"), "utf8");
    expect(changelog).toContain("## 0.1.0");
    expect(changelog).not.toContain("## 0.0.5");
  });

  it("heals when the house keeps no .changeset directory at all", () => {
    registry.buildRegistry(dir);
    expect(readFileSync(join(dir, "CHANGELOG.md"), "utf8")).toContain("## 0.1.0");
  });
});
