import { describe, it, expect } from "vitest";
import { stripFrontmatter } from "../lib/aggregator.mjs";

describe("aggregator", () => {
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
