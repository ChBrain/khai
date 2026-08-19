import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_unmoored_roam.md",
  "process_unmoored_itch.md",
  "process_unmoored_loop.md",
];

describe("unmoored: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("unmoored: manifest", () => {
  it("declares a process composite on persona: an off-task root over three bridges", () => {
    expect(manifest.engine).toBe("unmoored");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_unmoored.md");
  });

  it("hangs all three bridges off the unmoored root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_unmoored.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The cargo link is advisory, not a hard gate: a persona may link the state their
    // attention is in when it is off the task, and the audit surfaces where a play shows
    // a persona not attending and never says which of the three it is.
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

describe("unmoored: atoms", () => {
  it("re-exports the three off-task engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["boredom", "mind-wandering", "rumination"]);
    expect(atoms["mind-wandering"].manifest.engine).toBe("mind-wandering");
    expect(atoms.boredom.manifest.engine).toBe("boredom");
    expect(atoms.rumination.manifest.engine).toBe("rumination");
  });

  it("wires three process-typed atoms, all attached where the composite reads", () => {
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.type, name).toBe("process");
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // An engine belongs to as many composites as have a question for it. The creativity
  // composite wires this same mind-wandering engine as the incubating drift toward an
  // insight; here it is one of three ways attention leaves a task. Neither owns it, and
  // this pins the shared wiring so the pair stays deliberate rather than accidental.
  it("shares the mind-wandering engine with the creativity composite", () => {
    const creativity = JSON.parse(
      readFileSync(join(pkgDir, "..", "creativity", "package.json"), "utf8"),
    );
    expect(Object.keys(creativity.dependencies)).toContain("@chbrain/khai-engine-mind-wandering");
    expect(atoms["mind-wandering"].manifest.engine).toBe("mind-wandering");
  });
});

describe("unmoored: compose()", () => {
  it("composes every bridge root-first, carrying the unmoored root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Unmoored")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_unmoored_loop.md" });
    expect(out.indexOf("# Process: Unmoored\n")).toBeLessThan(
      out.indexOf("# Process: Unmoored, the Loop"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
