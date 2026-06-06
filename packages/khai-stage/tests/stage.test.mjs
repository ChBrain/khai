import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { stageHouse, slug } from "../index.mjs";

let dir;
let result;
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "khai-stage-"));
  result = stageHouse({ source: "Demo Source", targetDir: dir });
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
      "management/persona_nicias.md",
      "management/persona_pericles.md",
      "management/position_manager.md",
      "management/persona_manager.md",
      "management/position_playwright.md",
      "management/persona_demo-source.md",
      "plays/.gitkeep",
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
    expect(pkg.scripts.version).toBe("changeset version");
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
        /\{\{(SOURCE|SOURCE_TITLE|YEAR|MANAGER_PERSONA|MANAGER_TITLE|PLAYWRIGHT_PERSONA|PLAYWRIGHT_TITLE)\}\}/.test(
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

  it("the house guard config owns plays under a play lane", () => {
    const cfg = JSON.parse(readFileSync(join(dir, "khai-guard.config.json"), "utf8"));
    const play = cfg.branchScope.lanes.find((l) => l.pattern === "play/*");
    expect(play.allow).toContain("plays/**");
  });
});
