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
  "process_heeding_hearing.md",
  "process_heeding_deference.md",
  "process_heeding_mandate.md",
];

describe("heeding: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("heeding: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("heeding");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_heeding.md");
  });

  it("hangs all three bridges off the heeding root, in the order the purchase runs", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_heeding.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link the hearing they were given and whether
    // the question is a mandate for them, and the audit surfaces where a play has a persona
    // comply or refuse and never says how they were treated.
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

describe("heeding: atoms", () => {
  it("re-exports the three engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["law", "moral-conviction", "recognition"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires two position atoms and a process atom, all attached where the composite reads", () => {
    expect(atoms.law.manifest.type).toBe("position");
    expect(atoms["moral-conviction"].manifest.type).toBe("position");
    expect(atoms.recognition.manifest.type).toBe("process");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // First composite to wire the law engine, and it deliberately carries the account law
  // itself delegates rather than owns: law states the condition a persona is under, this
  // reads what they do inside it. If a second composite ever wires law, that boundary is
  // the thing to keep straight.
  it("is the only composite wiring the law engine so far", () => {
    const dir = join(pkgDir, "..");
    const wiring = readdirSync(dir).filter((name) => {
      const pkg = join(dir, name, "package.json");
      try {
        return (
          "@chbrain/khai-engine-law" in (JSON.parse(readFileSync(pkg, "utf8")).dependencies ?? {})
        );
      } catch {
        return false;
      }
    });
    expect(wiring).toEqual(["heeding"]);
  });

  // An engine belongs to as many composites as have a question for it. Recognition and
  // moral-conviction are each wired elsewhere; this pins that the sharing is deliberate
  // rather than accidental, and that heeding claims neither.
  it("shares recognition and moral-conviction rather than owning them", () => {
    for (const dep of [
      "@chbrain/khai-engine-recognition",
      "@chbrain/khai-engine-moral-conviction",
    ]) {
      expect(Object.keys(readPkg(pkgDir).dependencies)).toContain(dep);
    }
    expect(atoms.recognition.manifest.engine).toBe("recognition");
    expect(atoms["moral-conviction"].manifest.engine).toBe("moral-conviction");
  });

  // The keystone runs from an encounter to a refusal. It needs recognition's encounter and
  // standing phases at one end -- the hearing is read as an encounter that returns a
  // standing -- and moral-conviction's intolerance face at the other, since that is the
  // face already turned toward procedure before the procedure has done anything.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.recognition.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_encounter.md", "process_standing.md"]),
    );
    expect(atoms["moral-conviction"].manifest.expressions).toEqual(
      expect.objectContaining({ intolerance: "position_intolerance.md" }),
    );
    expect(atoms.law.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["position_gap_law.md", "position_with_the_law.md"]),
    );
  });

  // moral-conviction is a shorthand-root engine -- an `anchor` and named `expressions`, no
  // `members` array -- while law and recognition carry full member trees, so a consumer
  // reading these has to handle both shapes.
  it("keeps the shorthand root the mandate bridge links", () => {
    const mc = atoms["moral-conviction"].manifest;
    expect(mc.members).toBeUndefined();
    expect(mc.anchor).toBe("position_moral_conviction.md");
    expect(Array.isArray(atoms.law.manifest.members)).toBe(true);
    expect(Array.isArray(atoms.recognition.manifest.members)).toBe(true);
  });
});

describe("heeding: the evidence is not overstated", () => {
  // Procedural justice is well replicated correlationally and much weaker under randomised
  // test. The references must say so rather than borrowing the stronger literature's
  // confidence for the composite's claim.
  it("names the weakness in the joining's causal leg", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/weaker is the causal direction and the size/i);
    expect(refs).toMatch(/randomised procedural-justice interventions/i);
  });
  // The twist is vignette-based and run on a small number of highly moralised issues.
  it("names the limit on the twist's reach", () => {
    expect(flat("REFERENCES.md")).toMatch(/vignette-based/);
  });
});

describe("heeding: compose()", () => {
  it("composes every bridge root-first, carrying the heeding root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Heeding")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_heeding_mandate.md" });
    expect(out.indexOf("# Process: Heeding\n")).toBeLessThan(
      out.indexOf("# Process: Heeding, the Mandate"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});

function readPkg(dir) {
  return JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
}
