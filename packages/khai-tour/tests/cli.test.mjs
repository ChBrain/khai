import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseStageArgs, runStage, describeVenue, venuesText } from "../lib/cli.mjs";
import { venues } from "../lib/profiles.mjs";

describe("parseStageArgs", () => {
  it("parses venue, out, collections (repeatable) and engines", () => {
    const cfg = parseStageArgs([
      "--venue",
      "perplexity_space",
      "--out",
      "/tmp/x",
      "--collection",
      "guide=docs/*.md",
      "--collection",
      "canon=canon/**",
      "--engine",
      "Gender",
    ]);
    expect(cfg.venue).toBe("perplexity_space");
    expect(cfg.outputDir).toBe("/tmp/x");
    expect(cfg.collections).toEqual({ guide: "docs/*.md", canon: "canon/**" });
    expect(cfg.engines).toEqual(["Gender"]);
  });

  it("rejects a malformed --collection and unknown flags", () => {
    expect(() => parseStageArgs(["--collection", "noequals"])).toThrow("name>=<glob");
    expect(() => parseStageArgs(["--bogus"])).toThrow("Unknown option");
    expect(() => parseStageArgs(["--venue"])).toThrow("expects a value");
  });
});

describe("describeVenue / venuesText", () => {
  it("shows kind + source for interactive venues (no undefined)", () => {
    const { detail } = describeVenue("perplexity_space", venues.perplexity_space);
    expect(detail).toBe("kind: interactive, source: upload");
  });

  it("shows format/packaging for publication venues", () => {
    const { detail } = describeVenue("print", venues.print);
    expect(detail).toContain("kind: publication");
    expect(detail).toContain("format: pdf");
  });

  it("the full listing never prints undefined", () => {
    expect(venuesText()).not.toContain("undefined");
  });
});

describe("runStage", () => {
  let artifactDir;
  let outputDir;

  beforeAll(() => {
    artifactDir = mkdtempSync(join(tmpdir(), "khai-cli-art-"));
    outputDir = mkdtempSync(join(tmpdir(), "khai-cli-out-"));
    writeFileSync(join(artifactDir, "LICENSE"), "content\n");
    writeFileSync(join(artifactDir, "LICENSE-CODE"), "MIT\n");
  });

  afterAll(() => {
    rmSync(artifactDir, { recursive: true, force: true });
    rmSync(outputDir, { recursive: true, force: true });
  });

  it("stages an interactive venue from args", async () => {
    const result = await runStage([
      "--venue",
      "perplexity_space",
      "--out",
      outputDir,
      "--artifact",
      artifactDir,
    ]);
    expect(result.outputPath).toBe(join(outputDir, "perplexity_space.zip"));
    expect(existsSync(result.outputPath)).toBe(true);
  });

  it("requires --venue and --out", async () => {
    await expect(runStage(["--venue", "perplexity_space"])).rejects.toThrow("requires");
  });
});
