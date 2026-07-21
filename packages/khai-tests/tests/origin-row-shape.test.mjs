// The Origin-row well-formedness wall: parseOriginTable silently drops a table
// row that is not exactly three cells, so a mistyped warrant row vanishes from
// the science index. originRowErrors catches such a row, and collectScience /
// collectCollectionScience throw on it. A meta engine (no khai.type) whose
// warrant is a two-column table is never parsed, so it never trips the wall.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { originRowErrors, collectScience } from "../src/science.mjs";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "science.mjs");
const DORMANT = !readFileSync(SRC, "utf8").includes("originRowErrors");

// A REFERENCES.md whose Origin carries the given raw table lines (header and
// separator prepended). Rows are raw strings so a malformed one can be injected.
const referencesDoc = (rows) =>
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
    ...rows,
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

describe.skipIf(DORMANT)("originRowErrors: malformed Origin rows", () => {
  it("flags a two-column data row", () => {
    const out = originRowErrors("| Smith | only two |");
    expect(out).toHaveLength(1);
    expect(out[0]).toContain("2 column");
    expect(out[0]).toContain("| Smith | only two |");
  });

  it("flags a four-column data row", () => {
    expect(originRowErrors("| Smith | Work | Scope | extra |")).toHaveLength(1);
  });

  it("passes a clean three-column table (header, separator, rows)", () => {
    const table = ["| Source | Key Work | Scope |", "| :--- | :--- | :--- |", "| Smith | W | S |"];
    expect(originRowErrors(table.join("\n"))).toEqual([]);
  });

  it("ignores the separator row and the header row", () => {
    expect(originRowErrors("| Source | Scope |\n| :--- | :--- |")).toEqual([]);
  });

  it("ignores prose lines and bare pipes", () => {
    expect(originRowErrors("Some prose about the warrant.\n\n|\n")).toEqual([]);
  });
});

describe.skipIf(DORMANT)("collectScience: gates a malformed Origin row", () => {
  let dir;

  const addEngine = (id, { type = "process", rows, references } = {}) => {
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
    writeFileSync(join(eDir, "REFERENCES.md"), references ?? referencesDoc(rows));
  };

  beforeEach(() => {
    dir = join(tmpdir(), `khai-origin-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(dir, { recursive: true });
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("throws, naming the engine, on a science engine with a two-column row", () => {
    addEngine("alpha", { rows: ["| Smith | dropped, only two |"] });
    expect(() => collectScience(dir)).toThrow(/alpha/);
  });

  it("does not throw for a clean three-column engine", () => {
    addEngine("beta", { rows: ["| Smith | Work | Scope |"] });
    expect(() => collectScience(dir)).not.toThrow();
    expect(collectScience(dir).byEngine).toHaveLength(1);
  });

  it("does not check a meta engine (no khai.type) whose warrant is two-column", () => {
    // A type-less engine is skipped before its Origin is parsed, exactly as it is
    // excluded from the science map, so its two-column warrant never trips the wall.
    addEngine("spine", {
      type: null,
      references: referencesDoc([]).replace(
        "| Source | Key Work | Scope |\n| :--- | :--- | :--- |",
        "| Source | Scope |\n| :--- | :--- |\n| ARCHITECTURE | The spine. |",
      ),
    });
    expect(() => collectScience(dir)).not.toThrow();
  });
});
