import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const WILDLAND = [
  "process_crown.md",
  "process_grass.md",
  "process_chaparral.md",
  "process_peat.md",
  "process_holdover.md",
  "process_spotting.md",
  "process_slash.md",
  "process_serotiny.md",
  "process_duff.md",
  "process_coal-seam.md",
  "process_wui.md",
];

const DYNAMICS = [
  "process_flashover.md",
  "process_backdraft.md",
  "process_rollover.md",
  "process_layering.md",
  "process_chimney.md",
  "process_pyrolysis.md",
  "process_cladding.md",
  "process_tunnel.md",
  "process_column.md",
  "process_whirl.md",
  "process_pyrocb.md",
  "process_firestorm.md",
  "process_blowup.md",
];

const INDUSTRIAL = [
  "process_pool-fire.md",
  "process_jet.md",
  "process_flash-fire.md",
  "process_vce.md",
  "process_bleve.md",
  "process_boilover.md",
  "process_metal.md",
  "process_lithium.md",
  "process_dust.md",
  "process_self-heating.md",
  "process_pyrophoric.md",
  "process_oxidizer.md",
  "process_hypergolic.md",
  "process_arc-flash.md",
  "process_polymer.md",
  "process_hydrogen.md",
  "process_runaway.md",
];

const MADE_FIRE = [
  "process_backfire.md",
  "process_prescribed.md",
  "process_swidden.md",
  "process_firestick.md",
  "process_charcoal.md",
  "process_forge.md",
  "process_furnace.md",
  "process_kiln.md",
  "process_incinerator.md",
  "process_flare.md",
  "process_torch.md",
  "process_burner.md",
  "process_pyrotechnics.md",
  "process_barbecue.md",
  "process_candle.md",
  "process_cremation.md",
];

const CONVEYANCE = [
  "process_ship.md",
  "process_aircraft.md",
  "process_vehicle.md",
  "process_spacecraft.md",
];

describe("combustion: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("combustion: manifest", () => {
  it("declares a process catalog on place: a combustion root over the phenomena", () => {
    expect(manifest.engine).toBe("combustion");
    expect(manifest.type).toBe("process");
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_combustion.md");
  });

  it("carries all five domains -- wildland, compartment/dynamics, industrial, made fire, conveyance -- every phenomenon hung off the root", () => {
    const leaves = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(leaves).toEqual([...WILDLAND, ...DYNAMICS, ...INDUSTRIAL, ...MADE_FIRE, ...CONVEYANCE]);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_combustion.md");
    }
  });

  it("declares both wiring altitudes, the place link at Shown", () => {
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

describe("combustion: compose()", () => {
  it("composes every phenomenon root-first, carrying the combustion root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Combustion")).toBe(true);
    }
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
