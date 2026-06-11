import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { stripFrontmatter, findFiles } from "../lib/aggregator.mjs";

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
