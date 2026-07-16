import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { buildScienceIndex, verifyScienceIndex, collectScience, surnames } from "../index.mjs";

// The real repo root (packages/khai-tests/tests -> up three), so the committed
// index is gated against the actual engines, not only synthetic fixtures.
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

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
});

describe("conformance: the committed science index is in sync", () => {
  // The real gate: the docs/SCIENCE.md checked into the repo must equal a fresh
  // build from every engine's REFERENCES.md. Fails when an engine is added,
  // removed, or re-sourced without `khai-tests science build`.
  it("docs/SCIENCE.md matches a build from the live engines", () => {
    expect(verifyScienceIndex(REPO_ROOT)).toEqual([]);
  });
});
