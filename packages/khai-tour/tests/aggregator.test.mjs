import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { stripFrontmatter, findFiles } from "../lib/aggregator.mjs";
import * as aggregator from "../lib/aggregator.mjs";

// Structural, not textual: ask the module whether the export exists, rather than
// reading the source for a string that a comment could satisfy. Dormant until
// the source PR lands (rule 3).
const DORMANT = typeof aggregator.toPosixPath !== "function";

describe("aggregator", () => {
  describe("findFiles: the Playwright guide never goes on tour", () => {
    let dir;
    beforeAll(() => {
      dir = mkdtempSync(join(tmpdir(), "khai-tour-find-"));
      mkdirSync(join(dir, "engine"), { recursive: true });
      writeFileSync(join(dir, "engine", "position_x.md"), "# x");
      writeFileSync(join(dir, "engine", "playwright_instructions.md"), "# guide");
    });
    afterAll(() => rmSync(dir, { recursive: true, force: true }));

    it("excludes playwright_instructions.md even when the glob matches it", async () => {
      const files = await findFiles(dir, "engine/*.md");
      expect(files).toContain("engine/position_x.md");
      expect(files).not.toContain("engine/playwright_instructions.md");
    });
  });

  describe.skipIf(DORMANT)("toPosixPath: one spelling of a path, on every host", () => {
    const toPosixPath = (...args) => aggregator.toPosixPath(...args);

    it("rewrites Windows separators", () => {
      expect(toPosixPath("engine\\position_x.md", "win32")).toBe("engine/position_x.md");
    });

    it("leaves an already-POSIX path alone on Windows", () => {
      expect(toPosixPath("engine/position_x.md", "win32")).toBe("engine/position_x.md");
    });

    it("leaves a backslash alone on POSIX, where it is a legal filename character", () => {
      // The rewrite must NOT be unconditional: on Linux "weird\\name.md" is one
      // file, and turning it into a path would send readFileSync somewhere else.
      expect(toPosixPath("weird\\name.md", "linux")).toBe("weird\\name.md");
      expect(toPosixPath("weird\\name.md", "darwin")).toBe("weird\\name.md");
    });

    it("defaults to the running platform", () => {
      const native = process.platform === "win32" ? "a/b.md" : "a\\b.md";
      expect(toPosixPath("a\\b.md")).toBe(native);
    });

    it("makes the two platforms sort a mixed set identically", () => {
      // This is the whole point. "/" is 0x2F and "\\" is 0x5C, with the uppercase
      // letters between them, so the raw glob yields sort differently -- and that
      // sort is the order findFiles concatenates sections in.
      const winYield = ["engine\\a.md", "engineA.md", "engine\\b.md"];
      const posixYield = ["engine/a.md", "engineA.md", "engine/b.md"];

      expect([...winYield].sort()).not.toEqual([...posixYield].sort());

      const norm = (files, platform) => files.map((f) => toPosixPath(f, platform)).sort();
      expect(norm(winYield, "win32")).toEqual(norm(posixYield, "linux"));
      expect(norm(winYield, "win32")).toEqual(["engine/a.md", "engine/b.md", "engineA.md"]);
    });
  });

  describe("stripFrontmatter", () => {
    it("removes YAML frontmatter from markdown", () => {
      const input = `---
title: Test
author: Someone
---

# Content here
Some text.`;

      const expected = `# Content here
Some text.`;

      expect(stripFrontmatter(input)).toBe(expected);
    });

    it("preserves content without frontmatter", () => {
      const input = `# Content here
Some text.`;

      expect(stripFrontmatter(input)).toBe(input);
    });

    it("handles frontmatter with extra spacing", () => {
      const input = `---
title: Test
---

# Content`;

      const expected = `# Content`;

      expect(stripFrontmatter(input)).toBe(expected);
    });
  });
});
