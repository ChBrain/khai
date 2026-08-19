import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_upkeep_pool.md", "process_upkeep_read.md", "process_upkeep_sword.md"];

describe("upkeep: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("upkeep: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("upkeep");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_upkeep.md");
  });

  it("hangs all three bridges off the upkeep root, in the order the keeping runs", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_upkeep.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona may link what they draw from, what they put in,
    // and what they will pay to enforce, and the audit surfaces where a play has a shared
    // thing collapse and never says who had been holding it up.
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

describe("upkeep: atoms", () => {
  it("re-exports the three engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["altruistic-punishment", "commons", "trust"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires a place atom and two process atoms, all attached where the composite reads", () => {
    expect(atoms.commons.manifest.type).toBe("place");
    expect(atoms.trust.manifest.type).toBe("process");
    expect(atoms["altruistic-punishment"].manifest.type).toBe("process");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // An engine belongs to as many composites as have a question for it. Two of these three
  // are wired again here: dealing runs trust on a two-party bargain and vigil on a bond with
  // a rival near it, while upkeep runs it on a group, where the bet is placed on people in
  // general; deserving runs altruistic punishment as moral desert, while upkeep runs it as
  // the running fee for a shared thing. This pins both so the reuse stays deliberate.
  it("shares trust with dealing and vigil, and altruistic punishment with deserving", () => {
    const deps = (name) =>
      Object.keys(
        JSON.parse(readFileSync(join(pkgDir, "..", name, "package.json"), "utf8")).dependencies,
      );
    expect(deps("dealing")).toContain("@chbrain/khai-engine-trust");
    expect(deps("vigil")).toContain("@chbrain/khai-engine-trust");
    expect(deps("deserving")).toContain("@chbrain/khai-engine-altruistic-punishment");
  });

  // The keystone runs from a rule nobody is obliged to execute to a cost nobody sees. It
  // needs the commons sanction at one end -- the clause the pool cannot run itself -- and
  // both punishment forms at the other, since the twist holds whether the payer was defected
  // on or merely watching.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.commons.manifest.expressions.sanction).toBe("place_sanction.md");
    expect(atoms["altruistic-punishment"].manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_second_party.md", "process_third_party.md"]),
    );
  });

  // The commons atom is a shorthand-root engine -- an `anchor` and named `expressions`, no
  // `members` array -- while the other two carry full member trees, so a consumer reading
  // these manifests has to handle both shapes. The pool bridge links all three commons files
  // by name.
  it("keeps the shorthand root and the three commons files the pool bridge links", () => {
    const commons = atoms.commons.manifest;
    expect(commons.members).toBeUndefined();
    expect(commons.anchor).toBe("place_commons.md");
    expect(commons.expressions).toEqual({
      pool: "place_pool.md",
      boundary: "place_boundary.md",
      sanction: "place_sanction.md",
    });
    expect(Array.isArray(atoms.trust.manifest.members)).toBe(true);
    expect(Array.isArray(atoms["altruistic-punishment"].manifest.members)).toBe(true);
  });
});

describe("upkeep: compose()", () => {
  it("composes every bridge root-first, carrying the upkeep root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Upkeep")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_upkeep_sword.md" });
    expect(out.indexOf("# Process: Upkeep\n")).toBeLessThan(
      out.indexOf("# Process: Upkeep, the Sword"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
