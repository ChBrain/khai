import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateEntry, loadRegistry, houses } from "../index.mjs";

const good = {
  id: "buechner",
  title: "Buechner",
  repo: "https://github.com/ChBrain/khai-plays-buechner",
  blurb: "The Buechner production house.",
  plays: [{ id: "woyzeck", title: "Woyzeck", package: "@chbrain/khai-play-woyzeck" }],
};

describe("khai-plays: entry validation", () => {
  it("accepts a well-formed house card", () => {
    expect(validateEntry(good, { id: "buechner" })).toEqual([]);
  });

  it("flags a bad slug, a non-URL repo, missing fields, and a filename mismatch", () => {
    expect(validateEntry({ ...good, id: "Bad Slug" }).length).toBeGreaterThan(0);
    expect(validateEntry({ ...good, repo: "not-a-url" }).length).toBeGreaterThan(0);
    expect(validateEntry({ id: "x" }).length).toBeGreaterThan(0);
    expect(validateEntry(good, { id: "other" }).some((e) => e.includes("match the filename"))).toBe(
      true,
    );
  });

  it("flags a malformed play within a house", () => {
    expect(validateEntry({ ...good, plays: [{ id: "no-title" }] }).length).toBeGreaterThan(0);
  });
});

describe("khai-plays: loading", () => {
  it("the live registry loads (empty is valid)", () => {
    expect(Array.isArray(houses)).toBe(true);
  });

  it("loads entries sorted by id and throws on a malformed one", () => {
    const dir = mkdtempSync(join(tmpdir(), "khai-plays-"));
    const card = (id) => ({ id, title: id, repo: `https://example.com/${id}`, blurb: id });
    writeFileSync(join(dir, "zeta.json"), JSON.stringify(card("zeta")));
    writeFileSync(join(dir, "alpha.json"), JSON.stringify(card("alpha")));
    expect(loadRegistry(dir).map((h) => h.id)).toEqual(["alpha", "zeta"]);

    writeFileSync(
      join(dir, "broken.json"),
      JSON.stringify({ id: "broken", title: "", repo: "x", blurb: "" }),
    );
    expect(() => loadRegistry(dir)).toThrow(/broken\.json/);
    rmSync(dir, { recursive: true, force: true });
  });
});
