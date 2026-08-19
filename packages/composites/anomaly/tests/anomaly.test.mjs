import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_anomaly_scheme.md",
  "process_anomaly_misfit.md",
  "process_anomaly_recoil.md",
];

describe("anomaly: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("anomaly: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("anomaly");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_anomaly.md");
  });

  it("hangs all three bridges off the anomaly root, in the order the path runs", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_anomaly.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link the kinds they sort by and what they
    // cannot place, and the audit surfaces where a play stages a revulsion and never says
    // what boundary it was defending.
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

describe("anomaly: atoms", () => {
  it("re-exports the three engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["categorization", "disgust", "uncanny"]);
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

  // An engine belongs to as many composites as have a question for it. Condemnation wires
  // this same disgust engine as one of the three other-condemning moral emotions and hate as
  // an ingredient of durable hostility; both need somebody who has done something. Anomaly
  // runs it on a thing that has done nothing, which is what makes the mechanism visible
  // without a moral reading on top of it. This pins the shared wiring so the reuse stays
  // deliberate rather than accidental.
  it("shares the disgust engine with condemnation and hate", () => {
    const deps = (name) =>
      Object.keys(
        JSON.parse(readFileSync(join(pkgDir, "..", name, "package.json"), "utf8")).dependencies,
      );
    expect(deps("condemnation")).toContain("@chbrain/khai-engine-disgust");
    expect(deps("hate")).toContain("@chbrain/khai-engine-disgust");
  });

  // The keystone runs from a scheme that cannot record a failure to a feeling read as a
  // property of the object. It needs the animate blur at one end -- the sharpest case of a
  // sort that will not decide -- and contamination at the other, since contagion and
  // similarity are why the recoil outlasts any argument against it.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.uncanny.manifest.members.map((m) => m.file)).toContain("process_animate.md");
    expect(atoms.disgust.manifest.members.map((m) => m.file)).toContain("process_contamination.md");
  });

  // The scheme bridge links all three bases by name, because which one a persona leans on
  // decides the borderline case and therefore whether there is a misfit at all. Losing any
  // of them would leave the first bridge unable to say how the sorting was done.
  it("keeps the three bases of membership the scheme bridge links", () => {
    expect(atoms.categorization.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_prototype.md", "process_exemplars.md", "process_theory.md"]),
    );
  });
});

describe("anomaly: compose()", () => {
  it("composes every bridge root-first, carrying the anomaly root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Anomaly")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_anomaly_recoil.md" });
    expect(out.indexOf("# Process: Anomaly\n")).toBeLessThan(
      out.indexOf("# Process: Anomaly, the Recoil"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
