import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  slug,
  validateEntry,
  loadRegistry,
  renderReadme,
  houses,
  KINDS,
  KIND_BLURB,
} from "../index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const README = join(here, "..", "README.md");

const good = {
  id: "buechner",
  title: "Buechner",
  kind: "stage",
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

  it("requires repo (the house) and rejects a card without it", () => {
    const { repo, ...noRepo } = good;
    expect(validateEntry(noRepo, { id: "buechner" }).some((e) => e.includes("repo"))).toBe(true);
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
    const card = (id) => ({
      id,
      title: id,
      kind: "stage",
      package: `@chbrain/khai-plays-${id}`,
      blurb: id,
      repo: `https://github.com/ChBrain/khai-plays-${id}`,
    });
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

  it("links each house and shows the package it publishes", () => {
    const md = renderReadme([good]);
    expect(md).toContain("[Buechner](https://github.com/ChBrain/khai-plays-buechner)");
    expect(md).toContain("`@chbrain/khai-plays-buechner`");
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

// One registry for every house that depends on khai, with a `kind` telling the
// three apart. The kind cannot be computed: a card is all khai holds about a
// house, whose package.json lives in another repository.
describe("khai-plays: the three kinds", () => {
  it("closes the set at stage, work, and canon", () => {
    expect(KINDS).toEqual(["stage", "work", "canon", "chain"]);
    for (const kind of KINDS) expect(typeof KIND_BLURB[kind]).toBe("string");
  });

  it("requires a kind, and refuses one outside the set", () => {
    const { kind, ...noKind } = good;
    expect(validateEntry(noKind, { id: "buechner" }).some((e) => e.includes("kind"))).toBe(true);
    expect(
      validateEntry({ ...good, kind: "playhouse" }, { id: "buechner" }).some((e) =>
        e.includes("kind"),
      ),
    ).toBe(true);
    for (const kind of KINDS) {
      expect(validateEntry({ ...good, kind }, { id: "buechner" })).toEqual([]);
    }
  });

  it("renders a section per kind, in bill order, and skips the empty ones", () => {
    const card = (id, kind) => ({ ...good, id, title: id, kind });
    const md = renderReadme([card("a", "canon"), card("b", "stage")]);
    // Sections follow KINDS order, not the order the cards arrived in.
    expect(md.indexOf("## Stage")).toBeGreaterThan(-1);
    expect(md.indexOf("## Stage")).toBeLessThan(md.indexOf("## Canon"));
    // Nothing is registered as a work here, so no empty heading is emitted --
    // one would read as a missing house rather than an unused kind.
    expect(md).not.toContain("## Work\n");
  });

  it("puts every live card under its own kind's section", () => {
    const md = renderReadme(houses);
    for (const h of houses) {
      const section = `## ${h.kind[0].toUpperCase()}${h.kind.slice(1)}`;
      const at = md.indexOf(section);
      expect(at, `${h.id} declares ${h.kind}`).toBeGreaterThan(-1);
      // The card's line sits after its own section heading.
      expect(md.indexOf(`[${h.title}](${h.repo})`)).toBeGreaterThan(at);
    }
  });

  it("stops claiming every house is a plays repository", () => {
    // The old bill asserted the house was `khai-plays-<source>` and the package
    // was its programme of plays; a third of the cards already broke both.
    const md = renderReadme(houses);
    expect(md).not.toContain("khai-plays-<source>` repository");
    expect(md).not.toContain("read that house's plays");
  });
});

// Every house holds plays; the kinds differ in where the source comes from and
// what the plays are for. The bill's prose has to say that, because saying
// "reusable material" instead reads as though a canon house holds something
// other than a play, which no house does.
describe("khai-plays: the bill states what the kinds actually differ in", () => {
  it("describes every house kind as holding plays, and the chain kind as the exception", () => {
    // `chain` holds no plays and says so: it is on the bill by exception, for
    // the jobs that read the bill as the list of what khai runs.
    for (const kind of KINDS) {
      if (kind === "chain") expect(KIND_BLURB[kind]).toMatch(/exception/);
      else expect(KIND_BLURB[kind]).toMatch(/plays/);
    }
  });

  it("counts the houses rather than leaving a reader to navigate for calibration", () => {
    // Computed from the cards. A count in hand-kept prose is wrong the first
    // time a house is registered, which is the failure this whole file avoids.
    const card = (id, kind) => ({ ...good, id, title: id, kind });
    const md = renderReadme([card("a", "stage"), card("b", "stage"), card("c", "canon")]);
    expect(md).toContain("3 houses: 2 stage, 1 canon.");
    // A kind nobody has registered is not named with a zero.
    expect(md).not.toContain("0 work");
  });

  it("says one house in the singular, and counts nothing on an empty bill", () => {
    expect(renderReadme([good])).toContain("1 house: 1 stage.");
    expect(renderReadme([])).not.toMatch(/\d+ houses?:/);
  });

  it("keeps the live bill's tally true", () => {
    const md = renderReadme(houses);
    const by = KINDS.map((k) => [k, houses.filter((h) => h.kind === k).length]).filter(
      ([, n]) => n > 0,
    );
    expect(md).toContain(`${houses.length} houses: ${by.map(([k, n]) => `${n} ${k}`).join(", ")}.`);
  });
});

describe("khai-plays: the package describes itself as the house registry", () => {
  it("does not claim every house is a khai-plays-<source> collection", () => {
    // This string ships to npm as the package page. It carried the plays-only
    // framing after the bill itself had stopped: three of the ten houses are
    // named khai-<source>, and two of the three kinds hold no author's source.
    const pkg = JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8"));
    expect(pkg.description).not.toMatch(/khai-plays-<source>/);
    expect(pkg.description).toMatch(/house registry/i);
    for (const kind of KINDS) expect(pkg.description).toMatch(new RegExp(kind));
  });
});
