import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_smarting_claim.md",
  "process_smarting_puncture.md",
  "process_smarting_return.md",
];

describe("smarting: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("smarting: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("smarting");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_smarting.md");
  });

  it("hangs all three bridges off the smarting root, in the order the path runs", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_smarting.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link what they claim about themselves and
    // what the room grants them, and the audit surfaces where a play stages a sudden
    // violence and never says what was contradicted.
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

describe("smarting: atoms", () => {
  it("re-exports the three engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["aggression", "narcissism", "self-esteem"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires two position atoms and one process atom, all attached where the composite reads", () => {
    expect(atoms.aggression.manifest.type).toBe("process");
    expect(atoms.narcissism.manifest.type).toBe("position");
    expect(atoms["self-esteem"].manifest.type).toBe("position");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // An engine belongs to as many composites as have a question for it. Two of these three
  // are wired again here: self-relation runs self-esteem inward as one mode of a persona's
  // stance toward their own self and cptsd runs it as early damage, while smarting reads it
  // outward as a claim a room can refuse; intergroup runs aggression on the us/them line
  // where the target is chosen by category, while smarting's target is chosen by proximity.
  // This pins the shared wiring so the reuse stays deliberate rather than accidental.
  it("shares self-esteem with self-relation and cptsd, and aggression with intergroup", () => {
    const deps = (name) =>
      Object.keys(
        JSON.parse(readFileSync(join(pkgDir, "..", name, "package.json"), "utf8")).dependencies,
      );
    expect(deps("self-relation")).toContain("@chbrain/khai-engine-self-esteem");
    expect(deps("cptsd")).toContain("@chbrain/khai-engine-self-esteem");
    expect(deps("intergroup")).toContain("@chbrain/khai-engine-aggression");
  });

  // The keystone runs from an exposed claim to a bill paid by somebody uninvolved. It needs
  // the injury-and-rivalry route at one end -- a refusal answered with antagonism rather
  // than revision -- and the displaced form at the other, which is what lets the path close
  // on a target who had nothing to do with it.
  it("keeps the members the keystone runs between", () => {
    const narc = atoms.narcissism.manifest.members.map((m) => m.file);
    expect(narc).toEqual(
      expect.arrayContaining(["process_injury.md", "process_narcissistic_rivalry.md"]),
    );
    expect(atoms.aggression.manifest.members.map((m) => m.file)).toContain("process_displaced.md");
  });

  // Self-esteem is a shorthand-root engine -- an `anchor` plus named `expressions`, no
  // `members` array -- while narcissism and aggression carry full member trees, so a
  // consumer reading these trees has to handle both shapes. The claim bridge links the
  // contingent form by name, since a regard staked on a domain is what puts it where the
  // room can refuse it.
  it("keeps both manifest shapes, and the contingent form the claim bridge reads", () => {
    const esteem = atoms["self-esteem"].manifest;
    expect(esteem.members).toBeUndefined();
    expect(esteem.anchor).toBe("position_self_esteem.md");
    expect(esteem.expressions).toEqual({
      high: "position_high_esteem.md",
      low: "position_low_esteem.md",
      contingent: "position_contingent.md",
    });
    expect(Array.isArray(atoms.narcissism.manifest.members)).toBe(true);
    expect(Array.isArray(atoms.aggression.manifest.members)).toBe(true);
  });
});

describe("smarting: compose()", () => {
  it("composes every bridge root-first, carrying the smarting root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Smarting")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_smarting_return.md" });
    expect(out.indexOf("# Process: Smarting\n")).toBeLessThan(
      out.indexOf("# Process: Smarting, the Return"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
