import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_time_timeliness.md",
  "process_time_untimeliness.md",
  "process_time_fullness.md",
];

describe("time: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("time: manifest", () => {
  it("declares a process composite: a whole-time root over three bridges", () => {
    expect(manifest.engine).toBe("time");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_time.md");
  });

  it("hangs all three bridges off the time root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_time.md");
    }
  });

  it("wires the law at fail, and every cargo advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The composite's cargo links are advisory, not hard gates: a play may link
    // the bridge its time is in, and the audit surfaces where it does not.
    const cargo = manifest.requires.filter((r) => r.on !== "instructions");
    expect(cargo.every((r) => r.level === "audit")).toBe(true);
    expect(cargo.every((r) => r.link === "expression")).toBe(true);
  });

  it("wires multi-cargo: the object's Yearbook and each unfolding's moment-chapter", () => {
    expect(manifest.requires).toContainEqual({
      on: "piece",
      section: "Yearbook",
      link: "expression",
      level: "audit",
    });
    expect(manifest.requires).toContainEqual({
      on: "plot",
      section: "Cue",
      link: "expression",
      level: "audit",
    });
    expect(manifest.requires).toContainEqual({
      on: "plan",
      section: "Implementation",
      link: "expression",
      level: "audit",
    });
    expect(manifest.requires).toContainEqual({
      on: "process",
      section: "Initiated by",
      link: "expression",
      level: "audit",
    });
    const cargo = manifest.requires.filter((r) => r.on !== "instructions").map((r) => r.on);
    expect(cargo.sort()).toEqual(["piece", "plan", "plot", "process"]);
  });
});

describe("time: atoms", () => {
  it("re-exports the two time engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["chronos", "kairos"]);
    expect(atoms.chronos.manifest.engine).toBe("chronos");
    expect(atoms.kairos.manifest.engine).toBe("kairos");
  });
});

describe("time: compose()", () => {
  it("composes every bridge root-first, carrying the time root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Time")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_time_fullness.md" });
    expect(out.indexOf("# Process: Time\n")).toBeLessThan(out.indexOf("# Process: Time, Fullness"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
