// Walls and probes on the science index's OWN key computation, the module
// this ships beside: src/science-walls.mjs.
//
//   findShadowedForms  -- a homonym declaration order that misleads a reader.
//   findSuffixKeys     -- an index key that is a generational suffix.
//   axesOf / findMalformedAxes / findOpposed -- the axis/opposition wall.
//   undeclaredNamesakes / mixedCells         -- namesake probes, always exit 0.
//   compoundWorks                            -- the hidden-work probe.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";

const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const DORMANT = !existsSync(join(srcDir, "science-walls.mjs"));
const walls = DORMANT ? {} : await import("../src/science-walls.mjs");
const overlap = DORMANT ? {} : await import("../src/overlap.mjs");

// A collection house: units under <collection>/<id>/ with a REFERENCE.md warrant
// and a play_<id>.md anchor carrying the title. Mirrors the fixture in
// science-overlap.test.mjs (kept local since that file's helper is not
// exported), extended with an optional `frontmatter` block per unit and an
// optional `body` prepended before the Origin table -- the two things the
// axis wall reads that the shared-work wall's fixture never needed.
function collectionHouse(dir, units, config = {}) {
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "@chbrain/fixture-house",
      version: "0.0.0",
      khai: { collection: { dir: "misfits", key: "misfits", anchor: "play_" } },
    }),
  );
  writeFileSync(join(dir, "khai-guard.config.json"), JSON.stringify(config));
  for (const [id, spec] of Object.entries(units)) {
    const { rows, frontmatter, body, title } = Array.isArray(spec) ? { rows: spec } : spec;
    mkdirSync(join(dir, "misfits", id), { recursive: true });
    const table = rows
      .map(([source, work, scope]) => `| **${source}** | _"${work}"_ | ${scope} |`)
      .join("\n");
    const fm = frontmatter ? `---\n${frontmatter}\n---\n\n` : "";
    writeFileSync(
      join(dir, "misfits", id, "REFERENCE.md"),
      `${fm}# Warrant\n\n${body ?? ""}\n## Origin\n\n| Source | Key Work | Scope |\n| --- | --- | --- |\n${table}\n`,
    );
    writeFileSync(
      join(dir, "misfits", id, `play_${id}.md`),
      `---\ntitle: "${title ?? id}"\n---\n\n# ${title ?? id}\n`,
    );
  }
}

let dir;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "khai-walls-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

// --- findShadowedForms -------------------------------------------------

describe.skipIf(DORMANT)("science-walls: findShadowedForms", () => {
  it("flags a shorter form declared before a longer form it prefixes", () => {
    const found = walls.findShadowedForms({ homonyms: { Example: ["David", "David L"] } });
    expect(found).toEqual([{ surname: "Example", form: "David L", shadowedBy: "David" }]);
  });

  it("clears the same forms in longest-first order", () => {
    expect(walls.findShadowedForms({ homonyms: { Example: ["David L", "David"] } })).toEqual([]);
  });

  it("does not confuse two unrelated forms for a prefix relationship", () => {
    expect(walls.findShadowedForms({ homonyms: { Example: ["Oliver", "Julian Tudor"] } })).toEqual(
      [],
    );
  });

  it("is pure over the policy object: no homonyms, no findings, no crash", () => {
    expect(walls.findShadowedForms({})).toEqual([]);
    expect(walls.findShadowedForms()).toEqual([]);
  });
});

// --- findSuffixKeys ------------------------------------------------------

describe.skipIf(DORMANT)("science-walls: findSuffixKeys", () => {
  it("flags an index key that is nothing but a generational suffix", () => {
    const index = [{ surname: "Jr", unit: "one", keyWork: "Anonymous Report" }];
    expect(walls.findSuffixKeys(index)).toEqual([
      { key: "Jr", unit: "one", work: "Anonymous Report" },
    ]);
  });

  it("strips a declared-form parenthetical before comparing", () => {
    const index = [{ surname: "III (Example)", unit: "one", keyWork: "A Study" }];
    expect(walls.findSuffixKeys(index)).toHaveLength(1);
  });

  it("clears an ordinary surname, suffixed source included -- the build already sheds it", () => {
    // The build itself (surnames() in science.mjs) drops a trailing suffix
    // before taking the surname, so a normally-written citation never
    // produces a suffix key in the first place; this wall only ever catches
    // a Source cell that is nothing else.
    const index = [{ surname: "Worthington", unit: "one", keyWork: "A Study" }];
    expect(walls.findSuffixKeys(index)).toEqual([]);
  });
});

// --- axesOf / findMalformedAxes / findOpposed -----------------------------

