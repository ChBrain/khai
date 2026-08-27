import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync, readFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
// Namespace imports, dormant-probed: a missing named import is a load-time
// crash even for a skipped suite, so probe the source tree for src/overlap.mjs
// before importing anything from it.
import * as science from "../src/science.mjs";

const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const DORMANT = !existsSync(join(srcDir, "overlap.mjs"));
const overlap = DORMANT ? {} : await import("../src/overlap.mjs");

// A second sentinel, for the support-marker block below: `roleOf` knew the
// `support` role but reached it only through the leading `**Support.**` prefix,
// so a house could declare its contrast vocabulary and not its support one.
// Dormant until the wall reads `supportingMarkers` (tests first, source second),
// probed by the fix itself rather than by a sentence -- a sentence in a wrapped
// comment is not a contiguous string, and a sentinel that never matches leaves
// the block quietly skipped.
const SYMMETRIC =
  !DORMANT &&
  readFileSync(join(srcDir, "overlap.mjs"), "utf8").includes("policy.supportingMarkers ??");

// --- keying: the science build's surname computation ----------------------

describe("science keying: surnames()", () => {
  it("drops a generational suffix, so the person is keyed under their surname", () => {
    expect(science.surnames("Everett L. Worthington Jr.")).toEqual(["Worthington"]);
    expect(science.surnames("Henry L. Roediger III")).toEqual(["Roediger"]);
    expect(science.surnames("Benson & Manoogian III")).toEqual(["Benson", "Manoogian"]);
    // The suffix set never eats a real surname: "V. Lim" ends in Lim, and a
    // part that is a single token keeps it whatever it looks like.
    expect(science.surnames("V. Lim")).toEqual(["Lim"]);
  });

  it("resolves a declared homonym by the LONGEST matching form, order-independently", () => {
    const a = science.surnames("David L Greene", { Greene: ["David", "David L", "Mark"] });
    const b = science.surnames("David L Greene", { Greene: ["David L", "David", "Mark"] });
    expect(a).toEqual(["Greene (David L)"]);
    expect(b).toEqual(["Greene (David L)"]);
    // The prefix arm still lets a short form absorb a longer written-out name.
    expect(science.surnames("James M Buchanan", { Buchanan: ["James"] })).toEqual([
      "Buchanan (James)",
    ]);
  });

  it("keys a suffixed part through the homonym forms as if unsuffixed", () => {
    expect(science.surnames("William B Swann Jr.", { Swann: ["William B", "Peter"] })).toEqual([
      "Swann (William B)",
    ]);
  });
});

// --- fixtures --------------------------------------------------------------

// A collection house: units under misfits/<id>/ with a REFERENCE.md warrant.
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
  for (const [id, rows] of Object.entries(units)) {
    mkdirSync(join(dir, "misfits", id), { recursive: true });
    const table = rows
      .map(([source, work, scope]) => `| **${source}** | _"${work}"_ | ${scope} |`)
      .join("\n");
    writeFileSync(
      join(dir, "misfits", id, "REFERENCE.md"),
      `# Warrant\n\n## Origin\n\n| Source | Key Work | Scope |\n| --- | --- | --- |\n${table}\n`,
    );
  }
}

// An engine root: packages/engines/<name> and packages/composites/<name>, each
// a package.json + REFERENCES.md; a composite lists its members as
// @chbrain/khai-engine-* dependencies.
function engineRoot(dir, engines, composites = {}) {
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ name: "@chbrain/fixture-mono", version: "0.0.0" }),
  );
  const emit = (kind, name, rows, deps) => {
    const base = join(dir, "packages", kind, name);
    mkdirSync(base, { recursive: true });
    writeFileSync(
      join(base, "package.json"),
      JSON.stringify({
        name: `@chbrain/khai-${kind === "engines" ? "engine" : "composite"}-${name}`,
        version: "0.0.0",
        dependencies: Object.fromEntries(
          (deps || []).map((d) => [`@chbrain/khai-engine-${d}`, "^0.0.0"]),
        ),
        khai: { engine: name, type: "process" },
      }),
    );
    const table = rows
      .map(([source, work, scope]) => `| **${source}** | _"${work}"_ | ${scope} |`)
      .join("\n");
    writeFileSync(
      join(base, "REFERENCES.md"),
      `# Ref\n\n## Origin\n\n| Source | Key Work | Scope |\n| --- | --- | --- |\n${table}\n`,
    );
  };
  for (const [name, rows] of Object.entries(engines)) emit("engines", name, rows);
  for (const [name, { rows, deps }] of Object.entries(composites))
    emit("composites", name, rows, deps);
}

