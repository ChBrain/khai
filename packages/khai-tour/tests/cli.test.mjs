import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseStageArgs, runStage, describeVenue, venuesText } from "../lib/cli.mjs";
import { venues } from "../lib/profiles.mjs";
import { readFileSync } from "node:fs";

// Dormant until the scenario station lands: source and tests are separate
// PRs (the house rule). The scenario CLI suites skip while ../lib/cli.mjs does
// not yet export runScenario, and wake on their own once it does.
const SCENARIO_DORMANT = !readFileSync(new URL("../lib/cli.mjs", import.meta.url), "utf8").includes(
  "runScenario",
);
let parseScenarioArgs, runScenario;
if (!SCENARIO_DORMANT) {
  ({ parseScenarioArgs, runScenario } = await import("../lib/cli.mjs"));
}

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

describe.skipIf(SCENARIO_DORMANT)("parseScenarioArgs", () => {
  it("parses scenario, out, house, home-url, and repeatable adaption/engine", () => {
    const cfg = parseScenarioArgs([
      "--scenario",
      "/tmp/s",
      "--out",
      "/tmp/o",
      "--house",
      "/tmp/h",
      "--home-url",
      "https://example.com/blob/main",
      "--adaption",
      "The play is fixed.",
      "--engine",
      "Language (the root loop).",
    ]);
    expect(cfg.scenarioDir).toBe("/tmp/s");
    expect(cfg.outputDir).toBe("/tmp/o");
    expect(cfg.houseDir).toBe("/tmp/h");
    expect(cfg.homeUrl).toBe("https://example.com/blob/main");
    expect(cfg.adaption).toEqual(["The play is fixed."]);
    expect(cfg.engines).toEqual(["Language (the root loop)."]);
  });

  it("rejects unknown flags", () => {
    expect(() => parseScenarioArgs(["--bogus"])).toThrow("Unknown option");
  });
});

describe.skipIf(SCENARIO_DORMANT)("runScenario", () => {
  let scenarioDir;
  let outputDir;
  let emptyRoot;

  beforeAll(() => {
    scenarioDir = mkdtempSync(join(tmpdir(), "khai-cli-scn-"));
    outputDir = mkdtempSync(join(tmpdir(), "khai-cli-scn-out-"));
    emptyRoot = mkdtempSync(join(tmpdir(), "khai-cli-scn-root-"));
    writeFileSync(
      join(scenarioDir, "play_cli.md"),
      "# Play: CLI Test\n\n## Estate\n\nx\n\n## Name\n\nx\n\n## Arc\n\nx\n\n## Company\n\n**Pieces**\n\n- [Piece](piece_cli.md): built.\n\n## Triggers\n\n**[Plot 1](plot_01_cli.md)**\n\nx\n\n## Stakes\n\nx\n",
    );
    writeFileSync(join(scenarioDir, "piece_cli.md"), "# Piece: CLI\n\nBuilt for the CLI test.\n");
    writeFileSync(join(scenarioDir, "plot_01_cli.md"), "# Plot 1\n\nx\n");
  });

  afterAll(() => {
    rmSync(scenarioDir, { recursive: true, force: true });
    rmSync(outputDir, { recursive: true, force: true });
    rmSync(emptyRoot, { recursive: true, force: true });
  });

  it("packs a scenario from args", async () => {
    const result = await runScenario([
      "--scenario",
      scenarioDir,
      "--out",
      outputDir,
      "--root",
      emptyRoot,
    ]);
    expect(existsSync(result.outputPath)).toBe(true);
    expect(result.entries.find((e) => e.path === "piece_cli.md")).toBeTruthy();
  });

  it("requires --scenario and --out", async () => {
    await expect(runScenario(["--scenario", scenarioDir])).rejects.toThrow("requires");
  });
});
