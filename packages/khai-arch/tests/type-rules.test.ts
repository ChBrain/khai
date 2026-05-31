import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadArchitectureSpecs, loadFixtures } from "./helpers/load-spec.js";
import { parse } from "./helpers/parse-frontmatter.js";
import { classify } from "./helpers/classify.js";

const repoRoot = join(fileURLToPath(import.meta.url), "..", "..");

/**
 * Extract mnemonic letters: if mnemonic starts with "TO ", strip prefix, use remaining 4 caps;
 * otherwise use all caps as-is (meta form).
 */
function mnemonicLetters(mnemonic: string): string {
  if (mnemonic.startsWith("TO ")) return mnemonic.slice(3);
  return mnemonic;
}

/**
 * Derive the mnemonic from chapter first letters.
 * Chapters: ["Trigger", "Engine", "Surface", "Tail"] -> "TEST"
 */
function chaptersToMnemonic(chapters: string[]): string {
  return chapters.map((c) => c[0].toUpperCase()).join("");
}

/**
 * Check that a spec's body has exactly chapters.length top-level bullet items
 * under the mnemonic section (any line starting with "- " or "* " at column 0).
 */
function countTopLevelBullets(body: string): number {
  return body.split("\n").filter((line) => /^[*-] /.test(line)).length;
}

/**
 * Check that every bullet line starts with a bold letter matching the chapter
 * initial, e.g. "- **T**rigger ...".
 */
function bulletBoldLetters(body: string): string[] {
  return body
    .split("\n")
    .filter((line) => /^[*-] /.test(line))
    .map((line) => {
      const m = line.match(/^\s*[*-]\s+\*\*([A-Z])\*\*/);
      return m ? m[1] : "";
    });
}

function runTypeRulesChecks(filePath: string, data: Record<string, unknown>, body: string): void {
  const chapters = data.chapters as string[];
  const mnemonic = data.mnemonic as string;
  const letters = mnemonicLetters(mnemonic);

  // Rule 1: bullet count matches chapters.length
  const bulletCount = countTopLevelBullets(body);
  expect(
    bulletCount,
    `${filePath}: bullet count (${bulletCount}) must equal chapters.length (${chapters.length})`,
  ).toBe(chapters.length);

  // Rule 2: bold-letter pattern per bullet
  const boldLetters = bulletBoldLetters(body);
  expect(
    boldLetters.length,
    `${filePath}: each bullet must have a bold initial letter (**X**)`,
  ).toBe(chapters.length);

  // Rule 3: mnemonic-letter derivation
  const derived = chaptersToMnemonic(chapters);
  expect(
    derived,
    `${filePath}: chapters first-letters "${derived}" must equal mnemonic letters "${letters}"`,
  ).toBe(letters);

  // Rule 4: capitalisation - type name must be uppercase in prose.
  // The capitalisation rule (MVP-9) requires type-name tokens to appear capitalised
  // in body prose (e.g. "the Persona", "the Place") so a renderer can recognise them.
  // We catch the wrong case: "the persona" lowercase in a non-persona file. The check
  // is intentionally case-SENSITIVE: "the Persona" with capital P is the correct form
  // and must pass; only the lowercase form is a violation.
  // The lede self-name exception (e.g. piece.md saying "A piece is...") is allowed
  // because typeLower for that file equals the offending word and is filtered out below.
  const typeVal = data.type as string;
  const typeLower = typeVal.toLowerCase();
  const illegalUsages = ["process", "position", "piece", "place", "persona"].filter(
    (t) => t !== typeLower && body.includes(`the ${t}`),
  );
  expect(
    illegalUsages,
    `${filePath}: body must not reference other type names as "the <type>" in lowercase: found ${illegalUsages.join(", ")}`,
  ).toHaveLength(0);
}

describe("type-rules: architecture/*.md", () => {
  const files = loadArchitectureSpecs(repoRoot);

  it.skipIf(files.length === 0)(
    "loads at least one file (skipped until khai-2 lands spec files)",
    () => {
      expect(files.length).toBeGreaterThan(0);
    },
  );

  for (const file of files) {
    if (classify(file) === "companion") continue;

    it(`${file.path} passes type rules`, () => {
      const { data, body } = parse(file.text);
      runTypeRulesChecks(file.path, data, body);
    });
  }
});

describe("type-rules: valid fixtures", () => {
  const files = loadFixtures(repoRoot, "valid");

  for (const file of files) {
    if (classify(file) === "companion") continue;

    it(`${file.path} passes type rules`, () => {
      const { data, body } = parse(file.text);
      runTypeRulesChecks(file.path, data, body);
    });
  }
});

describe("type-rules: invalid fixtures - bad-type-rules-* must fail", () => {
  const files = loadFixtures(repoRoot, "invalid").filter((f) => f.path.includes("bad-type-rules-"));

  it("loads at least one bad-type-rules fixture", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file.path} fails at least one type rule`, () => {
      const { data, body } = parse(file.text);
      const chapters = data.chapters as string[];
      const mnemonic = data.mnemonic as string;
      const letters = mnemonicLetters(mnemonic);

      const bulletCount = countTopLevelBullets(body);
      const derived = chaptersToMnemonic(chapters);
      const boldLetters = bulletBoldLetters(body);
      const typeVal = data.type as string;
      const typeLower = typeVal.toLowerCase();
      const illegalUsages = ["process", "position", "piece", "place", "persona"].filter(
        (t) => t !== typeLower && body.includes(`the ${t}`),
      );

      const fails =
        bulletCount !== chapters.length ||
        derived !== letters ||
        boldLetters.some((l) => !l) ||
        illegalUsages.length > 0;

      expect(fails, `${file.path}: expected at least one type-rules failure but all passed`).toBe(
        true,
      );
    });
  }
});
