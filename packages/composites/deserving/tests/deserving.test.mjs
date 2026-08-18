import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_deserving_lens.md",
  "process_deserving_price.md",
  "process_deserving_lift.md",
];

describe("deserving: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("deserving: manifest", () => {
  it("declares a process composite on persona: a desert root over three bridges", () => {
    expect(manifest.engine).toBe("deserving");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_deserving.md");
  });

  it("hangs all three bridges off the deserving root, in order of avowal", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_deserving.md");
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
    // they hold another to have coming, and the audit surfaces where a play shows a fall
    // and never says who was glad.
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

describe("deserving: atoms", () => {
  it("re-exports the three desert engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual([
      "altruistic-punishment",
      "moral-judgment",
      "schadenfreude",
    ]);
    expect(atoms["moral-judgment"].manifest.engine).toBe("moral-judgment");
    expect(atoms["altruistic-punishment"].manifest.engine).toBe("altruistic-punishment");
    expect(atoms.schadenfreude.manifest.engine).toBe("schadenfreude");
  });

  it("wires one position-typed atom over two process-typed ones", () => {
    expect(atoms["moral-judgment"].manifest.type).toBe("position");
    expect(atoms["altruistic-punishment"].manifest.type).toBe("process");
    expect(atoms.schadenfreude.manifest.type).toBe("process");
  });
});

describe("deserving: compose()", () => {
  it("composes every bridge root-first, carrying the deserving root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Deserving")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_deserving_lift.md" });
    expect(out.indexOf("# Process: Deserving\n")).toBeLessThan(
      out.indexOf("# Process: Deserving, the Lift"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