let dir;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "khai-overlap-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

// --- the shared-work wall ---------------------------------------------------

describe.skipIf(DORMANT)("overlap: a work belongs to one unit", () => {
  it("flags the same (scholar, work) carrying two units", () => {
    collectionHouse(dir, {
      one: [["Deci", "Effects of Externally Mediated Rewards", "The spine."]],
      two: [["Deci", "Effects of Externally Mediated Rewards (1971)", "Also the spine."]],
    });
    const found = overlap.findOverlaps(dir);
    expect(found).toHaveLength(1);
    expect(found[0].units).toEqual(["one", "two"]);
    expect(overlap.pairsOf(found)[0].pair).toBe("one + two");
  });

  it("does not flag the same scholar across different works", () => {
    collectionHouse(dir, {
      one: [["Deci", "Effects of Externally Mediated Rewards", "The spine."]],
      two: [["Deci", "Intrinsic Motivation and Self-Determination", "Another work."]],
    });
    expect(overlap.findOverlaps(dir)).toEqual([]);
  });

  it("exempts declared canon and marked contrast citations", () => {
    collectionHouse(
      dir,
      {
        one: [
          ["Kahneman & Tversky", "Prospect Theory: An Analysis of Decision under Risk", "Canon."],
          ["Sterman", "Business Dynamics", "The spine."],
        ],
        two: [
          ["Kahneman & Tversky", "Prospect Theory: An Analysis of Decision under Risk", "Canon."],
          ["Sterman", "Business Dynamics", "Cited to distinguish the neighbour."],
        ],
      },
      { workPolicy: { canon: ["Prospect Theory: An Analysis of Decision under Risk"] } },
    );
    expect(overlap.findOverlaps(dir)).toEqual([]);
  });

  it("computes the structural exit in an engine root: a composite citing its member's science", () => {
    engineRoot(
      dir,
      {
        atom: [["Bowen", "Family Therapy in Clinical Practice", "The spine."]],
        other: [["Bowen", "Family Therapy in Clinical Practice", "The same spine."]],
      },
      {
        stack: {
          rows: [["Bowen", "Family Therapy in Clinical Practice", "The layer read."]],
          deps: ["atom"],
        },
      },
    );
    const found = overlap.findOverlaps(dir);
    // The composite is exempt (it composes over atom); the two peer atoms
    // sharing one spine are still the finding.
    expect(found).toHaveLength(1);
    expect(found[0].units).toEqual(["atom", "other"]);
  });
});

// --- the advisory and the surname scan --------------------------------------

describe.skipIf(DORMANT)("overlap: pre-authoring instruments", () => {
  beforeEach(() => {
    collectionHouse(dir, {
      held: [
        ["Gary Becker", "Human Capital: A Theoretical and Empirical Analysis", "The spine."],
        [
          "Dale Miller & Monin",
          "Moral Credentials and the Expression of Prejudice",
          "The licence.",
        ],
      ],
    });
  });

  it("checkCandidate matches loosely: a shorter title still hits", () => {
    const hits = overlap.checkCandidate(dir, "Becker :: Human Capital");
    expect(hits).toHaveLength(1);
    expect(hits[0].match).toBe("prefix");
    expect(hits[0].unit).toBe("held");
  });

  it("checkCandidate given a bare surname reports clear — which is why scanSurname exists", () => {
    expect(overlap.checkCandidate(dir, "Becker")).toEqual([]);
  });

  it("scanSurname answers the question checkCandidate cannot", () => {
    const keys = overlap.scanSurname(dir, "becker");
    expect(keys).toHaveLength(1);
    expect(keys[0].key).toBe("Becker");
    expect(keys[0].resolved).toBe(false);
    expect(keys[0].rows[0].unit).toBe("held");
    // Exact key match, never substring: a different surname stays clear.
    expect(overlap.scanSurname(dir, "Beck")).toEqual([]);
  });

  it("scanSurname finds declared resolutions of a surname", () => {
    writeFileSync(
      join(dir, "khai-guard.config.json"),
      JSON.stringify({ scholarPolicy: { homonyms: { Miller: ["Dale", "Wendi"] } } }),
    );
    const keys = overlap.scanSurname(dir, "Miller");
    expect(keys.map((k) => k.key)).toEqual(["Miller (Dale)"]);
    expect(keys[0].resolved).toBe(true);
  });
});

