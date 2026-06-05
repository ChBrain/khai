import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { slug, validateEntry, loadRegistry, renderReadme, houses } from "../index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const README = join(here, "..", "README.md");

const good = {
  id: "buechner",
  title: "Buechner",
  package: "@chbrain/khai-plays-buechner",
  blurb: "The Buechner production house.",
  repo: "https://github.com/ChBrain/khai-plays-buechner",
};

describe("khai-plays: slug", () => {
  it("normalises a source to a hyphen-joined ASCII slug", () => {
    expect(slug("  Georg Buechner ")).toBe("georg-buechner");
    expect(slug("Woyzeck!!")).toBe("woyzeck");
  });
});

describe("khai-plays: entry validation", () => {
  it("accepts a well-formed house card", () => {
    expect(validateEntry(good, { id: "buechner" })).toEqual([]);
  });

  it("accepts a card without the optional repo", () => {
    const { repo, ...noRepo } = good;
    expect(validateEntry(noRepo, { id: "buechner" })).toEqual([]);
  });

  it("flags a bad slug, a bad package, a non-URL repo, missing fields, and a filename mismatch", () => {
    expect(validateEntry({ ...good, id: "Bad Slug" }).length).toBeGreaterThan(0);
    expect(validateEntry({ ...good, package: "Not A Package" }).length).toBeGreaterThan(0);
    expect(validateEntry({ ...good, repo: "not-a-url" }).length).toBeGreaterThan(0);
    expect(validateEntry({ id: "x" }).length).toBeGreaterThan(0);
    expect(validateEntry(good, { id: "other" }).some((e) => e.includes("match the filename"))).toBe(
      true,
    );
  });
});

describe("khai-plays: loading", () => {
  it("the live registry loads (empty is valid)", () => {
    expect(Array.isArray(houses)).toBe(true);
  });

  it("loads entries sorted by id and throws on a malformed one", () => {
    const dir = mkdtempSync(join(tmpdir(), "khai-plays-"));
    const card = (id) => ({ id, title: id, package: `@chbrain/khai-plays-${id}`, blurb: id });
    writeFileSync(join(dir, "zeta.json"), JSON.stringify(card("zeta")));
    writeFileSync(join(dir, "alpha.json"), JSON.stringify(card("alpha")));
    expect(loadRegistry(dir).map((h) => h.id)).toEqual(["alpha", "zeta"]);

    writeFileSync(
      join(dir, "broken.json"),
      JSON.stringify({ id: "broken", title: "", package: "x", blurb: "" }),
    );
    expect(() => loadRegistry(dir)).toThrow(/broken\.json/);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe("khai-plays: render", () => {
  it("renders an empty bill without throwing", () => {
    const md = renderReadme([]);
    expect(md).toContain("# khai-plays");
    expect(md).toContain("None registered yet.");
  });

  it("lists each house with its package, and links the repo when present", () => {
    const { repo, ...noRepo } = good;
    const md = renderReadme([good, noRepo]);
    expect(md).toContain("`@chbrain/khai-plays-buechner`");
    expect(md).toContain("([source](https://github.com/ChBrain/khai-plays-buechner))");
  });

  it("is free of em/en-dashes and the clause dash (house voice)", () => {
    const md = renderReadme([good]);
    expect(md).not.toMatch(/[–—]/);
    expect(md).not.toMatch(/ - /);
  });

  it("README.md on disk matches renderReadme(houses) (no drift)", () => {
    const onDisk = readFileSync(README, "utf8");
    const expected = renderReadme(houses);
    expect(onDisk.trimEnd()).toBe(expected.trimEnd());
  });
});
