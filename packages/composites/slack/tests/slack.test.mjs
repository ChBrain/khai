import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const BRIDGES = ["process_slack_tunnel.md", "process_slack_tax.md", "process_slack_grip.md"];

describe("slack: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("slack: manifest", () => {
  it("declares a process composite on persona: a room root over three bridges", () => {
    expect(manifest.engine).toBe("slack");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_slack.md");
  });

  it("hangs all three bridges off the slack root, in order of what is taken", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe("process_slack.md");
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // The cargo link is advisory, not a hard gate: a persona may link what their shortfall
    // is taking, and the audit surfaces where a play stages a persona under a lack and
    // reads their conduct as disposition.
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

describe("slack: atoms", () => {
  it("re-exports the three engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["decision", "scarcity", "self-control"]);
    expect(atoms.scarcity.manifest.engine).toBe("scarcity");
    expect(atoms.decision.manifest.engine).toBe("decision");
    expect(atoms["self-control"].manifest.engine).toBe("self-control");
  });

  it("wires three process-typed atoms, all attached where the composite reads", () => {
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

  // The composite's claim is about where the tax lands, so it needs the capacity member
  // on one side and the standing trait on the other: bandwidth is what the shortfall
  // occupies, and the disciplined position is the reading taken off the result. Lose
  // either and the keystone has no two ends to connect.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.scarcity.manifest.members.map((m) => m.file)).toContain("process_bandwidth.md");
    expect(atoms["self-control"].manifest.members.map((m) => m.file)).toContain(
      "position_disciplined.md",
    );
  });
});

describe("slack: compose()", () => {
  it("composes every bridge root-first, carrying the slack root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Slack")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_slack_grip.md" });
    expect(out.indexOf("# Process: Slack\n")).toBeLessThan(
      out.indexOf("# Process: Slack, the Grip"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
