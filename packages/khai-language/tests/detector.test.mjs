import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  cleanProse,
  extractProseSections,
  resolveLanguage,
  validateLanguageOfFile,
  validateProjectLanguages,
} from "../src/detector.mjs";

const FIXTURES_DIR = join(import.meta.dirname || __dirname, "fixtures");

describe("Language Detector - text utilities", () => {
  it("cleanProse removes links, blockquotes, and formatting", () => {
    const text = `
This is a paragraph.
> This is a blockquote which should be stripped out.
Another sentence with a [link target](http://example.com/some/file.md) and some **bold** text.
- A list item with \`inline code\`.
`;
    const cleaned = cleanProse(text);
    expect(cleaned).not.toContain("blockquote");
    expect(cleaned).toContain("Another sentence with a link target");
    expect(cleaned).toContain("bold");
    expect(cleaned).toContain("inline code");
  });

  it("extractProseSections extracts target H2 sections only", () => {
    const text = `---
khai: persona
---
# Persona: Test

## Owner
- Project: Test

## Projection
This is the projection text that we want to check.

## Shadow
This is the shadow text.

## SomethingElse
This should be ignored.
`;
    const sections = extractProseSections(text, ["projection", "shadow"]);
    expect(sections).toHaveLength(2);
    expect(sections[0].header).toBe("Projection");
    expect(sections[0].body.trim()).toBe("This is the projection text that we want to check.");
    expect(sections[1].header).toBe("Shadow");
    expect(sections[1].body.trim()).toBe("This is the shadow text.");
  });
});

