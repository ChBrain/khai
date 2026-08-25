import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { buildScienceIndex, verifyScienceIndex, collectScience, surnames } from "../index.mjs";

// The science index build-drift gate: the committed docs/SCIENCE.md must equal
// what the build produces from every engine's REFERENCES.md Origin table, so a
// stale or hand-edited index is caught at the content PR rather than surfacing
// only when the forward map is next consulted.
describe("conformance: science index build-drift gate", () => {
  let dir;

  const references = (rows) =>
    [
      "# X: Reference",
      "",
      "## Line of Work",
      "",
      "What it models.",
      "",
      "## Origin",
      "",
      "| Source | Key Work | Scope |",
      "| :--- | :--- | :--- |",
      ...rows.map(([s, w, sc]) => `| ${s} | ${w} | ${sc} |`),
      "",
      "## Restrictions",
      "",
      "What it refuses.",
      "",
      "## Encoding",
      "",
      "Source to constraint.",
      "",
    ].join("\n");

  // type: null omits the type entirely (an untyped infra engine like spine).
  const addEngine = (id, opts = {}) => {
    const type = "type" in opts ? opts.type : "process";
    const khai = { engine: id };
    if (type) {
      khai.type = type;
      khai.anchor = `${type}_${id}.md`;
    }
    const eDir = join(dir, "packages", "engines", id);
    mkdirSync(eDir, { recursive: true });
    writeFileSync(
      join(eDir, "package.json"),
      JSON.stringify({ name: `@chbrain/khai-engine-${id}`, khai }),
    );
    writeFileSync(join(eDir, "REFERENCES.md"), opts.references ?? references(opts.rows));
  };

  beforeEach(() => {
    dir = join(tmpdir(), `khai-science-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(dir, "docs"), { recursive: true });
    addEngine("alpha", {
      rows: [["**Amos Tversky & Daniel Kahneman**", "_A_ (1974)", "Heuristics."]],
    });
    addEngine("beta", {
      type: "position",
      rows: [["**Kahneman & Tversky**", "_B_ (1979)", "Prospect theory."]],
    });
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("passes when the index is a fresh build", () => {
    buildScienceIndex(dir);
    expect(verifyScienceIndex(dir)).toEqual([]);
  });

  it("reports drift when the index is missing", () => {
    expect(verifyScienceIndex(dir).length).toBe(1);
  });

  it("flags a hand-edited index", () => {
    buildScienceIndex(dir);
    const p = join(dir, "docs", "SCIENCE.md");
    writeFileSync(p, readFileSync(p, "utf8").replace("Heuristics.", "Hand-edited."));
    expect(verifyScienceIndex(dir).length).toBe(1);
  });

  it("flags a stale index when an engine is added but not rebuilt", () => {
    buildScienceIndex(dir);
    addEngine("gamma", { rows: [["**Erving Goffman**", "_C_ (1959)", "Front stage."]] });
    expect(verifyScienceIndex(dir).length).toBe(1);
  });

  // What the drift error SAYS. "Out of date" is a sufficient exit code and a
  // useless report: a reader who cannot see what drifted cannot tell a stale
  // index from a builder that changed under them.

  // A rendered row is a whole table line, so these fixtures use a long scope --
  // the reporting only has to be careful when the difference is far from the
  // start of the line, and a short fixture would pass either implementation.
  const LONG = `The engine's own account, stated at the length these rows run to in the real index, ${"padding ".repeat(20)}and then the part that differs: ORIGINAL.`;

  const withLongScope = (word) => {
    addEngine("delta", {
      rows: [["**Mary Douglas**", "_D_ (1966)", LONG.replace("ORIGINAL", word)]],
    });
  };

  it("names the line and column of the first difference", () => {
    withLongScope("ORIGINAL");
    buildScienceIndex(dir);
    const p = join(dir, "docs", "SCIENCE.md");
    writeFileSync(p, readFileSync(p, "utf8").replace("ORIGINAL", "CHANGED!"));

    const [error] = verifyScienceIndex(dir);
    expect(error).toMatch(/is out of date; run `khai-tests science build`/);
    expect(error).toMatch(/first difference at line \d+, column \d+:/);
    expect(error).toMatch(/committed: /);
    expect(error).toMatch(/built: {5}/);
  });

  it("windows the excerpt on the difference, not on the head of the line", () => {
    // The regression this exists for: excerpting from the start of the line
    // printed the same padding twice, under "committed:" and under "built:",
    // and reported a difference the reader could not see.
    withLongScope("ORIGINAL");
    buildScienceIndex(dir);
    const p = join(dir, "docs", "SCIENCE.md");
    writeFileSync(p, readFileSync(p, "utf8").replace("ORIGINAL", "CHANGED!"));

    const [error] = verifyScienceIndex(dir);
    const committed = /committed: (.*)/.exec(error)[1];
    const built = /built: {5}(.*)/.exec(error)[1];

    expect(committed).not.toEqual(built);
    expect(committed).toContain("CHANGED!");
    expect(built).toContain("ORIGINAL");
    // Elision is marked, so nobody reads the excerpt as the whole line.
    expect(committed.startsWith("…")).toBe(true);
  });

  it("says (end of file) for a side that has no such line", () => {
    withLongScope("ORIGINAL");
    const built = buildScienceIndex(dir);
    const lines = built.split("\n");
    writeFileSync(join(dir, "docs", "SCIENCE.md"), lines.slice(0, -2).join("\n"));

    const [error] = verifyScienceIndex(dir);
    expect(error).toContain("committed: (end of file)");
  });

  it("names the index rather than the drift when there is no index at all", () => {
    const [error] = verifyScienceIndex(dir);
    expect(error).toMatch(/is missing; run `khai-tests science build`/);
    expect(error).not.toContain("first difference");
  });

  it("collates one scholar across engines however authored", () => {
    const { records } = collectScience(dir);
    const kahneman = records.filter((r) => r.surname === "Kahneman");
    // Kahneman is written two ways across alpha and beta; both collate.
    expect(new Set(kahneman.map((r) => r.engine))).toEqual(new Set(["alpha", "beta"]));
  });

  it("skips infra engines that carry no type", () => {
    addEngine("spine", { type: null, references: "# spine\n\n## Origin\n\nNo table.\n" });
    // build must not throw on the untyped engine; it is simply absent from the map.
    buildScienceIndex(dir);
    const { byEngine } = collectScience(dir);
    expect(byEngine.some((e) => e.engine === "spine")).toBe(false);
  });

  it("throws when a typed engine has no parseable Origin table", () => {
    addEngine("broken", { references: "# broken\n\n## Origin\n\nProse only, no table.\n" });
    expect(() => collectScience(dir)).toThrow(/no parseable Origin table/);
  });

  it("surnames() splits multi-author cells to their last names", () => {
    expect(surnames("Mayer, Davis & Schoorman")).toEqual(["Mayer", "Davis", "Schoorman"]);
    expect(surnames("Dan P. McAdams et al.")).toEqual(["McAdams"]);
  });

  // One surname per scholar named, not per time they are named. A Source cell
  // that pairs an author with a paper of theirs whose full author list repeats
  // them is the ordinary way to cite a primary and a specific work together, and
  // without a distinct pass it emits that scholar twice -- rendering the engine's
  // row twice under them in the index.
  it("surnames() names a repeated scholar once", () => {
    expect(surnames("Myles Allen; Stott, Stone & Allen")).toEqual(["Allen", "Stott", "Stone"]);
    expect(surnames("Jack W. Brehm; Sharon S. Brehm; Miron & Brehm")).toEqual(["Brehm", "Miron"]);
  });

  it("indexes an engine once under a scholar its Source cell repeats", () => {
    addEngine("repeats", {
      references: references([
        ["Myles Allen; Stott, Stone & Allen", "Attribution (2004)", "The seam."],
      ]),
    });
    const { records } = collectScience(dir);
    const allen = records.filter((r) => r.surname === "Allen" && r.engine === "repeats");
    expect(allen).toHaveLength(1);
  });
});

// Dormant until the composite-scan source lands: the probe checks whether
// collectScience walks packages/composites/* at all.
const COMPOSITE_DORMANT = !readFileSync(
  new URL("../src/science.mjs", import.meta.url),
  "utf8",
).includes('"composites"');

describe.skipIf(COMPOSITE_DORMANT)("conformance: composites index like engines", () => {
  let dir;

  const references = (rows) =>
    [
      "# X: Reference",
      "",
      "## Line of Work",
      "",
      "What it models.",
      "",
      "## Origin",
      "",
      "| Source | Key Work | Scope |",
      "| :--- | :--- | :--- |",
      ...rows.map(([s, w, sc]) => `| ${s} | ${w} | ${sc} |`),
      "",
      "## Restrictions",
      "",
      "What it refuses.",
      "",
      "## Encoding",
      "",
      "Source to constraint.",
      "",
    ].join("\n");

  const addPackage = (kind, id, rows) => {
    const pDir = join(dir, "packages", kind, id);
    mkdirSync(pDir, { recursive: true });
    writeFileSync(
      join(pDir, "package.json"),
      JSON.stringify({
        name: `@chbrain/khai-${kind === "composites" ? "composite" : "engine"}-${id}`,
        khai: { engine: id, type: "process", anchor: `process_${id}.md` },
      }),
    );
    writeFileSync(join(pDir, "REFERENCES.md"), references(rows));
  };

  beforeEach(() => {
    dir = join(tmpdir(), `khai-science-c-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(dir, "docs"), { recursive: true });
    addPackage("engines", "alpha", [["**Erving Goffman**", "_A_ (1971)", "Remedial moves."]]);
    addPackage("composites", "combo", [["**Erving Goffman**", "_A_ (1971)", "The exchange."]]);
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("collects a composite's Origin rows, tagged by layer", () => {
    const { byEngine, records } = collectScience(dir);
    const combo = byEngine.find((e) => e.engine === "combo");
    expect(combo?.layer).toBe("composite");
    expect(byEngine.find((e) => e.engine === "alpha")?.layer).toBe("atom");
    // The shared scholar collates across the layers.
    const goffman = records.filter((r) => r.surname === "Goffman");
    expect(new Set(goffman.map((r) => r.engine))).toEqual(new Set(["alpha", "combo"]));
  });

  it("italicises composites in the rendered index and passes its own drift gate", () => {
    const text = buildScienceIndex(dir);
    expect(text).toContain("_combo_");
    expect(text).not.toContain("_alpha_");
    expect(verifyScienceIndex(dir)).toEqual([]);
  });

  it("flags a stale index when a composite is added but not rebuilt", () => {
    buildScienceIndex(dir);
    addPackage("composites", "duet", [["**Aaron Lazare**", "_B_ (2004)", "The offer."]]);
    expect(verifyScienceIndex(dir).length).toBe(1);
  });
});

// Note: the committed docs/SCIENCE.md IS gated per-PR against the live engines,
// by science-index.test.mjs. This note said the opposite for as long as the
// index existed, and the reasoning was sound: the index is a shared generated
// artifact, coupling every engine PR to it collides across concurrent PRs, and
// it would instead be refreshed out of band with `khai-tests science build` (a
// periodic/post-batch reindex).
//
// The out-of-band reindex is the part that did not survive contact. Nothing ran
// it -- no hook, no ci.yml job, no test -- so the `disability` engine shipped
// and its rows were never built in, and the index sat a whole engine stale
// (374 engines / 1703 scholars against a tree holding 375 / 1706) until an
// unrelated PR happened to run the builder. An unenforced convention decayed,
// which is what unenforced conventions do.
//
// The collision cost the note warned about is real and was measured before the
// gate was kept, not argued about:
//
//   - two PRs each EDITING an Origin scope -> the indexes merge cleanly AND the
//     merge equals a fresh build, so both stay green;
//   - two PRs each ADDING a unit           -> 13 conflict hunks, because both
//     rewrite the counts header and interleave rows.
//
// So the cost lands only on concurrent additions, and it is mechanical: take
// either side, run `npx khai-tests science build`, commit. That is the trade
// this house took -- a rare scripted conflict over an index that rots in
// silence. The synthetic drift tests above still prove the builder itself is
// correct, which is a different thing from proving the artifact is current.

// Dormant until the deterministic scholar filter lands in src: the probe checks
// whether a non-author idiom ("Boundary of the effect") still manufactures a
// pseudo-scholar. Source (the surnames() change) lands first; this activates
// automatically once it does -- the same "dormant until the source lands" idiom.
const FILTER_DORMANT = surnames("Boundary of the effect").length !== 0;

describe.skipIf(FILTER_DORMANT)("conformance: surnames() is a deterministic scholar filter", () => {
  it("recovers a real author hidden behind a qualifier", () => {
    // The qualifier is a disambiguating tag, not a name; the old rule kept the
    // tag ("(communication)") and lost the author.
    expect(surnames("Brooks (communication)")).toEqual(["Brooks"]);
    expect(surnames("Surowiecki (counterpoint)")).toEqual(["Surowiecki"]);
    expect(surnames("Twain (attr.)")).toEqual(["Twain"]);
  });

  it("drops non-author idioms structurally (a surname is a proper noun)", () => {
    // Honest-note phrases, mechanism labels and bare years are not scholars, and
    // are dropped by the uppercase-initial invariant with no list to maintain.
    expect(surnames("Boundary of the effect")).toEqual([]);
    expect(surnames("Robustness of the effect")).toEqual([]);
    expect(surnames("The individual calculus")).toEqual([]);
    expect(surnames("Willful blindness")).toEqual([]);
    expect(surnames("Nobel 2001")).toEqual([]);
  });

  it("drops the one declared placeholder, however qualified", () => {
    expect(surnames("Practitioner")).toEqual([]);
    expect(surnames("Practitioner (medicine)")).toEqual([]);
  });

  it("still collates real authors and institutions, particles handled", () => {
    expect(surnames("Kahneman & Tversky")).toEqual(["Kahneman", "Tversky"]);
    expect(surnames("Mayer, Davis & Schoorman")).toEqual(["Mayer", "Davis", "Schoorman"]);
    // a real author survives alongside dropped field markers in a mixed cell
    expect(surnames("Cummings; aviation & medicine")).toEqual(["Cummings"]);
    // an institution keeps its capitalised head; a particled name keeps its surname
    expect(surnames("The Joint Commission")).toEqual(["Commission"]);
    expect(surnames("John von Neumann")).toEqual(["Neumann"]);
  });
});

// The atoms column: which engines a composite joins. The dependency graph is the
// citation graph, so the pairing is read from package.json rather than kept in a
// second list that could drift from it.
const ATOMS_DORMANT = !readFileSync(
  new URL("../src/science.mjs", import.meta.url),
  "utf8",
).includes("function atomsOf");

describe.skipIf(ATOMS_DORMANT)("conformance: a composite names the atoms it wires", () => {
  let dir;

  const references = (rows) =>
    [
      "# X: Reference",
      "",
      "## Origin",
      "",
      "| Source | Key Work | Scope |",
      "| :--- | :--- | :--- |",
      ...rows.map(([s, w, sc]) => `| ${s} | ${w} | ${sc} |`),
      "",
    ].join("\n");

  const addPackage = (kind, id, dependencies) => {
    const pDir = join(dir, "packages", kind, id);
    mkdirSync(pDir, { recursive: true });
    writeFileSync(
      join(pDir, "package.json"),
      JSON.stringify({
        name: `@chbrain/khai-${kind === "composites" ? "composite" : "engine"}-${id}`,
        dependencies,
        khai: { engine: id, type: "process", anchor: `process_${id}.md` },
      }),
    );
    writeFileSync(
      join(pDir, "REFERENCES.md"),
      references([["**Erving Goffman**", "_A_ (1959)", "Front stage."]]),
    );
  };

  beforeEach(() => {
    dir = join(tmpdir(), `khai-atoms-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(dir, "docs"), { recursive: true });
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("reads a composite's atoms from its declared dependencies", () => {
    addPackage("engines", "alpha", {});
    addPackage("engines", "beta", {});
    addPackage("composites", "duet", {
      "@chbrain/khai-arch": "^0.1.0",
      "@chbrain/khai-engine-beta": "^0.1.0",
      "@chbrain/khai-engine-alpha": "^0.1.0",
    });
    const { byEngine } = collectScience(dir);
    // Sorted by name, and khai-arch is not an atom.
    expect(byEngine.find((e) => e.engine === "duet").atoms).toEqual([
      { name: "alpha", layer: "atom" },
      { name: "beta", layer: "atom" },
    ]);
  });

  it("gives an atom engine no atoms, because it combines nothing", () => {
    addPackage("engines", "alpha", { "@chbrain/khai-arch": "^0.1.0" });
    expect(collectScience(dir).byEngine.find((e) => e.engine === "alpha").atoms).toEqual([]);
  });

  it("resolves a composite that wires composites", () => {
    // love-hate is the corpus's one second-order composite: it wires the love
    // and hate composites, not engines. Matching only khai-engine- would render
    // it as combining nothing.
    addPackage("composites", "love", {});
    addPackage("composites", "hate", {});
    addPackage("composites", "love-hate", {
      "@chbrain/khai-composite-love": "^0.1.0",
      "@chbrain/khai-composite-hate": "^0.1.0",
    });
    expect(collectScience(dir).byEngine.find((e) => e.engine === "love-hate").atoms).toEqual([
      { name: "hate", layer: "composite" },
      { name: "love", layer: "composite" },
    ]);
  });

  it("renders the atoms column, italicising a composite atom", () => {
    addPackage("engines", "alpha", {});
    addPackage("composites", "duet", { "@chbrain/khai-engine-alpha": "^0.1.0" });
    addPackage("composites", "pair", { "@chbrain/khai-composite-duet": "^0.1.0" });
    const md = buildScienceIndex(dir);
    expect(md).toContain("| Engine | Root | Composition | Atoms | Wires into | Sources |");
    expect(md).toMatch(/\| _duet_ \|.*\| `alpha` \|/);
    expect(md).toMatch(/\| _pair_ \|.*\| _`duet`_ \|/);
  });
});

describe.skipIf(ATOMS_DORMANT)("conformance: the live corpus resolves every composite", () => {
  it("leaves no composite claiming to combine nothing", () => {
    const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
    const { byEngine } = collectScience(REPO);
    const composites = byEngine.filter((e) => e.layer === "composite");
    expect(composites.length).toBeGreaterThan(0);
    expect(composites.filter((e) => e.atoms.length === 0).map((e) => e.engine)).toEqual([]);
  });
});
