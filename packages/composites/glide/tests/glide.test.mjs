import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_glide_monitor.md", "process_glide_trace.md", "process_glide_ease.md"];

describe("glide: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("glide: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("glide");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_glide.md");
  });

  it("hangs all three bridges off the glide root, in the order the loop turns", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_glide.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link what they take themselves to have
    // learned and what they did about it, and the audit surfaces where a play has a persona
    // fail at something they had every reason to think they knew.
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

describe("glide: atoms", () => {
  it("re-exports the three engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["confusion", "memory", "metacognition"]);
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
  // are wired again here: elsewhere runs memory as one of the ways a mind leaves the room,
  // while glide runs it as the thing being built while somebody watches the wrong dial;
  // knowing runs confusion as one of the epistemic emotions, while glide runs it as the felt
  // cost of the study regime that works. This pins both pairs so the reuse stays deliberate.
  it("shares memory with elsewhere and confusion with knowing", () => {
    const deps = (name) =>
      Object.keys(
        JSON.parse(readFileSync(join(pkgDir, "..", name, "package.json"), "utf8")).dependencies,
      );
    expect(deps("elsewhere")).toContain("@chbrain/khai-engine-memory");
    expect(deps("knowing")).toContain("@chbrain/khai-engine-confusion");
  });

  // The composite deliberately does not own the misjudgement, which the bias engine already
  // holds as a standing position under ease -- the fluency heuristic and the
  // misinterpreted-effort case among them. Glide begins after that and reads what the
  // misreading governs, so the boundary only holds while bias still carries them. This pins
  // the delegation the Restrictions section makes.
  it("leaves the smooth-is-mastery tilt with the bias engine, where it is catalogued", () => {
    const bias = JSON.parse(
      readFileSync(join(pkgDir, "..", "..", "engines", "bias", "package.json"), "utf8"),
    );
    const files = bias.khai.members.map((m) => m.file);
    expect(files).toEqual(
      expect.arrayContaining([
        "position_ease_fluency.md",
        "position_misinterpreted_effort.md",
        "position_fluency_heuristic.md",
      ]),
    );
    expect(Object.keys(manifest)).not.toContain("@chbrain/khai-engine-bias");
  });

  // The keystone runs from a reading with one loud cue to a policy that removes the material
  // still needing work. It needs steering at one end -- the reading is a control signal, not
  // just a description -- and confusion's productive fork at the other, since the resolve is
  // exactly what a comfort-steered learner clears out of the way.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.metacognition.manifest.members.map((m) => m.file)).toContain(
      "process_steering.md",
    );
    expect(atoms.confusion.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_confusion_resolve.md", "process_confusion_stall.md"]),
    );
  });
});

describe("glide: compose()", () => {
  it("composes every bridge root-first, carrying the glide root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Glide")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_glide_ease.md" });
    expect(out.indexOf("# Process: Glide\n")).toBeLessThan(
      out.indexOf("# Process: Glide, the Ease"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