describe("Language Detector - resolution and validation", () => {
  beforeAll(() => {
    if (!existsSync(FIXTURES_DIR)) {
      mkdirSync(FIXTURES_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    if (existsSync(FIXTURES_DIR)) {
      rmSync(FIXTURES_DIR, { recursive: true, force: true });
    }
  });

  it("resolveLanguage respects the inheritance chain (house -> play -> file)", () => {
    const projectDir = join(FIXTURES_DIR, "project");
    const playDir = join(projectDir, "plays", "my-play");
    mkdirSync(playDir, { recursive: true });

    // 1. Setup house README (English)
    writeFileSync(
      join(projectDir, "README.md"),
      `---
language: en
---
# House README
`,
    );

    // 2. Setup play file (no language - should inherit house)
    writeFileSync(
      join(playDir, "play_my-play.md"),
      `---
khai: play
---
# Play: My Play
`,
    );

    // 3. Setup instance file (no language - should inherit play/house)
    const file1 = join(playDir, "persona_one.md");
    writeFileSync(
      file1,
      `---
khai: persona
---
# Persona: One
`,
    );

    expect(resolveLanguage(file1, projectDir)).toBe("english");

    // 4. Override at play level (German)
    writeFileSync(
      join(playDir, "play_my-play.md"),
      `---
khai: play
language: de
---
# Play: My Play
`,
    );
    expect(resolveLanguage(file1, projectDir)).toBe("german");

    // 5. Override at file level (Danish)
    writeFileSync(
      file1,
      `---
khai: persona
language: da
---
# Persona: One
`,
    );
    expect(resolveLanguage(file1, projectDir)).toBe("danish");
  });

  it("validateLanguageOfFile checks allowed languages and handles exceptions", () => {
    const projectDir = join(FIXTURES_DIR, "validation-project");
    const playDir = join(projectDir, "plays", "woyzeck");
    mkdirSync(playDir, { recursive: true });

    // Setup house README (German)
    writeFileSync(
      join(projectDir, "README.md"),
      `---
language: de
---
`,
    );

    // Setup play file (German)
    writeFileSync(
      join(playDir, "play_woyzeck.md"),
      `---
khai: play
---
`,
    );

    // 1. File in correct language (German)
    const fileCorrect = join(playDir, "persona_correct.md");
    writeFileSync(
      fileCorrect,
      `---
khai: persona
---
# Persona: Correct

## Projection
Franz Woyzeck läuft durch die Gassen der Stadt. Er fühlt sich gehetzt und von den Stimmen gequält. Es brennt ein Feuer am Himmel.
`,
    );

    const errors1 = validateLanguageOfFile(fileCorrect, projectDir);
    expect(errors1).toHaveLength(0);

    // 2. File in incorrect language (English)
    const fileIncorrect = join(playDir, "persona_incorrect.md");
    writeFileSync(
      fileIncorrect,
      `---
khai: persona
---
# Persona: Incorrect

## Projection
Franz Woyzeck runs through the streets of the garrison town. He feels chased and tormented by the voices in his head. A fire burns in the sky.
`,
    );

    const errors2 = validateLanguageOfFile(fileIncorrect, projectDir);
    expect(errors2).toHaveLength(1);
    expect(errors2[0]).toContain("English span");

    // 3. Exception handling (contains forbidden English word, but exempted)
    const fileExempt = join(playDir, "persona_exempt.md");
    writeFileSync(
      fileExempt,
      `---
khai: persona
---
# Persona: Exempt

## Projection
Franz Woyzeck läuft durch die Gassen und spricht über das Wort "garrison town".
`,
    );

    // With word 'garrison town' in text, languagedetect might skew it. Let's make sure exceptions works.
    writeFileSync(
      join(playDir, "language_exceptions.txt"),
      `# comment line
garrison town
`,
    );

    const errors3 = validateLanguageOfFile(fileExempt, projectDir);
    expect(errors3).toHaveLength(0); // Should be skipped/exempted
  });

  it("validateLanguageOfFile skips library check on NLP fallback languages", () => {
    const projectDir = join(FIXTURES_DIR, "nlp-project");
    const playDir = join(projectDir, "plays", "igbo-play");
    mkdirSync(playDir, { recursive: true });

    // Setup house README (Igbo)
    writeFileSync(
      join(projectDir, "README.md"),
      `---
language: ig
---
`,
    );

    const fileIgbo = join(playDir, "persona_igbo.md");
    writeFileSync(
      fileIgbo,
      `---
khai: persona
---
# Persona: Igbo

## Projection
Kedu ka ị mere? Obi ụtọ na-arụ ọrụ a.
`,
    );

    // Should skip check and return no errors
    const errors = validateLanguageOfFile(fileIgbo, projectDir, { nlpLanguages: ["ig"] });
    expect(errors).toHaveLength(0);
  });

  it("validateLanguageOfFile fails immediately for unregistered languages", () => {
    const projectDir = join(FIXTURES_DIR, "unregistered-project");
    const playDir = join(projectDir, "plays", "unknown-play");
    mkdirSync(playDir, { recursive: true });

    // Setup house README (unregistered language 'es')
    writeFileSync(
      join(projectDir, "README.md"),
      `---
language: es
---
`,
    );

    const fileUnknown = join(playDir, "persona_unknown.md");
    writeFileSync(
      fileUnknown,
      `---
khai: persona
---
# Persona: Unknown
`,
    );

    const errors = validateLanguageOfFile(fileUnknown, projectDir);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("Language 'es' is not registered");
  });

  it("validateProjectLanguages resolves nlpLanguages dynamically from package.json", () => {
    const projectDir = join(FIXTURES_DIR, "dynamic-package-project");
    const playDir = join(projectDir, "plays", "igbo-play");
    mkdirSync(playDir, { recursive: true });

    // Setup package.json with khai.languages: ["ig"]
    writeFileSync(
      join(projectDir, "package.json"),
      JSON.stringify({
        name: "test-house",
        version: "1.0.0",
        khai: {
          languages: ["ig"],
        },
      }),
    );

    // Setup house README (Igbo)
    writeFileSync(
      join(projectDir, "README.md"),
      `---
language: ig
---
`,
    );

    const fileIgbo = join(playDir, "persona_igbo.md");
    writeFileSync(
      fileIgbo,
      `---
khai: persona
---
# Persona: Igbo

## Projection
Kedu ka ị mere? Obi ụtọ na-arụ ọrụ a.
`,
    );

    // When validateProjectLanguages is run without options.nlpLanguages,
    // it should read "ig" from package.json and skip library checks (meaning 0 errors).
    const results = validateProjectLanguages(projectDir);
    expect(results).toHaveLength(0);
  });
});
