import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_carrying_mark.md",
  "process_carrying_tell.md",
  "process_carrying_keeping.md",
];

describe("carrying: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("carrying: manifest", () => {
  it("declares a process composite on persona: a holding root over three bridges", () => {
    expect(manifest.engine).toBe("carrying");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_carrying.md");
  });

  it("hangs all three bridges off the carrying root, ordered by who knows", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_carrying.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The cargo link is advisory, not a hard gate: a persona may link what they carry and
    // who knows, and the audit surfaces where a play gives a persona a discrediting
    // attribute and never says what holding it costs them.
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

describe("carrying: atoms", () => {
  it("re-exports the three engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["secret", "shame", "stigma"]);
    expect(atoms.stigma.manifest.engine).toBe("stigma");
    expect(atoms.secret.manifest.engine).toBe("secret");
    expect(atoms.shame.manifest.engine).toBe("shame");
  });

  // A composite's own type is what its members are; its atoms answer to their own. Two
  // of these are piece-typed engines that attach at persona, which is what lets a mark
  // and a withheld fact be read as things a persona is holding rather than as objects.
  it("wires atoms of mixed type, all attached where the composite reads", () => {
    expect(atoms.stigma.manifest.type).toBe("piece");
    expect(atoms.secret.manifest.type).toBe("piece");
    expect(atoms.shame.manifest.type).toBe("process");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // An engine belongs to as many composites as have a question for it. The membership
  // composite wires this same stigma engine as one of the ways a group keeps a boundary;
  // here it is read from the bearer's side. This pins the shared wiring so the pair stays
  // deliberate, and pins the two members the discredited/discreditable split runs on.
  it("shares the stigma engine with membership, and keeps the split it turns on", () => {
    const membership = JSON.parse(
      readFileSync(join(pkgDir, "..", "membership", "package.json"), "utf8"),
    );
    expect(Object.keys(membership.dependencies)).toContain("@chbrain/khai-engine-stigma");
    const files = atoms.stigma.manifest.members.map((m) => m.file);
    expect(files).toContain("process_discrediting.md");
    expect(files).toContain("process_passing.md");
  });
});

describe("carrying: compose()", () => {
  it("composes every bridge root-first, carrying the carrying root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Carrying")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_carrying_keeping.md" });
    expect(out.indexOf("# Process: Carrying\n")).toBeLessThan(
      out.indexOf("# Process: Carrying, the Keeping"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
