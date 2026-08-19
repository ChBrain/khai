import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_dealing_table.md", "process_dealing_bet.md", "process_dealing_spiral.md"];

describe("dealing: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("dealing: manifest", () => {
  it("declares a process composite on persona: a mixed-motive root over three bridges", () => {
    expect(manifest.engine).toBe("dealing");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_dealing.md");
  });

  it("hangs all three bridges off the dealing root, in order of what is at risk", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_dealing.md");
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
    // dealing is in, and the audit surfaces where a play stages two parties who need each
    // other and never says which of the three states they are in.
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

describe("dealing: atoms", () => {
  it("re-exports the three bargaining engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["escalation", "negotiation", "trust"]);
    expect(atoms.negotiation.manifest.engine).toBe("negotiation");
    expect(atoms.trust.manifest.engine).toBe("trust");
    expect(atoms.escalation.manifest.engine).toBe("escalation");
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

  // Half the join is already declared inside the trust atom, which anchors Deutsch on
  // trust as a choice to expose oneself in a mixed-motive game. The bet bridge reads
  // exposure as an instrument with a price, which needs both the extending and the
  // withholding to be modelled: lose either and the bridge has only a sentiment left.
  it("keeps the trust members the bet bridge prices exposure through", () => {
    const files = atoms.trust.manifest.members.map((m) => m.file);
    expect(files).toContain("process_extend.md");
    expect(files).toContain("process_withhold.md");
  });
});

describe("dealing: compose()", () => {
  it("composes every bridge root-first, carrying the dealing root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Dealing")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_dealing_spiral.md" });
    expect(out.indexOf("# Process: Dealing\n")).toBeLessThan(
      out.indexOf("# Process: Dealing, the Spiral"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