// --- the namesake wall ------------------------------------------------------

describe.skipIf(DORMANT)("overlap: a declared surname may not appear unresolved", () => {
  it("flags a bare occurrence of a declared surname, and only that", () => {
    collectionHouse(
      dir,
      {
        one: [["Dale Miller", "Moral Credentials and the Expression of Prejudice", "Resolved."]],
        two: [["Miller & Shepperd", "Information Avoidance", "Left bare."]],
      },
      { scholarPolicy: { homonyms: { Miller: ["Dale", "Wendi"] } } },
    );
    const loose = overlap.findUnresolvedNamesakes(dir);
    expect(loose).toHaveLength(1);
    expect(loose[0].unit).toBe("two");
    expect(loose[0].scholar).toBe("Miller");
  });

  it("holds at zero when every occurrence resolves", () => {
    collectionHouse(
      dir,
      { one: [["Dale Miller", "Moral Credentials and the Expression of Prejudice", "Fine."]] },
      { scholarPolicy: { homonyms: { Miller: ["Dale", "Wendi"] } } },
    );
    expect(overlap.findUnresolvedNamesakes(dir)).toEqual([]);
  });
});

// --- roles: what a citation says it is doing -------------------------------

describe.skipIf(DORMANT)("overlap: a citation declares its role", () => {
  const role = (scope) =>
    overlap.roleOf({ scope, keyWork: "" }, { contrastMarkers: ["held clear"] });

  it("defaults to spine, because that is what every unmarked row already means", () => {
    expect(role("The social model proper.")).toBe("spine");
    expect(role("")).toBe("spine");
    expect(overlap.roleOf({}, {})).toBe("spine");
  });

  it("reads a declared prefix, in the punctuation the house actually writes", () => {
    expect(role("**Contrast.** The standing objection.")).toBe("contrast");
    expect(role("**Contrast:** The standing objection.")).toBe("contrast");
    expect(role("**Support.** The empirical replication.")).toBe("support");
    expect(role("  **support.** lowercase and indented")).toBe("support");
  });

  it("only a LEAD prefix declares — a mid-cell mention is prose, not a claim", () => {
    expect(role("A study of contrast. Also of support.")).toBe("spine");
  });

  it("wants the closing punctuation, because emphasis is gone by the time it reads", () => {
    // The Origin reader strips emphasis, so "**Contrast** the objection" arrives
    // as "Contrast the objection" -- indistinguishable from prose. Requiring the
    // period or colon is what keeps "Support for the model is broad" a spine.
    expect(role("**Contrast** the standing objection")).toBe("spine");
    expect(role("Support for the model is broad.")).toBe("spine");
  });

  it("still reads the legacy vocabulary, so rows written before the prefixes keep their meaning", () => {
    expect(role("The neighbour, held clear.")).toBe("contrast");
  });
});

describe.skipIf(DORMANT)("overlap: only a spine collides", () => {
  const work = ["Oliver", "The Politics of Disablement", "The social model proper."];
  const asContrast = ["Oliver", "The Politics of Disablement", "**Contrast.** The engine's bound."];
  const asSupport = [
    "Oliver",
    "The Politics of Disablement",
    "**Support.** Corroborates the reading.",
  ];

  it("flags two spines, which is the duplication the rule exists for", () => {
    engineRoot(dir, { disability: [work], illness: [work] });
    expect(overlap.findOverlaps(dir).map((o) => o.units)).toEqual([["disability", "illness"]]);
  });

  it("clears a spine beside a contrast — a boundary citation is a second use, not a restaging", () => {
    engineRoot(dir, { disability: [work], illness: [asContrast] });
    expect(overlap.findOverlaps(dir)).toEqual([]);
  });

  it("clears a spine beside a support, the case the two-role shape could not express", () => {
    engineRoot(dir, { disability: [work], illness: [asSupport] });
    expect(overlap.findOverlaps(dir)).toEqual([]);
  });

  it("clears two non-spines, since neither took its mechanism from the work", () => {
    engineRoot(dir, { disability: [asSupport], illness: [asContrast] });
    expect(overlap.findOverlaps(dir)).toEqual([]);
  });

  it("reports the role on a candidate check, so the instrument answers before authoring", () => {
    engineRoot(dir, { illness: [asContrast] });
    const [hit] = overlap.checkCandidate(dir, "Oliver :: The Politics of Disablement");
    expect(hit.role).toBe("contrast");
    // The two-role field is kept for callers written against the old shape.
    expect(hit.contrast).toBe(true);
  });
});