describe.skipIf(DORMANT)("science-walls: axis discovery", () => {
  it("reports nothing on a root with no collection units at all", () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "x", version: "0.0.0" }));
    expect(walls.axesOf(dir)).toEqual([]);
  });

  it("collects only units declaring axis and/or sign, reading the title from the anchor", () => {
    collectionHouse(dir, {
      one: {
        rows: [["Example", "A Study", "The spine."]],
        frontmatter: "axis: crowding\nsign: negative",
        title: "First Play",
      },
      two: { rows: [["Example", "Another Study", "The spine."]] }, // no axis at all
    });
    const axes = walls.axesOf(dir);
    expect(axes).toHaveLength(1);
    expect(axes[0]).toMatchObject({
      id: "one",
      axis: "crowding",
      sign: "negative",
      title: "First Play",
    });
  });

  it("reads a trailing YAML comment after the value, which is legal", () => {
    collectionHouse(dir, {
      one: {
        rows: [["Example", "A Study", "The spine."]],
        frontmatter: "axis: crowding\nsign: negative # how the outcome moves as the quantity rises",
      },
    });
    expect(walls.axesOf(dir)[0].sign).toBe("negative");
  });
});

describe.skipIf(DORMANT)("science-walls: findMalformedAxes", () => {
  it("flags an axis without a sign, a sign without an axis, and an invalid sign", () => {
    const axes = [
      { id: "a", axis: "crowding", sign: undefined },
      { id: "b", axis: undefined, sign: "positive" },
      { id: "c", axis: "crowding", sign: "up" },
      { id: "d", axis: "crowding", sign: "positive" },
    ];
    expect(walls.findMalformedAxes(axes)).toEqual([
      "a: axis without sign",
      "b: sign without axis",
      'c: sign is "up", expected positive or negative',
    ]);
  });

  it("holds at zero when every declaration is well-formed", () => {
    expect(walls.findMalformedAxes([{ id: "a", axis: "crowding", sign: "positive" }])).toEqual([]);
  });
});

describe.skipIf(DORMANT)("science-walls: findOpposed", () => {
  it("flags an opposed pair whose warrants do not name each other", () => {
    collectionHouse(dir, {
      one: {
        rows: [["Example", "A Study", "The spine."]],
        frontmatter: "axis: crowding\nsign: negative",
        title: "First Play",
      },
      two: {
        rows: [["Example", "Another Study", "The spine."]],
        frontmatter: "axis: crowding\nsign: positive",
        title: "Second Play",
      },
    });
    const found = walls.findOpposed(walls.axesOf(dir));
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({
      axis: "crowding",
      a: "one",
      b: "two",
      aNamesB: false,
      bNamesA: false,
    });
  });

  it("clears an opposed pair whose warrants each name the other's title", () => {
    collectionHouse(dir, {
      one: {
        rows: [["Example", "A Study", "The spine."]],
        frontmatter: "axis: crowding\nsign: negative",
        body: "Distinct from Second Play, which makes the opposite claim.\n\n",
        title: "First Play",
      },
      two: {
        rows: [["Example", "Another Study", "The spine."]],
        frontmatter: "axis: crowding\nsign: positive",
        body: "Distinct from First Play, which makes the opposite claim.\n\n",
        title: "Second Play",
      },
    });
    expect(walls.findOpposed(walls.axesOf(dir))).toEqual([]);
  });

  it("does not flag two units on the SAME axis with the SAME sign", () => {
    collectionHouse(dir, {
      one: { rows: [["Example", "A Study", "S."]], frontmatter: "axis: crowding\nsign: negative" },
      two: { rows: [["Example", "B Study", "S."]], frontmatter: "axis: crowding\nsign: negative" },
    });
    expect(walls.findOpposed(walls.axesOf(dir))).toEqual([]);
  });

  it("does not flag opposite signs on DIFFERENT axes", () => {
    collectionHouse(dir, {
      one: { rows: [["Example", "A Study", "S."]], frontmatter: "axis: crowding\nsign: negative" },
      two: { rows: [["Example", "B Study", "S."]], frontmatter: "axis: density\nsign: positive" },
    });
    expect(walls.findOpposed(walls.axesOf(dir))).toEqual([]);
  });

  it("excludes a malformed record from pairing rather than crashing on it", () => {
    collectionHouse(dir, {
      one: { rows: [["Example", "A Study", "S."]], frontmatter: "axis: crowding" }, // no sign
      two: { rows: [["Example", "B Study", "S."]], frontmatter: "axis: crowding\nsign: positive" },
    });
    expect(walls.findOpposed(walls.axesOf(dir))).toEqual([]);
  });
});

// --- undeclaredNamesakes / mixedCells: probes, always a reading list -------

