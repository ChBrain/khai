import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_vigil_threshold.md", "process_vigil_guard.md", "process_vigil_proof.md"];

describe("vigil: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("vigil: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("vigil");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_vigil.md");
  });

  it("hangs all three bridges off the vigil root, in the order the episode runs", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_vigil.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link what they are guarding and what would
    // settle it, and the audit surfaces where a play stages a jealousy and never says what
    // the persona was trying to establish.
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

describe("vigil: atoms", () => {
  it("re-exports the three engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["attachment", "jealousy", "trust"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires three process atoms, all attached where the composite reads", () => {
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

  // An engine belongs to as many composites as have a question for it. Two of these three
  // are wired again here: dealing runs trust on a bargain where the vulnerability is
  // contractual, while vigil runs it on a bond where the vulnerability is the whole
  // relationship; cptsd and freud run attachment on the history that set the strategy, while
  // vigil takes the strategy as it arrives and reads what it does tonight. This pins the
  // shared wiring so the reuse stays deliberate rather than accidental.
  it("shares trust with dealing, and attachment with cptsd and freud", () => {
    const deps = (name) =>
      Object.keys(
        JSON.parse(readFileSync(join(pkgDir, "..", name, "package.json"), "utf8")).dependencies,
      );
    expect(deps("dealing")).toContain("@chbrain/khai-engine-trust");
    expect(deps("cptsd")).toContain("@chbrain/khai-engine-attachment");
    expect(deps("freud")).toContain("@chbrain/khai-engine-attachment");
  });

  // The keystone runs from a bar set by history to a reassurance that cannot count. It needs
  // the four attachment strategies at one end -- the threshold is theirs, not the rival's --
  // and trust's extend/test pair at the other, since the twist is precisely that testing is
  // what a persona does instead of extending, and only extending would settle it.
  it("keeps the members the keystone runs between", () => {
    const strategies = atoms.attachment.manifest.members.map((m) => m.file);
    expect(strategies).toEqual(
      expect.arrayContaining([
        "process_secure.md",
        "process_anxious.md",
        "process_avoidant.md",
        "process_disorganized.md",
      ]),
    );
    const bets = atoms.trust.manifest.members.map((m) => m.file);
    expect(bets).toEqual(expect.arrayContaining(["process_extend.md", "process_test.md"]));
  });

  // The jealousy atom is the only one of the three the composite does not share with another
  // composite, and it supplies all three of the guard bridge's moves. Losing the guarding
  // member would leave the middle bridge with nothing to link.
  it("keeps the jealousy members the guard bridge links", () => {
    const files = atoms.jealousy.manifest.members.map((m) => m.file);
    expect(files).toEqual(
      expect.arrayContaining([
        "process_threat_appraisal.md",
        "position_jealous.md",
        "process_guarding.md",
      ]),
    );
  });
});

describe("vigil: compose()", () => {
  it("composes every bridge root-first, carrying the vigil root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Vigil")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_vigil_proof.md" });
    expect(out.indexOf("# Process: Vigil\n")).toBeLessThan(
      out.indexOf("# Process: Vigil, the Proof"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
