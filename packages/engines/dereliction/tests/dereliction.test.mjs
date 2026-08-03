import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const FORMS = [
  "process_disrepair.md",
  "process_abandonment.md",
  "process_disinvestment.md",
  "process_ruin.md",
];

describe("dereliction: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("dereliction: manifest", () => {
  it("declares a process engine on place: a withdrawal root over four forms", () => {
    expect(manifest.engine).toBe("dereliction");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(5);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_dereliction.md");
  });

  it("hangs all four forms off the dereliction root", () => {
    const forms = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(forms).toEqual(FORMS);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_dereliction.md");
    }
  });

  it("declares both wiring altitudes, the place link at Offers", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "place",
      section: "Offers",
      link: "expression",
      level: "fail",
    });
  });
});

describe("dereliction: compose()", () => {
  it("composes every form root-first, carrying the dereliction root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Dereliction")).toBe(true);
    }
  });

  it("carries the root above each form", () => {
    const out = compose({ leaf: "process_ruin.md" });
    expect(out.indexOf("# Process: Dereliction\n")).toBeLessThan(out.indexOf("# Process: Ruin"));
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
