import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_airing_stage.md",
  "process_airing_stance.md",
  "process_airing_silence.md",
];

describe("airing: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("airing: manifest", () => {
  it("declares a process composite on persona: a collective root over three bridges", () => {
    expect(manifest.engine).toBe("airing");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_airing.md");
  });

  it("hangs all three bridges off the airing root, in order of grain", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_airing.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The composite's cargo link is advisory, not a hard gate: a persona may link the
    // collective they are speaking inside, and the audit surfaces where a play reads a
    // quiet room as a working one.
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

describe("airing: atoms", () => {
  it("re-exports the three collective engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["group", "org", "psychological-safety"]);
    expect(atoms.group.manifest.engine).toBe("group");
    expect(atoms.org.manifest.engine).toBe("org");
    expect(atoms["psychological-safety"].manifest.engine).toBe("psychological-safety");
  });

  it("wires a place-typed atom alongside two process-typed ones", () => {
    expect(atoms["psychological-safety"].manifest.type).toBe("place");
    expect(atoms.group.manifest.type).toBe("process");
    expect(atoms.org.manifest.type).toBe("process");
  });
});

describe("airing: compose()", () => {
  it("composes every bridge root-first, carrying the airing root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Airing")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_airing_silence.md" });
    expect(out.indexOf("# Process: Airing\n")).toBeLessThan(
      out.indexOf("# Process: Airing, the Silence"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
