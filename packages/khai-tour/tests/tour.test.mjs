import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { tour, buildInteractiveBundle, composeVenue } from "../lib/index.mjs";

let artifactDir;
let outputDir;

beforeAll(() => {
  artifactDir = mkdtempSync(join(tmpdir(), "khai-tour-art-"));
  outputDir = mkdtempSync(join(tmpdir(), "khai-tour-out-"));
  writeFileSync(join(artifactDir, "LICENSE"), "Content licence\n");
  writeFileSync(join(artifactDir, "LICENSE-CODE"), "MIT\n");
  writeFileSync(join(artifactDir, "guide.md"), "---\nkhai: note\n---\n\n# Guide\n\nUse it well.\n");
});

afterAll(() => {
  rmSync(artifactDir, { recursive: true, force: true });
  rmSync(outputDir, { recursive: true, force: true });
});

describe("buildInteractiveBundle", () => {
  it("puts the composed instructions under khai/ and the licences at root", async () => {
    const bundle = await buildInteractiveBundle("perplexity_space", {
      artifactDir,
      collections: { guide: "guide.md" },
    });

    expect(bundle.kind).toBe("interactive");
    const byPath = Object.fromEntries(bundle.entries.map((e) => [e.path, e]));

    expect(byPath["khai/instructions.md"].role).toBe("instructions");
    expect(byPath["khai/instructions.md"].content).toBe(composeVenue("perplexity_space"));

    expect(byPath["khai/guide.md"].role).toBe("knowledge");
    expect(byPath["khai/guide.md"].content).toContain("# Guide"); // frontmatter stripped
    expect(byPath["khai/guide.md"].content).not.toContain("khai: note");

    expect(byPath["LICENSE"].role).toBe("license");
    expect(byPath["LICENSE-CODE"].role).toBe("license");
  });

  it("warns (does not throw) when README / REFERENCES are absent", async () => {
    const bundle = await buildInteractiveBundle("perplexity_space", {
      artifactDir,
      collections: {},
    });
    expect(bundle.warnings.some((w) => w.startsWith("README.md"))).toBe(true);
    expect(bundle.warnings.some((w) => w.startsWith("REFERENCES.md"))).toBe(true);
  });

  it("warns when the venue has no adaption in spine", async () => {
    const bundle = await buildInteractiveBundle("claude_project", { artifactDir, collections: {} });
    expect(bundle.warnings.some((w) => w.includes("no venue adaption"))).toBe(true);
  });

  it("rejects a non-interactive venue", async () => {
    await expect(buildInteractiveBundle("print", { artifactDir })).rejects.toThrow(
      "not interactive",
    );
  });

  it("enforces the Gemini Gem hard 10-file knowledge limit", async () => {
    const dir = mkdtempSync(join(tmpdir(), "khai-gem-"));
    const collections = {};
    for (let i = 0; i < 11; i++) {
      writeFileSync(join(dir, `k${i}.md`), `# ${i}\n`);
      collections[`c${i}`] = `k${i}.md`;
    }
    await expect(
      buildInteractiveBundle("gemini_gem", { artifactDir: dir, collections }),
    ).rejects.toThrow("at most 10 knowledge files");
    rmSync(dir, { recursive: true, force: true });
  });

  it("builds a Gemini Gem bundle within the limit", async () => {
    const bundle = await buildInteractiveBundle("gemini_gem", {
      artifactDir,
      collections: { guide: "guide.md" },
    });
    expect(bundle.kind).toBe("interactive");
    expect(bundle.entries.filter((e) => e.role === "knowledge")).toHaveLength(1);
  });
});

describe("tour", () => {
  it("writes a <venue>.zip and returns a manifest", async () => {
    const result = await tour({
      venue: "perplexity_space",
      outputDir,
      artifactDir,
      collections: { guide: "guide.md" },
    });

    expect(result.kind).toBe("interactive");
    expect(result.outputPath).toBe(join(outputDir, "perplexity_space.zip"));
    expect(existsSync(result.outputPath)).toBe(true);
    expect(readFileSync(result.outputPath).subarray(0, 4)).toEqual(
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    );
    // manifest entries carry path + role, not content
    expect(result.entries).toContainEqual({ path: "khai/instructions.md", role: "instructions" });
    expect(result.entries).toContainEqual({ path: "khai/guide.md", role: "knowledge" });
  });

  it("throws on an unknown venue", async () => {
    await expect(tour({ venue: "nope", outputDir })).rejects.toThrow("Unknown venue");
  });

  it("renders a markdown publication venue to a file", async () => {
    const result = await tour({
      venue: "markdown",
      outputDir,
      artifactDir,
      collections: { body: "guide.md" },
    });
    expect(result.kind).toBe("publication");
    expect(result.format).toBe("markdown");
    expect(result.outputPath).toBe(join(outputDir, "markdown.md"));
    expect(existsSync(result.outputPath)).toBe(true);
    expect(readFileSync(result.outputPath, "utf8")).toContain("# Guide");
  });

  it("does not implement the pdf renderer yet", async () => {
    await expect(tour({ venue: "print", outputDir })).rejects.toThrow("not implemented yet");
  });
});