// --- the support vocabulary, symmetric with contrast ------------------------
//
// The prefix declares a role at the HEAD of a cell, which is right for a cell
// being written now and wrong for the hundreds already written where the phrase
// sits mid-sentence. The marker form is how those cells declare, and the point of
// the change is that both forms reach the SAME wall: a house that filled this gap
// with its own list had one instrument reading it and the wall not, which is
// worse than either answer alone.

describe.skipIf(!SYMMETRIC)("overlap: a house declares its support vocabulary", () => {
  const withPolicy = (scope, policy) => overlap.roleOf({ scope, keyWork: "" }, policy);

  it("reads a declared supporting marker anywhere in the cell, not only leading", () => {
    const policy = { supportingMarkers: ["cited as background", "(background)"] };
    expect(withPolicy("cited as background", policy)).toBe("support");
    expect(withPolicy("The leverage that sets the stage (background)", policy)).toBe("support");
  });

  it("falls back to a default vocabulary, as contrast does", () => {
    expect(withPolicy("Cited as background for the reading.", {})).toBe("support");
    expect(withPolicy("background, not the spine", {})).toBe("support");
  });

  it("keeps prose a spine: a marker is a phrase, not a word", () => {
    // The failure that would make the vocabulary useless is a cell mentioning
    // the idea in passing being read as a claim about it.
    expect(withPolicy("Support for the model is broad.", {})).toBe("spine");
    expect(withPolicy("The background to the whole literature.", {})).toBe("spine");
  });

  it("declaring a list REPLACES the default rather than extending it", () => {
    // Same contract as contrastMarkers, so a house that narrows its vocabulary
    // gets the narrowing it asked for.
    const policy = { supportingMarkers: ["(background)"] };
    // The dropped phrase no longer declares anything...
    expect(withPolicy("cited as background", policy)).toBe("spine");
    // ...and the kept one still does.
    expect(withPolicy("held (background)", policy)).toBe("support");
  });

  it("loadWorkPolicy returns the vocabulary, so one policy read serves both roles", () => {
    writeFileSync(
      join(dir, "khai-guard.config.json"),
      JSON.stringify({ workPolicy: { supportingMarkers: ["Cited As Background"] } }),
    );
    const policy = overlap.loadWorkPolicy(dir);
    expect(policy.supportingMarkers).toEqual(["cited as background"]);
    expect(Array.isArray(policy.contrastMarkers)).toBe(true);
  });
});

describe.skipIf(!SYMMETRIC)("overlap: a marker-declared support clears the wall", () => {
  // The one that matters. A marker used to exempt a house's own instrument and
  // not this wall; both now answer the same.
  const work = ["Minsky", "Stabilizing an Unstable Economy", "The instability hypothesis."];
  const asSupport = [
    "Minsky",
    "Stabilizing an Unstable Economy",
    "Cited as background for the leverage that sets the stage.",
  ];

  it("flags two spines", () => {
    engineRoot(dir, { calm: [work], deflation: [work] });
    expect(overlap.findOverlaps(dir).map((o) => o.units)).toEqual([["calm", "deflation"]]);
  });

  it("clears a spine beside a marker-declared background", () => {
    engineRoot(dir, { calm: [work], deflation: [asSupport] });
    expect(overlap.findOverlaps(dir)).toEqual([]);
  });

  it("clears from either side, since one side saying it is not a spine answers the rule", () => {
    engineRoot(dir, { calm: [asSupport], deflation: [work] });
    expect(overlap.findOverlaps(dir)).toEqual([]);
  });
});
