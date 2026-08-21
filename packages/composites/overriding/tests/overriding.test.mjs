import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const BRIDGES = [
  "process_overriding_rule.md",
  "process_overriding_call.md",
  "process_overriding_reckoning.md",
];

describe("overriding: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("overriding: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("overriding");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_overriding.md");
  });

  it("hangs all three bridges off the overriding root, in the order the contest runs", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_overriding.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link whether they hold discretion
    // over an instrument and how often they use it, and the audit surfaces where a
    // play gives a practitioner a departure and never says what the departures
    // come to.
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

describe("overriding: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["expertise", "measure"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires two process atoms, both attached where the composite reads", () => {
    expect(atoms.measure.manifest.type).toBe("process");
    expect(atoms.expertise.manifest.type).toBe("process");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // The pairing is deliberate: the measure engine's residue and the expertise
  // engine's tacit movement are the same absence seen from two sides -- what the
  // record has no column for, and what the practitioner cannot state. Losing
  // either member would leave the composite with no account of what the
  // instrument is blind to.
  it("keeps the two members the keystone runs between", () => {
    expect(atoms.measure.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_residue.md", "process_common_scale.md"]),
    );
    expect(atoms.expertise.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_tacit.md", "process_expert_stage.md"]),
    );
  });

  // First composite to wire either atom. If a second ever wires one, the boundary
  // to keep straight is that this composite owns neither -- it owns only the
  // contest where the two disagree.
  it("is the only composite wiring measure or expertise so far", () => {
    const dir = join(pkgDir, "..");
    const wiring = (name) =>
      readdirSync(dir).filter((c) => {
        try {
          const pkg = JSON.parse(readFileSync(join(dir, c, "package.json"), "utf8"));
          return name in (pkg.dependencies ?? {});
        } catch {
          return false;
        }
      });
    expect(wiring("@chbrain/khai-engine-measure")).toEqual(["overriding"]);
    expect(wiring("@chbrain/khai-engine-expertise")).toEqual(["overriding"]);
  });
});

describe("overriding: the finding is not flattened", () => {
  // The exception has to be real or the composite is a lecture: the practitioner
  // is frequently right, and Meehl himself insisted on the broken-leg case.
  it("keeps the practitioner's information genuine", () => {
    const call = flat("process_overriding_call.md");
    expect(call).toMatch(/the perception is genuine and the case for discretion is strong/i);
    expect(call).toMatch(/broken leg/i);
  });
  // The rule's advantage is consistency, not insight. Staging it as an oracle
  // would misdescribe the mechanism the whole composite runs on.
  it("keeps the rule's advantage consistency rather than insight", () => {
    const rule = flat("process_overriding_rule.md");
    expect(rule).toMatch(/advantage is not insight\. It is consistency/i);
    expect(rule).toMatch(/elimination of noise rather than the addition of knowledge/i);
    expect(flat("playwright_instructions.md")).toMatch(/Do keep the instrument dull/);
  });
  // Algorithm aversion is the weakest leg and has a contrary literature; the
  // references must name it rather than presenting the asymmetry as settled.
  it("names algorithm appreciation as the contrary finding", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Algorithm aversion is the weakest leg here/i);
    expect(refs).toMatch(/algorithm appreciation/i);
  });
  // The composite must not be used to settle whether an instrument is fair.
  it("refuses to adjudicate the instrument itself", () => {
    expect(flat("REFERENCES.md")).toMatch(/Whether the instrument is fair \(the world\)/);
    expect(flat("playwright_instructions.md")).toMatch(
      /Do not use the composite to settle whether an instrument is fair/,
    );
  });
});

describe("overriding: compose()", () => {
  it("composes every bridge root-first, carrying the overriding root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Overriding")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_overriding_reckoning.md" });
    expect(out.indexOf("# Process: Overriding\n")).toBeLessThan(
      out.indexOf("# Process: Overriding, the Reckoning"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
