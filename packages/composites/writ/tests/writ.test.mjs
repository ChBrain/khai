import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_writ_saying.md", "process_writ_fixing.md", "process_writ_reliance.md"];

describe("writ: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("writ: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("writ");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_writ.md");
  });

  it("hangs all three bridges off the writ root, in the order the act travels", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_writ.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link what the record says about them and what
    // they can do about it, and the audit surfaces where a play turns on a document and never
    // says who made it or under what conditions.
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

describe("writ: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["document", "speech-act"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  // The mixed typing is the composite's subject rather than an accident: the act is a
  // process and what it becomes is an object, and the passage between them is what is read.
  it("wires a piece atom and a process atom, both attached where the composite reads", () => {
    expect(atoms.document.manifest.type).toBe("piece");
    expect(atoms["speech-act"].manifest.type).toBe("process");
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
  // same speech-act engine with implicature, register, and tone, reading a persona in
  // conversation; writ runs it on a deed that has left the conversation entirely. This pins
  // the shared wiring so the pair stays deliberate rather than accidental.
  it("shares the speech-act engine with the utterance composite", () => {
    const utterance = JSON.parse(
      readFileSync(join(pkgDir, "..", "utterance", "package.json"), "utf8"),
    );
    expect(Object.keys(utterance.dependencies)).toContain("@chbrain/khai-engine-speech-act");
    expect(atoms["speech-act"].manifest.engine).toBe("speech-act");
  });

  // The keystone runs from an act valid only in its moment to a room with nothing but the
  // paper. It needs the declaration at one end -- the act that changes the world by being
  // said, given the standing -- and circulation at the other, since travelling into contexts
  // the author never occupies is what removes every way of checking it.
  it("keeps the members the keystone runs between", () => {
    expect(atoms["speech-act"].manifest.members.map((m) => m.file)).toContain(
      "process_declaration.md",
    );
    expect(atoms.document.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining([
        "process_inscription.md",
        "process_circulation.md",
        "position_bearer.md",
      ]),
    );
  });
});

describe("writ: compose()", () => {
  it("composes every bridge root-first, carrying the writ root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Writ")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_writ_reliance.md" });
    expect(out.indexOf("# Process: Writ\n")).toBeLessThan(
      out.indexOf("# Process: Writ, the Reliance"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
