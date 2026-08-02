import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const CHANNELS = [
  "process_wind.md",
  "process_water.md",
  "process_heat.md",
  "process_cold.md",
  "process_sky.md",
  "process_season.md",
];

describe("weather: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("weather: manifest", () => {
  it("declares a process engine: a root over six channels and their bands", () => {
    expect(manifest.engine).toBe("weather");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(28);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_weather.md");
  });

  it("hangs all six channels off the weather root", () => {
    const channels = manifest.members
      .filter((m) => m.parent === "process_weather.md")
      .map((m) => m.file);
    expect(channels).toEqual(CHANNELS);
  });

  it("hangs every band off one of the six channels", () => {
    const channelSet = new Set(CHANNELS);
    const bands = manifest.members.filter(
      (m) => m.parent !== null && m.parent !== "process_weather.md",
    );
    // wind/water/heat/cold at four bands, sky three, season two: 21 bands.
    expect(bands).toHaveLength(21);
    for (const b of bands) {
      expect(channelSet.has(b.parent)).toBe(true);
    }
  });

  it("gives each transient channel its full four-band ladder, sky three, season two", () => {
    const bandsOf = (channel) =>
      manifest.members.filter((m) => m.parent === channel).map((m) => m.file);
    expect(bandsOf("process_wind.md")).toEqual([
      "process_wind_light.md",
      "process_wind_fresh.md",
      "process_wind_gale.md",
      "process_wind_storm.md",
    ]);
    expect(bandsOf("process_heat.md")).toHaveLength(4);
    expect(bandsOf("process_cold.md")).toHaveLength(4);
    expect(bandsOf("process_water.md")).toHaveLength(4);
    expect(bandsOf("process_sky.md")).toHaveLength(3);
    expect(bandsOf("process_season.md")).toEqual([
      "process_season_dormant.md",
      "process_season_growing.md",
    ]);
  });

  it("declares both wiring altitudes, including the first-of-kind place link", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "place",
      section: "Shown",
      link: "expression",
      level: "fail",
    });
  });
});

describe("weather: compose()", () => {
  it("composes every leaf root-first, carrying the weather root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Weather")).toBe(true);
    }
  });

  it("carries the channel between the root and the band", () => {
    const out = compose({ leaf: "process_wind_gale.md" });
    const root = out.indexOf("# Process: Weather");
    const channel = out.indexOf("# Process: Wind\n");
    const band = out.indexOf("# Process: Wind, Gale");
    expect(root).toBeGreaterThanOrEqual(0);
    expect(root).toBeLessThan(channel);
    expect(channel).toBeLessThan(band);
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
