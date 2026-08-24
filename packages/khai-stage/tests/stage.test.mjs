import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { stageHouse, slug, KINDS } from "../index.mjs";

// Dormant until the repertoire option lands in the generator: source and
// tests are separate PRs (the house rule), so the repertoire assertions skip
// while ../index.mjs does not know the option, and wake once it does.
const DORMANT = !readFileSync(new URL("../index.mjs", import.meta.url), "utf8").includes(
  "repertoire",
);

let dir;
let result;
beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "khai-stage-"));
  result = await stageHouse({ source: "Demo Source", targetDir: dir });
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const allFiles = (d, base = d) =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const full = join(d, e.name);
    return e.isDirectory() ? allFiles(full, base) : [relative(base, full).split("\\").join("/")];
  });

describe("khai-stage: source becomes a slug", () => {
  it("lowercases and hyphenates, drops non-ASCII", () => {
    expect(slug("Demo Source")).toBe("demo-source");
    expect(slug("Georg Buechner")).toBe("georg-buechner");
  });
  it("reports the repo name", () => {
    expect(result.repo).toBe("khai-plays-demo-source");
  });
});

describe("khai-stage: the stamped house", () => {
  it("lays the invariant files, dotfiles restored", () => {
    for (const f of [
      "package.json",
      ".npmrc",
      ".gitignore",
      ".nvmrc",
      ".prettierignore",
      "LICENSE",
      "LICENSE-CODE",
      "khai-guard.config.json",
      ".github/workflows/ci.yml",
      ".github/workflows/release.yml",
      ".github/CODEOWNERS",
      ".husky/pre-push",
      ".changeset/config.json",
      "SECURITY.md",
      "CLAUDE.md",
      "README.md",
      "GEMINI.md",
      "management/position_choregos.md",
      "management/management_instructions.md",
      "management/persona_nicias.md",
      "management/persona_pericles.md",
      "management/position_theatre_manager.md",
      "management/persona_manager.md",
      "management/position_playwright.md",
      "management/persona_demo-source.md",
      "management/position_roadie.md",
      "management/persona_roadie.md",
      "management/position_director.md",
      "management/persona_director.md",
      "management/plan_stage_the_score.md",
      "plays/.gitkeep",
      "registry.json",
      "tests/house.test.mjs",
    ]) {
      expect(existsSync(join(dir, f)), `missing ${f}`).toBe(true);
    }
  });

  it("restores the changeset config to .changeset (dotted), not changeset/", () => {
    expect(existsSync(join(dir, ".changeset/config.json"))).toBe(true);
    expect(existsSync(join(dir, "changeset/config.json"))).toBe(false);
  });

  it("stamps a publishable package: files, version + release scripts, not private", () => {
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    expect(pkg.files).toContain("plays/**");
    // registry.json is written into every house; it must also ship and export,
    // or consumers fall back to deprecated markdown parsing (regression guard).
    expect(pkg.files).toContain("registry.json");
    expect(pkg.exports["./registry.json"]).toBe("./registry.json");
    expect(pkg.scripts.version).toBe("changeset version && khai-tests registry build");
    expect(pkg.scripts.release).toBe("changeset publish");
    expect(pkg.private).toBeUndefined();
  });

  it("drops the .tmpl suffix on stamp", () => {
    expect(existsSync(join(dir, "tests/house.test.mjs.tmpl"))).toBe(false);
  });

  it("leaves no unfilled placeholder anywhere", () => {
    for (const f of allFiles(dir)) {
      const text = readFileSync(join(dir, f), "utf8");
      expect(
        /\{\{(SOURCE|SOURCE_TITLE|YEAR|MANAGER_PERSONA|MANAGER_TITLE|PLAYWRIGHT_PERSONA|PLAYWRIGHT_TITLE|DIRECTOR_PERSONA|DIRECTOR_TITLE)\}\}/.test(
          text,
        ),
        `placeholder left in ${f}`,
      ).toBe(false);
    }
  });

  it("fills the source into the README (the Estate identity)", () => {
    expect(readFileSync(join(dir, "README.md"), "utf8")).toContain("Demo Source");
  });

  it("declares the dual license and the source-named package", () => {
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    expect(pkg.license).toBe("SEE LICENSE IN LICENSE and LICENSE-CODE");
    expect(pkg.name).toBe("@chbrain/khai-plays-demo-source");
  });

  it("emits a valid playhouse registry.json, so the house is green on raise", () => {
    const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    expect(reg.name).toBe("@chbrain/khai-plays-demo-source");
    expect(reg.name).toBe(pkg.name);
    expect(reg.version).toBe(pkg.version);
    expect(reg.plays).toEqual([]);
  });

  it("casts the Director: stamps the position, the plan, and a per-house persona", async () => {
    const d = mkdtempSync(join(tmpdir(), "khai-stage-dir-"));
    try {
      await stageHouse({ source: "Demo Source", targetDir: d, director: "Some Director" });
      expect(existsSync(join(d, "management/position_director.md"))).toBe(true);
      expect(existsSync(join(d, "management/plan_stage_the_score.md"))).toBe(true);
      // the .tmpl persona is renamed per house and filled; no default copy left.
      expect(existsSync(join(d, "management/persona_some-director.md"))).toBe(true);
      expect(existsSync(join(d, "management/persona_director.md"))).toBe(false);
      const persona = readFileSync(join(d, "management/persona_some-director.md"), "utf8");
      expect(persona).toContain('title: "Some Director"');
      expect(persona).not.toMatch(/\{\{/);
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });

  it("the house guard config owns plays under a play lane", () => {
    const cfg = JSON.parse(readFileSync(join(dir, "khai-guard.config.json"), "utf8"));
    const play = cfg.branchScope.lanes.find((l) => l.pattern === "play/*");
    expect(play.allow).toContain("plays/**");
  });

  it.skipIf(DORMANT)("ignores the ephemeral scenarios/ working directory", () => {
    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toContain("scenarios/");
  });

  it("has no dependencies field when no repertoire is named (today's behavior, untouched)", () => {
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    expect(pkg.dependencies).toBeUndefined();
  });

  it("prints the same handoffs whether or not a repertoire is named, minus the repertoire line", () => {
    expect(result.handoffs.some((h) => h.includes("repertoire"))).toBe(false);
  });
});

describe.skipIf(DORMANT)("khai-stage: --repertoire stages house dependencies", () => {
  it('adds each named package to dependencies at "*"', async () => {
    const d = mkdtempSync(join(tmpdir(), "khai-stage-rep-"));
    try {
      const res = await stageHouse({
        source: "Demo Source",
        targetDir: d,
        repertoire: "@chbrain/khai-cultures, @chbrain/khai-arch",
      });
      const pkg = JSON.parse(readFileSync(join(d, "package.json"), "utf8"));
      expect(pkg.dependencies).toEqual({
        "@chbrain/khai-cultures": "*",
        "@chbrain/khai-arch": "*",
      });
      // the printed handoff mentions installing the repertoire
      expect(res.handoffs.some((h) => h.includes("repertoire"))).toBe(true);
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });

  it("also accepts an array of package names", async () => {
    const d = mkdtempSync(join(tmpdir(), "khai-stage-rep-arr-"));
    try {
      const res = await stageHouse({
        source: "Demo Source",
        targetDir: d,
        repertoire: ["@chbrain/khai-cultures"],
      });
      const pkg = JSON.parse(readFileSync(join(d, "package.json"), "utf8"));
      expect(pkg.dependencies).toEqual({ "@chbrain/khai-cultures": "*" });
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });

  it("omitted, behavior is identical to a plain stage (no dependencies field, same handoffs)", async () => {
    const d = mkdtempSync(join(tmpdir(), "khai-stage-rep-none-"));
    try {
      const res = await stageHouse({ source: "Demo Source", targetDir: d });
      const pkg = JSON.parse(readFileSync(join(d, "package.json"), "utf8"));
      expect(pkg.dependencies).toBeUndefined();
      expect(res.handoffs).toEqual(result.handoffs);
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });
});

// A house is one of three kinds, the same three the bill carries. What varies is
// the house's identity and structure -- its name, repository, the collection it
// indexes, and the `khai.collection` it declares. The voice does not vary here:
// that prose is judged, and judging is the impresario skill's half.
describe("khai-stage: the three kinds", () => {
  const stamp = async (opts) => {
    const dir = mkdtempSync(join(tmpdir(), "khai-stage-kind-"));
    const result = await stageHouse({ source: opts.source, targetDir: dir, ...opts });
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    const registry = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
    return { dir, result, pkg, registry };
  };

  it("closes the set at stage, work, and canon, and refuses anything else", async () => {
    expect(KINDS).toEqual(["stage", "work", "canon"]);
    await expect(
      stageHouse({ source: "x", targetDir: "/tmp/never", kind: "playhouse" }),
    ).rejects.toThrow(/kind must be one of/);
  });

  it("leaves a stage house exactly as it was before the option existed", async () => {
    // The default. A stage house indexes the default `plays` collection, so it
    // declares none -- that is what makes the historical no-config houses
    // resolve, and writing it would make old and new houses disagree on paper.
    const { pkg, registry, result } = await stamp({ source: "buechner" });
    expect(pkg.name).toBe("@chbrain/khai-plays-buechner");
    expect(pkg.khai.engine).toBe("plays-buechner");
    expect(pkg.khai.collection).toBeUndefined();
    expect(pkg.files).toContain("plays/**");
    expect(Object.keys(registry)).toContain("plays");
    expect(result.repo).toBe("khai-plays-buechner");
    expect(result.kind).toBe("stage");
  });

  it("gives a canon house its own name, collection, and directory", async () => {
    const { dir, pkg, registry, result } = await stamp({ source: "cultures", kind: "canon" });
    expect(pkg.name).toBe("@chbrain/khai-cultures");
    // The object form, matching the live house exactly. The string form would
    // let the kit derive `culture_`, which is not what any real house uses.
    expect(pkg.khai.collection).toEqual({ dir: "cultures", key: "cultures", anchor: "play_" });
    expect(pkg.files).toContain("cultures/**");
    expect(pkg.files).not.toContain("plays/**");
    expect(Object.keys(registry)).toContain("cultures");
    expect(Object.keys(registry)).not.toContain("plays");
    expect(existsSync(join(dir, "cultures"))).toBe(true);
    expect(existsSync(join(dir, "plays"))).toBe(false);
    expect(result.repo).toBe("khai-cultures");
  });

  it("lets a work house name a collection that is not its slug", async () => {
    // Phoenix is a work whose beasts do not share its slug, so the collection
    // defaults to the source but must be overridable.
    const { dir, pkg, registry } = await stamp({
      source: "phoenix",
      kind: "work",
      collection: "bestiary",
    });
    expect(pkg.name).toBe("@chbrain/khai-phoenix");
    expect(pkg.khai.collection).toEqual({ dir: "bestiary", key: "bestiary", anchor: "play_" });
    expect(Object.keys(registry)).toContain("bestiary");
    expect(existsSync(join(dir, "bestiary"))).toBe(true);
  });

  it("defaults a non-stage collection to the source slug", async () => {
    const { pkg } = await stamp({ source: "misfits", kind: "canon" });
    expect(pkg.khai.collection).toEqual({ dir: "misfits", key: "misfits", anchor: "play_" });
  });

  // The anchor is the one thing a collection name must not decide. Every live
  // non-stage house -- cultures, misfits, phoenix -- anchors its items as plays,
  // because each item IS a play: a theatre of that culture, a trap staged as a
  // system, a beast speaking for its phenomenon. Deriving `culture_` from the
  // collection name would stamp a house no operator could conform.
  it("anchors a non-stage house's items as plays, overridable", async () => {
    for (const source of ["cultures", "misfits"]) {
      const { pkg } = await stamp({ source, kind: "canon" });
      expect(pkg.khai.collection.anchor, source).toBe("play_");
    }
    const { pkg } = await stamp({ source: "odd", kind: "canon", anchor: "odd_" });
    expect(pkg.khai.collection.anchor).toBe("odd_");
  });

  it("hands the operator the register command and the voice caveat", async () => {
    const { result } = await stamp({ source: "cultures", kind: "canon" });
    const handoffs = result.handoffs.join("\n");
    expect(handoffs).toContain("--kind canon");
    // khai-stage computes; it does not judge. The blueprint's management prose
    // still speaks of plays, and the handoff says so rather than pretending.
    expect(handoffs).toMatch(/management prose speaks of plays/);
    const stage = await stamp({ source: "buechner" });
    expect(stage.result.handoffs.join("\n")).not.toMatch(/management prose speaks of plays/);
  });
});
