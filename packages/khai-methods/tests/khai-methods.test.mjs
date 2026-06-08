import { describe, it, expect, afterEach } from "vitest";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { listMethods, loadMethod, listMethodsByType } from "../lib/index.mjs";

describe("khai-methods registry", () => {
  it("lists all methods", () => {
    const methods = listMethods();
    expect(methods.length).toBeGreaterThan(0);
  });

  it("every method has required fields", () => {
    for (const m of listMethods()) {
      expect(m.id, `${m.id}: id`).toMatch(/^[a-z][a-z0-9-]+$/);
      expect(m.name, `${m.id}: name`).toBeTruthy();
      expect(m.type, `${m.id}: type`).toBeTruthy();
      expect(Array.isArray(m.invented_by), `${m.id}: invented_by`).toBe(true);
      expect(Array.isArray(m.prompts), `${m.id}: prompts`).toBe(true);
      expect(m.prompts.length, `${m.id}: at least one prompt`).toBeGreaterThan(0);
      expect(m.body, `${m.id}: body`).toBeTruthy();
    }
  });

  it("every prompt has key, label, and question", () => {
    for (const m of listMethods()) {
      for (const p of m.prompts) {
        expect(p.key, `${m.id} prompt key`).toMatch(/^[a-z][a-z0-9_]*$/);
        expect(p.label, `${m.id} prompt label`).toBeTruthy();
        expect(p.question, `${m.id} prompt question`).toBeTruthy();
      }
    }
  });

  it("loads retro-4ls by id", () => {
    const m = loadMethod("retro-4ls");
    expect(m).not.toBeNull();
    expect(m.name).toBe("4 L's Retrospective");
    expect(m.prompts.map((p) => p.key)).toEqual(["liked", "learned", "lacked", "longed_for"]);
    expect(m.invented_by.length).toBeGreaterThan(0);
  });

  it("returns null for unknown id", () => {
    expect(loadMethod("does-not-exist")).toBeNull();
  });

  it("filters by type", () => {
    const retros = listMethodsByType("retrospective");
    expect(retros.length).toBeGreaterThan(0);
    expect(retros.every((m) => m.type === "retrospective")).toBe(true);
  });

  it("prompt keys are unique within each method", () => {
    for (const m of listMethods()) {
      const keys = m.prompts.map((p) => p.key);
      expect(new Set(keys).size, `${m.id}: duplicate prompt keys`).toBe(keys.length);
    }
  });
});

// parseMethod must drop a malformed file rather than throw, so one bad file
// cannot take down the whole registry (PR #277). Dormant until the fix lands on
// main -- probe lib/index.mjs for the guard's comment, per the cli.test.mjs
// convention.
const METHODS_DORMANT = !readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "lib", "index.mjs"),
  "utf8",
).includes("dropped by the .filter(Boolean)");

describe.skipIf(METHODS_DORMANT)("khai-methods registry - malformed files", () => {
  const methodsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "methods");
  const badFile = join(methodsDir, "_malformed_test.md");
  afterEach(() => rmSync(badFile, { force: true }));

  it("skips a file with malformed YAML frontmatter instead of throwing", () => {
    writeFileSync(badFile, "---\nid: x: y:\n  name: [unclosed\n---\nbody\n");
    expect(() => listMethods()).not.toThrow();
    // the bad file is dropped, and the valid registry is still readable
    expect(listMethods().some((m) => m.id === "_malformed_test")).toBe(false);
    expect(listMethods().length).toBeGreaterThan(0);
  });
});
