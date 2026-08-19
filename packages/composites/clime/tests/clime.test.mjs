import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_clime_day.md", "process_clime_terms.md", "process_clime_run.md"];

describe("clime: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("clime: manifest", () => {
  it("declares a process composite: an inference root over three bridges", () => {
    expect(manifest.engine).toBe("clime");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_clime.md");
  });

  it("hangs all three bridges off the clime root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_clime.md");
    }
  });

  it("wires the law at fail and the cargo on place at Shown, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The cargo link sits on place/Shown, the chapter both atoms attach to, dropped to
    // audit: a place may say which face its air is showing, and the audit surfaces where
    // a play stages weather with no regime behind it, or a regime that never falls on
    // anybody as a day.
    expect(manifest.requires).toContainEqual({
      on: "place",
      section: "Shown",
      link: "expression",
      level: "audit",
    });
    const cargo = manifest.requires.filter((r) => r.on !== "instructions");
    expect(cargo.map((r) => r.on)).toEqual(["place"]);
  });
});

describe("clime: atoms", () => {
  it("re-exports the two air engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["climate", "weather"]);
    expect(atoms.weather.manifest.engine).toBe("weather");
    expect(atoms.climate.manifest.engine).toBe("climate");
  });

  it("keeps both atoms on the chapter it wires over", () => {
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.type, name).toBe("process");
      expect(atom.manifest.requires, name).toContainEqual({
        on: "place",
        section: "Shown",
        link: "expression",
        level: "fail",
      });
    }
  });

  // The run bridge exists because a regime can move, and it reads that movement through
  // the seasonality it disturbs. Both members are load-bearing for the composite's twist:
  // lose either from the climate atom and the third bridge has nothing to detect.
  it("keeps the climate members the run bridge reads a shift through", () => {
    const files = atoms.climate.manifest.members.map((m) => m.file);
    expect(files).toContain("process_shift.md");
    expect(files).toContain("process_seasonality.md");
  });
});

describe("clime: compose()", () => {
  it("composes every bridge root-first, carrying the clime root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Clime")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_clime_run.md" });
    expect(out.indexOf("# Process: Clime\n")).toBeLessThan(
      out.indexOf("# Process: Clime, the Run"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