describe.skipIf(DORMANT)("science-walls: undeclaredNamesakes", () => {
  it("reports an undeclared surname whose own cells name two different people", () => {
    collectionHouse(dir, {
      one: [["Alice Example", "Paper One", "S."]],
      two: [["Bob Example", "Paper Two", "S."]],
    });
    const { records } = overlap.collectUnits(dir);
    const found = walls.undeclaredNamesakes(records, {});
    expect(found).toHaveLength(1);
    expect(found[0].surname).toBe("Example");
    expect(found[0].people.map((p) => p.given)).toEqual(["Alice", "Bob"]);
  });

  it("does not report one person written two ways (a token-prefix match)", () => {
    collectionHouse(dir, {
      one: [["Timothy Example", "Paper One", "S."]],
      two: [["Timothy D Example", "Paper Two", "S."]],
    });
    const { records } = overlap.collectUnits(dir);
    expect(walls.undeclaredNamesakes(records, {})).toEqual([]);
  });

  it("excludes a surname already declared in scholarPolicy.homonyms", () => {
    collectionHouse(dir, {
      one: [["Alice Example", "Paper One", "S."]],
      two: [["Bob Example", "Paper Two", "S."]],
    });
    const { records } = overlap.collectUnits(dir);
    expect(walls.undeclaredNamesakes(records, { homonyms: { Example: ["Alice", "Bob"] } })).toEqual(
      [],
    );
  });

  it("needs two DIFFERENT units, not two rows in one unit, since the axis is cross-unit", () => {
    collectionHouse(dir, {
      one: [
        ["Alice Example", "Paper One", "S."],
        ["Bob Example", "Paper Two", "S."],
      ],
    });
    const { records } = overlap.collectUnits(dir);
    expect(walls.undeclaredNamesakes(records, {})).toEqual([]);
  });
});

describe.skipIf(DORMANT)("science-walls: mixedCells", () => {
  it("reports an undeclared surname mixing a named cell with a bare one", () => {
    collectionHouse(dir, {
      one: [["Alice Example", "Paper One", "S."]],
      two: [["Example", "Paper Two", "S."]],
    });
    const { records } = overlap.collectUnits(dir);
    const found = walls.mixedCells(records, {});
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ surname: "Example", named: ["Alice"], bare: ["two"] });
  });

  it("clears when every cell is named, or every cell is bare", () => {
    collectionHouse(dir, {
      one: [["Alice Example", "Paper One", "S."]],
      two: [["Bob Example", "Paper Two", "S."]],
    });
    const { records: named } = overlap.collectUnits(dir);
    expect(walls.mixedCells(named, {})).toEqual([]);
  });
});

// --- compoundWorks ---------------------------------------------------------

describe.skipIf(DORMANT)("science-walls: compoundWorks", () => {
  it("finds a hidden second work colliding with another unit's first work", () => {
    collectionHouse(dir, {
      one: [["Example", "A Study; Second Study", "The spine."]],
      two: [["Other", "Second Study", "The spine."]],
    });
    const policy = overlap.loadWorkPolicy(dir);
    const found = walls.compoundWorks(dir, policy);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({
      unit: "one",
      // The fixture's Key Work cell is written `_"Title"_` (the house's own
      // convention), and stripMd only strips markdown emphasis, not the
      // literal quote marks inside it -- so the trailing quote survives into
      // the hidden tail exactly as it does in the real corpus (see the law-11
      // measurement in the PR description: "Also Second Work\"").
      hidden: 'Second Study"',
      holders: ["two"],
      canon: false,
      contrast: false,
      supporting: false,
    });
  });

  it("exempts a hidden work whose holder marks it canon", () => {
    collectionHouse(
      dir,
      {
        one: [["Example", "A Study; Second Study", "The spine."]],
        two: [["Other", "Second Study", "The spine."]],
      },
      { workPolicy: { canon: ["Second Study"] } },
    );
    const policy = overlap.loadWorkPolicy(dir);
    expect(walls.compoundWorks(dir, policy)[0].canon).toBe(true);
  });

  it("exempts a hidden work whose ONLY holder marks it contrast", () => {
    collectionHouse(dir, {
      one: [["Example", "A Study; Second Study", "The spine."]],
      two: [["Other", "Second Study", "Cited to distinguish the neighbour."]],
    });
    const policy = overlap.loadWorkPolicy(dir);
    expect(walls.compoundWorks(dir, policy)[0].contrast).toBe(true);
  });

  it("does not report a hidden tail shorter than two words, even if it would match", () => {
    collectionHouse(dir, {
      one: [["Example", "A Study; ed", "The spine."]],
      two: [["Other", "ed", "The spine."]],
    });
    const policy = overlap.loadWorkPolicy(dir);
    expect(walls.compoundWorks(dir, policy)).toEqual([]);
  });

  it("reports nothing when the hidden work matches no other unit's first work", () => {
    collectionHouse(dir, { one: [["Example", "A Study; An Unrelated Second Work", "The spine."]] });
    const policy = overlap.loadWorkPolicy(dir);
    expect(walls.compoundWorks(dir, policy)).toEqual([]);
  });
});
