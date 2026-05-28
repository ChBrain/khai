import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import MarkdownIt from "markdown-it";
import { loadArchitectureSpecs, loadFixtures } from "./helpers/load-spec.js";
import { parse } from "./helpers/parse-frontmatter.js";

const repoRoot = join(fileURLToPath(import.meta.url), "..", "..");
const md = new MarkdownIt();

/**
 * Check that all relative .md link targets in a markdown file exist
 * in the same directory as the file, and that #anchor targets exist
 * in the rendered HTML.
 */
function checkLinks(
  filePath: string,
  text: string,
  fileDir: string,
  html: string
): string[] {
  const errors: string[] = [];

  // Extract markdown links: [text](target)
  const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(text)) !== null) {
    const target = m[2];

    if (target.startsWith("#")) {
      // Anchor link - check it exists in rendered HTML
      const anchor = target.slice(1);
      // markdown-it renders id="anchor" on headings
      if (!html.includes(`id="${anchor}"`)) {
        errors.push(`${filePath}: anchor "${target}" not found in rendered output`);
      }
    } else if (target.endsWith(".md") && !target.startsWith("http")) {
      // Relative .md link - check file exists
      const targetPath = join(fileDir, target);
      if (!existsSync(targetPath)) {
        errors.push(`${filePath}: relative link "${target}" target does not exist at ${targetPath}`);
      }
    }
  }

  return errors;
}

function assertMarkdownOk(filePath: string, text: string, fileDir: string): void {
  // Parse with markdown-it - should not throw
  let html: string;
  expect(() => {
    html = md.render(text);
  }, `${filePath}: markdown-it must parse without error`).not.toThrow();

  // Check links
  const { body } = parse(text);
  const errors = checkLinks(filePath, body, fileDir, html!);
  expect(errors, errors.join("\n")).toHaveLength(0);
}

describe("markdown: architecture/*.md", () => {
  const files = loadArchitectureSpecs(repoRoot);
  const archDir = join(repoRoot, "architecture");

  it.skipIf(files.length === 0)("loads at least one file (skipped until khai-2 lands spec files)", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file.path} parses cleanly and has no broken links`, () => {
      assertMarkdownOk(file.path, file.text, archDir);
    });
  }
});

describe("markdown: valid fixtures", () => {
  const files = loadFixtures(repoRoot, "valid");
  const validDir = join(repoRoot, "tests", "fixtures", "valid");

  for (const file of files) {
    it(`${file.path} parses cleanly and has no broken links`, () => {
      assertMarkdownOk(file.path, file.text, validDir);
    });
  }
});

describe("markdown: invalid fixtures - bad-markdown-broken.md must fail link check", () => {
  const files = loadFixtures(repoRoot, "invalid").filter((f) =>
    f.path.includes("bad-markdown-broken")
  );

  it("loads bad-markdown-broken fixture", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file.path} has at least one broken link`, () => {
      const invalidDir = join(repoRoot, "tests", "fixtures", "invalid");
      const { body } = parse(file.text);
      const html = md.render(file.text);
      const errors = checkLinks(file.path, body, invalidDir, html);
      expect(
        errors.length,
        `${file.path}: expected broken link errors but found none`
      ).toBeGreaterThan(0);
    });
  }
});
