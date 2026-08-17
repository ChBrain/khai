import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_presentation_front.md",
  "process_presentation_tuning.md",
  "process_presentation_cost.md",
];

describe("presentation: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("presentation: manifest", () => {
  it("declares a process composite on persona: a performed-self root over three bridges", () => {
    expect(manifest.engine).toBe("presentation");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_presentation.md");
  });

  it("hangs all three bridges off the presentation root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_presentation.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The composite's cargo link is advisory, not a hard gate: a persona may link the
    // part of its performance in play, and the audit surfaces where it does not.
    expect(manifest.requires).toContainEqual({
      on: "persona",
      section: "Projection",
      link: "expression",
      level: "audit",
    });
    const cargo = manifest.requires.filter((r) => r.on !== "instructions");
    expect(cargo.map((r) => r.on)).toEqual(["persona"]);
  });
});

describe("presentation: atoms", () => {
  it("re-exports the four self-presentation engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual([
      "backstage",
      "emotional-labor",
      "face",
      "self-monitoring",
    ]);
    expect(atoms.face.manifest.engine).toBe("face");
    expect(atoms.backstage.manifest.engine).toBe("backstage");
    expect(atoms["self-monitoring"].manifest.engine).toBe("self-monitoring");
    expect(atoms["emotional-labor"].manifest.engine).toBe("emotional-labor");
  });
});

describe("presentation: compose()", () => {
  it("composes every bridge root-first, carrying the presentation root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Presentation")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_presentation_cost.md" });
    expect(out.indexOf("# Process: Presentation\n")).toBeLessThan(
      out.indexOf("# Process: Presentation, the Cost"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
