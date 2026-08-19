import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_accent_width.md", "process_accent_code.md", "process_accent_discount.md"];

describe("accent: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("accent: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("accent");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_accent.md");
  });

  it("hangs all three bridges off the accent root, in the order the crossing runs", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_accent.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link the width they hold each channel at and
    // the code the room is running, and the audit surfaces where a play has somebody taken
    // less seriously and never says what they were speaking through.
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

describe("accent: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["language", "register"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires a process atom and a position atom, both attached where the composite reads", () => {
    expect(atoms.language.manifest.type).toBe("process");
    expect(atoms.register.manifest.type).toBe("position");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // An engine belongs to as many composites as have a question for it. Utterance wires this
  // same register engine with implicature, speech act, and tone, reading a persona in
  // conversation; accent runs it as a gate somebody is standing outside, and its subject is
  // the listener's bill rather than the speaker's craft. This pins the shared wiring so the
  // pair stays deliberate rather than accidental.
  it("shares the register engine with the utterance composite", () => {
    const utterance = JSON.parse(
      readFileSync(join(pkgDir, "..", "utterance", "package.json"), "utf8"),
    );
    expect(Object.keys(utterance.dependencies)).toContain("@chbrain/khai-engine-register");
    expect(atoms.register.manifest.engine).toBe("register");
  });

  // The width bridge reads per channel rather than per persona, which needs the widths to be
  // separately declared: a persona may hold speaking at borrowed while hearing runs at
  // native. Collapse them and the bridge's central claim -- that a room takes the narrowest
  // visible channel as the measure of the whole -- has nothing to stand on.
  it("keeps the per-channel widths the width bridge reads", () => {
    const files = atoms.language.manifest.members.map((m) => m.file);
    expect(files).toEqual(
      expect.arrayContaining([
        "process_speaking_borrowed.md",
        "process_speaking_carried.md",
        "process_speaking_worn.md",
        "process_speaking_mother_tongue.md",
        "process_hearing_decoded.md",
        "process_hearing_mother_tongue.md",
      ]),
    );
  });

  // The keystone runs from two independent gates to one bill. It needs the borrowed width at
  // one end and closure at the other, since those are the two ways a crossing gets expensive
  // and the composite's claim is that a listener cannot tell which one produced the effort.
  it("keeps the two gates the keystone compounds", () => {
    expect(atoms.language.manifest.members.map((m) => m.file)).toContain(
      "process_speaking_borrowed.md",
    );
    expect(atoms.register.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["position_closure.md", "position_translation.md"]),
    );
  });
});

describe("accent: compose()", () => {
  it("composes every bridge root-first, carrying the accent root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Accent")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_accent_discount.md" });
    expect(out.indexOf("# Process: Accent\n")).toBeLessThan(
      out.indexOf("# Process: Accent, the Discount"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
