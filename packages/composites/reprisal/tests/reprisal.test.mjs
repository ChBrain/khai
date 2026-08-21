import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const BRIDGES = [
  "process_reprisal_score.md",
  "process_reprisal_stroke.md",
  "process_reprisal_keeping.md",
];

describe("reprisal: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("reprisal: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("reprisal");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_reprisal.md");
  });

  it("hangs all three bridges off the reprisal root, in the order the transaction runs", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_reprisal.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link the score they hold and whether
    // they have taken the stroke, and the audit surfaces where a play has a persona
    // get even and never says what they are doing with it a week later.
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

describe("reprisal: atoms", () => {
  it("re-exports the three engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["bias", "forgiveness", "rumination"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires two process atoms and a position atom, all attached where the composite reads", () => {
    expect(atoms.forgiveness.manifest.type).toBe("process");
    expect(atoms.rumination.manifest.type).toBe("process");
    expect(atoms.bias.manifest.type).toBe("position");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // An engine belongs to as many composites as have a question for it. Moral-account
  // wires this same forgiveness engine, reading one wrong across three ledgers that
  // refuse to agree; reprisal runs it forward from the wronged party alone and asks
  // what their own answer costs them. This pins the sharing so it stays deliberate.
  it("shares the forgiveness engine with the moral-account composite", () => {
    const other = JSON.parse(
      readFileSync(join(pkgDir, "..", "moral-account", "package.json"), "utf8"),
    );
    expect(Object.keys(other.dependencies)).toContain("@chbrain/khai-engine-forgiveness");
    expect(atoms.forgiveness.manifest.engine).toBe("forgiveness");
  });

  // A composite may take a single member from a very large atom rather than the tree.
  // Bias carries hundreds of tilts and this composite links exactly one of them, so a
  // consumer must not assume a declared atom is used whole.
  it("takes one member from the bias tree rather than the tree", () => {
    const files = atoms.bias.manifest.members.map((m) => m.file);
    expect(files).toContain("position_impact_bias.md");
    expect(files.length).toBeGreaterThan(50);
    const linked = BRIDGES.concat("process_reprisal.md")
      .map((f) => flat(f))
      .join(" ");
    const biasLinks = [...linked.matchAll(/@chbrain\/khai-engine-bias\/([a-z_]+\.md)/g)].map(
      (m) => m[1],
    );
    expect([...new Set(biasLinks)]).toEqual(["position_impact_bias.md"]);
  });

  // The keystone runs from a stance through a forecast into a loop. It needs the
  // vengeful stance at one end -- not the avoidant or benevolent one -- and the
  // replaying form at the other, since that is the loop an unfinished episode runs in.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.forgiveness.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["position_stance_vengeful.md"]),
    );
    expect(atoms.rumination.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_replaying.md"]),
    );
  });
});

describe("reprisal: the finding is not flattened", () => {
  // The satisfaction at the stroke is real. A composite that made it hollow would
  // have replaced the mechanism with a moral, and the persona would read as foolish.
  it("keeps the stroke's discharge genuine", () => {
    const stroke = flat("process_reprisal_stroke.md");
    expect(stroke).toMatch(/there is one, it is not imaginary/);
    expect(stroke).toMatch(/has lied about the mechanism/);
  });
  // Gollwitzer's message account is the reason "revenge never satisfies" is not the
  // finding. The exception is kept, and it is kept in the keeping bridge.
  it("keeps the exception the persona does not control", () => {
    const keeping = flat("process_reprisal_keeping.md");
    expect(keeping).toMatch(/legible that they understood/);
    expect(keeping).toMatch(/the reply is the only thing that ends it/);
  });
  // The lab-game reach and the honour-culture bound are the two limits most likely
  // to be over-read, and the references must name both.
  it("names the reach and the cultural bound", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/weaker is the reach/i);
    expect(refs).toMatch(/laboratory games with modest stakes among strangers/);
    expect(refs).toMatch(/honour is a standing obligation/);
  });
});

describe("reprisal: compose()", () => {
  it("composes every bridge root-first, carrying the reprisal root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Reprisal")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_reprisal_keeping.md" });
    expect(out.indexOf("# Process: Reprisal\n")).toBeLessThan(
      out.indexOf("# Process: Reprisal, the Keeping"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
