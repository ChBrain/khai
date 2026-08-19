import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_margin_slide.md", "process_margin_load.md", "process_margin_calm.md"];

describe("margin: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("margin: manifest", () => {
  it("declares a process composite: a reserve root over three bridges", () => {
    expect(manifest.engine).toBe("margin");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_margin.md");
  });

  it("hangs all three bridges off the margin root", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_margin.md");
    }
  });

  it("wires the law at fail and the cargo on process at Direction, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The cargo link sits on process/Direction, the same chapter both atoms attach to,
    // dropped to audit: a running process may say what its margin is doing, and the audit
    // surfaces where a play shows a process ending somewhere nobody chose and never says
    // how it got there.
    expect(manifest.requires).toContainEqual({
      on: "process",
      section: "Direction",
      link: "expression",
      level: "audit",
    });
    const cargo = manifest.requires.filter((r) => r.on !== "instructions");
    expect(cargo.map((r) => r.on)).toEqual(["process"]);
  });
});

describe("margin: atoms", () => {
  it("re-exports the two direction engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["drift", "tipping-point"]);
    expect(atoms.drift.manifest.engine).toBe("drift");
    expect(atoms["tipping-point"].manifest.engine).toBe("tipping-point");
  });

  // The composite's warrant is that these two are the whole family: they are the only
  // engines that bend a running process's Direction, which is why reading them together
  // is a completion rather than a selection. If a third such engine ever ships, this
  // composite has a gap and REFERENCES overclaims.
  it("keeps both atoms attached to the same chapter it wires on", () => {
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.type, name).toBe("process");
      expect(atom.manifest.requires, name).toContainEqual({
        on: "process",
        section: "Direction",
        link: "expression",
        level: "fail",
      });
    }
  });
});

describe("margin: compose()", () => {
  it("composes every bridge root-first, carrying the margin root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Margin")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_margin_calm.md" });
    expect(out.indexOf("# Process: Margin\n")).toBeLessThan(
      out.indexOf("# Process: Margin, the Calm"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
