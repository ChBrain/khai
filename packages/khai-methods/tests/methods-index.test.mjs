import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import {
  renderMethodsIndex,
  buildMethodsIndex,
  verifyMethodsIndex,
  METHODS_INDEX_PATH,
} from "../lib/methods-index.mjs";

// The methods index build-drift gate: the committed docs/METHODS.md must equal
// what the build produces from every method's frontmatter, so a stale or
// hand-edited index is caught at the PR rather than when the map is next read.
// Two layers: the pure renderer over synthetic methods (builder correctness),
// and the real committed doc against the live registry (staleness).

const method = (id, opts = {}) => ({
  id,
  name: opts.name ?? id.toUpperCase(),
  type: opts.type ?? "analysis",
  invented_by: opts.invented_by ?? [{ name: "Ada Lovelace" }],
  year: "year" in opts ? opts.year : 2001,
  source: "source" in opts ? opts.source : { title: "A Work" },
  prompts: opts.prompts ?? [
    { key: "one", label: "One" },
    { key: "two", label: "Two" },
  ],
});

describe("renderMethodsIndex: the pure renderer", () => {
  it("groups by type, sorted, with counts", () => {
    const text = renderMethodsIndex([
      method("gamma", { type: "planning" }),
      method("alpha", { type: "analysis" }),
      method("beta", { type: "analysis" }),
    ]);
    expect(text).toContain("### analysis (2)");
    expect(text).toContain("### planning (1)");
    // types sorted (analysis before planning), ids sorted within (alpha before beta)
    expect(text.indexOf("### analysis")).toBeLessThan(text.indexOf("### planning"));
    expect(text.indexOf("`alpha`")).toBeLessThan(text.indexOf("`beta`"));
  });

  it("links each method to its file and lists its prompt labels", () => {
    const text = renderMethodsIndex([method("scan", { name: "SCAN" })]);
    expect(text).toContain("[**SCAN**](../packages/khai-methods/methods/scan.md) (`scan`)");
    expect(text).toContain("Prompts: One · Two.");
  });

  it("renders the origin: inventors, year, and a linked source when it has a url", () => {
    const text = renderMethodsIndex([
      method("m", {
        invented_by: [{ name: "Grace Hopper" }],
        year: 1959,
        source: { title: "The Work", url: "https://example.com/w" },
      }),
    ]);
    expect(text).toContain("Grace Hopper (1959). [The Work](https://example.com/w).");
  });

  it("joins multiple inventors and rolls them up under By origin", () => {
    const text = renderMethodsIndex([
      method("duo", { invented_by: [{ name: "Mary Gorman" }, { name: "Ellen Gottesdiener" }] }),
    ]);
    expect(text).toContain("Mary Gorman & Ellen Gottesdiener");
    // Each inventor points at the method under By origin, sorted by name.
    expect(text).toContain("- **Ellen Gottesdiener**: `duo`");
    expect(text).toContain("- **Mary Gorman**: `duo`");
    expect(text.indexOf("**Ellen")).toBeLessThan(text.indexOf("**Mary"));
  });

  it("escapes link-text metacharacters, backslash first", () => {
    const text = renderMethodsIndex([method("m", { name: "Wei[rd]\\" })]);
    // brackets escaped so they cannot close the span; backslash escaped too.
    expect(text).toContain("Wei\\[rd\\]\\\\");
    expect(text).not.toContain("Wei[rd]");
  });

  it("is deterministic: the same registry renders byte-identically", () => {
    const input = [method("b"), method("a", { type: "planning" })];
    expect(renderMethodsIndex(input)).toBe(renderMethodsIndex(input));
  });

  it("carries the generated-file header so no one hand-edits it", () => {
    const text = renderMethodsIndex([method("m")]);
    expect(text).toContain("DO NOT EDIT BY HAND");
  });
});

describe("build / verify drift gate", () => {
  let dir;

  beforeEach(() => {
    dir = join(tmpdir(), `khai-methods-idx-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(dir, "docs"), { recursive: true });
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("passes when the index is a fresh build", () => {
    buildMethodsIndex(dir);
    expect(verifyMethodsIndex(dir)).toEqual([]);
  });

  it("reports drift when the index is missing", () => {
    expect(verifyMethodsIndex(dir).length).toBe(1);
  });

  it("flags a hand-edited index", () => {
    buildMethodsIndex(dir);
    const p = join(dir, METHODS_INDEX_PATH);
    writeFileSync(p, readFileSync(p, "utf8").replace("methods index", "hand-edited index"));
    expect(verifyMethodsIndex(dir).length).toBe(1);
  });
});

// The real committed doc, gated against the live registry: unlike docs/SCIENCE.md
// (whose index spans every engine package and so is refreshed out of band to
// avoid cross-PR collisions), the methods index is single-package — a method and
// the index ride the one methods lane — so the committed doc is safe to gate
// per-PR. A method change that forgets to rebuild the index fails here.
describe("the committed docs/METHODS.md is in sync", () => {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

  it("equals a fresh build from the live method frontmatter", () => {
    expect(verifyMethodsIndex(repoRoot)).toEqual([]);
  });
});
