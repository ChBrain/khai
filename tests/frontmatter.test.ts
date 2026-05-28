import { describe, it, expect, beforeAll } from "vitest";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ValidateFunction } from "ajv";
import { loadArchitectureSpecs, loadFixtures } from "./helpers/load-spec.js";
import { parse, loadValidator } from "./helpers/parse-frontmatter.js";
import { classify } from "./helpers/classify.js";

const repoRoot = join(fileURLToPath(import.meta.url), "..", "..");

let validate: ValidateFunction;

beforeAll(() => {
  validate = loadValidator(repoRoot);
});

describe("frontmatter: architecture/*.md", () => {
  const files = loadArchitectureSpecs(repoRoot);

  it.skipIf(files.length === 0)(
    "loads at least one file (skipped until khai-2 lands spec files)",
    () => {
      expect(files.length).toBeGreaterThan(0);
    },
  );

  for (const file of files) {
    const kind = classify(file);
    if (kind === "companion") continue;

    it(`${file.path} has valid YAML frontmatter`, () => {
      expect(
        () => parse(file.text),
        `${file.path}: frontmatter must parse without error`,
      ).not.toThrow();
      const { data } = parse(file.text);
      const valid = validate(data);
      expect(
        valid,
        `${file.path}: schema errors: ${JSON.stringify(validate.errors, null, 2)}`,
      ).toBe(true);
    });
  }
});

describe("frontmatter: valid fixtures", () => {
  const files = loadFixtures(repoRoot, "valid");

  for (const file of files) {
    const kind = classify(file);
    if (kind === "companion") continue;

    it(`${file.path} has valid YAML frontmatter`, () => {
      expect(() => parse(file.text)).not.toThrow();
      const { data } = parse(file.text);
      const valid = validate(data);
      expect(
        valid,
        `${file.path}: schema errors: ${JSON.stringify(validate.errors, null, 2)}`,
      ).toBe(true);
    });
  }
});

describe("frontmatter: invalid fixtures - bad-frontmatter-* must fail schema", () => {
  const files = loadFixtures(repoRoot, "invalid").filter((f) =>
    f.path.includes("bad-frontmatter-"),
  );

  it("loads at least one bad-frontmatter fixture", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file.path} fails schema validation`, () => {
      const { data } = parse(file.text);
      const valid = validate(data);
      expect(valid, `${file.path}: expected schema validation to fail but it passed`).toBe(false);
    });
  }
});
