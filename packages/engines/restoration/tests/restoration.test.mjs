import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const STANCES = [
  "process_reversion.md",
  "process_testimony.md",
  "process_stabilization.md",
  "process_continuation.md",
  "process_fidelity.md",
];

describe("restoration: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("restoration: manifest", () => {
  it("declares a process engine on piece: a mending root over five stances", () => {
    expect(manifest.engine).toBe("restoration");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(6);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_restoration.md");
  });

  it("hangs all five stances off the restoration root", () => {
    const stances = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(stances).toEqual(STANCES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_restoration.md");
    }
  });

  it("declares both wiring altitudes, the piece link at Apparent", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "piece",
      section: "Apparent",
      link: "expression",
      level: "fail",
    });
  });
});

describe("restoration: compose()", () => {
  it("composes every stance root-first, carrying the restoration root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Restoration")).toBe(true);
    }
  });

  it("carries the root above each stance", () => {
    const out = compose({ leaf: "process_testimony.md" });
    expect(out.indexOf("# Process: Restoration\n")).toBeLessThan(
      out.indexOf("# Process: Testimony"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
