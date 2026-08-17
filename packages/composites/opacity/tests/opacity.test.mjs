import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = [
  "process_opacity_withheld.md",
  "process_opacity_feigned.md",
  "process_opacity_revealed.md",
];

describe("opacity: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("opacity: manifest", () => {
  it("declares a process composite on persona: an information-self root over three bridges", () => {
    expect(manifest.engine).toBe("opacity");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_opacity.md");
  });

  it("hangs all three bridges off the opacity root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_opacity.md");
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
    // posture its boundary is in, and the audit surfaces where it does not.
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

describe("opacity: atoms", () => {
  it("re-exports the three information-boundary engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["deception", "secret", "self-disclosure"]);
    expect(atoms.secret.manifest.engine).toBe("secret");
    expect(atoms["self-disclosure"].manifest.engine).toBe("self-disclosure");
    expect(atoms.deception.manifest.engine).toBe("deception");
  });
});

describe("opacity: compose()", () => {
  it("composes every bridge root-first, carrying the opacity root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Opacity")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_opacity_revealed.md" });
    expect(out.indexOf("# Process: Opacity\n")).toBeLessThan(
      out.indexOf("# Process: Opacity, Revealed"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
