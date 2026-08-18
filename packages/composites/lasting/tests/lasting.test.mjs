import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_lasting_attending.md",
  "process_lasting_telling.md",
  "process_lasting_fading.md",
];

describe("lasting: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("lasting: manifest", () => {
  it("declares a process composite on persona: a fate-of-a-good root over three bridges", () => {
    expect(manifest.engine).toBe("lasting");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_lasting.md");
  });

  it("hangs all three bridges off the lasting root, in order of the arc", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_lasting.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The composite's cargo link is advisory, not a hard gate: a persona may link what
    // is becoming of a good that has arrived, and the audit surfaces where a play grants
    // a persona a windfall and never reads what was left of it.
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

describe("lasting: atoms", () => {
  it("re-exports the three engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["capitalization", "hedonic-adaptation", "savoring"]);
    expect(atoms.savoring.manifest.engine).toBe("savoring");
    expect(atoms.capitalization.manifest.engine).toBe("capitalization");
    expect(atoms["hedonic-adaptation"].manifest.engine).toBe("hedonic-adaptation");
  });
});

describe("lasting: compose()", () => {
  it("composes every bridge root-first, carrying the lasting root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Lasting")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_lasting_fading.md" });
    expect(out.indexOf("# Process: Lasting\n")).toBeLessThan(
      out.indexOf("# Process: Lasting, the Fading"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
