import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const DIMENSIONS = [
  "process_fluency.md",
  "process_flexibility.md",
  "process_originality.md",
  "process_elaboration.md",
];

describe("divergent-thinking: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("divergent-thinking: manifest", () => {
  it("declares a process engine: a generative root over Guilford's four dimensions", () => {
    expect(manifest.engine).toBe("divergent-thinking");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe(
      "process_divergent-thinking.md",
    );
  });

  it("hangs all four dimensions off the divergent-thinking root, no forced twist", () => {
    const dims = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(dims).toEqual(DIMENSIONS);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_divergent-thinking.md");
    }
  });

  it("wires on the persona at Projection, the law at instructions/Knowledge", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "persona",
      section: "Projection",
      link: "expression",
      level: "fail",
    });
  });
});

describe("divergent-thinking: compose()", () => {
  it("composes every dimension root-first, carrying the divergent-thinking root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Divergent thinking")).toBe(true);
    }
  });

  it("carries the root above the originality dimension", () => {
    const out = compose({ leaf: "process_originality.md" });
    expect(out.indexOf("# Process: Divergent thinking\n")).toBeLessThan(
      out.indexOf("# Process: Originality"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
