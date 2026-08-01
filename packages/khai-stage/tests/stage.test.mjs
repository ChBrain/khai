import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { stageHouse, slug } from "../index.mjs";

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
