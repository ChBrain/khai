// The escalation engine tests only what is escalation-specific: that the
// package conforms to the canon through the shared conformance kit
// (@chbrain/khai-tests), its manifest contract, and its compose() behavior.
// The kit's own drift detection is proved in @chbrain/khai-tests.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

// --- self-conformance: escalation certifies itself against the canon ------
describe("escalation: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

// --- manifest contract ----------------------------------------------------
describe("escalation: manifest", () => {
  it("declares the escalation spiral engine: a process root with three members", () => {
    expect(manifest.engine).toBe("escalation");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("process_escalation.md");
    expect(root.type).toBe("process");
    const children = manifest.members.filter((m) => m.parent === "process_escalation.md");
    expect(children).toHaveLength(3);
    expect(children.map((m) => m.file).sort()).toEqual([
      "position_antagonist.md",
      "process_hardening.md",
      "process_retaliation.md",
    ]);
  });

  it("declares both enforceable wiring altitudes, each at its level", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "persona",
      section: "Projection",
      link: "expression",
      level: "fail",
    });
  });
});

// --- behavior: compose() carries the spiral anchor upward -------------------
describe("escalation: compose()", () => {
  const root = "Process: Escalation";

  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: anchor first, then the member`, () => {
      const out = compose({ leaf });
      expect(out.includes(root)).toBe(true);
    });
  }

  it("rejects an unknown member", () => {
    expect(() => compose({ leaf: "position_bystander.md" })).toThrow();
  });

  it("rejects a missing member", () => {
    expect(() => compose({})).toThrow();
  });
});
