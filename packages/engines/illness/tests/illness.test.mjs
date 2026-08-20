// The illness engine tests only what is illness-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, the four-movement shape, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_illness.md";
const MOVEMENTS = [
  "process_disruption.md",
  "process_ticket.md",
  "process_sick_role.md",
  "process_telling.md",
];

describe("illness: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("illness: manifest", () => {
  it("declares the illness process tree with a single root", () => {
    expect(manifest.engine).toBe("illness");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- illness here is something that unfolds, not a state", () => {
    for (const m of manifest.members) expect(m.type).toBe("process");
  });
  it("every non-root member names a parent that exists", () => {
    const files = new Set(manifest.members.map((m) => m.file));
    for (const m of manifest.members) {
      if (m.parent !== null) expect(files.has(m.parent)).toBe(true);
    }
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

describe("illness: the four movements", () => {
  // The tree is exactly two deep: root -> movement -> stage. The movements are not
  // a sequence -- a persona can be rewriting their biography before any diagnosis
  // exists, and can be refused a ticket and never reach the role at all.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("puts every stage under a movement, never under the root or another stage", () => {
    const heads = new Set(MOVEMENTS);
    const stages = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(stages.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of stages) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps Parsons' bargain at two gifts and two prices", () => {
    // The role is the arrangement itself: exemption and absolution given,
    // obligation and cooperation owed. Dropping one of the four would turn the
    // bargain into something the twist no longer runs on.
    const four = manifest.members
      .filter((m) => m.parent === "process_sick_role.md")
      .map((m) => m.file);
    expect(four.sort()).toEqual([
      "process_absolution.md",
      "process_cooperation.md",
      "process_exemption.md",
      "process_obligation.md",
    ]);
  });
  it("carries exactly Frank's three narrative shapes", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_telling.md")
      .map((m) => m.file);
    expect(three.sort()).toEqual([
      "process_chaos_story.md",
      "process_quest_story.md",
      "process_restitution_story.md",
    ]);
  });
});

describe("illness: the twist lives at the root", () => {
  // The exemption's conditionality is a property of the bargain rather than of any
  // one term, so it belongs to the anchor. The role member carries it downward.
  it("the root names the loan in its Lever and its consequence in its Echo", () => {
    const root = flat(ROOT);
    expect(root.split("## Echo")[0]).toMatch(/relief is a loan against a recovery/);
    expect(root.split("## Echo")[1]).toMatch(
      /need it most permanently are the ones who cannot hold it/,
    );
  });
  it("the role movement carries the same keystone", () => {
    expect(flat("process_sick_role.md")).toMatch(/loan against a recovery/);
  });
});

describe("illness: what the engine refuses to claim", () => {
  // The ticket models a social gate, not a verdict on whether a condition is real,
  // and it must say so where a reader will meet it rather than only in the notes.
  it("separates the gate from the question of whether a condition is real", () => {
    expect(flat("process_ticket.md")).toMatch(
      /None of this is a claim about whether a condition is real/,
    );
    expect(flat("process_contested_illness.md")).toMatch(
      /Nothing here says whether a condition is real/,
    );
  });
  // Parsons is a 1951 functionalist ideal type and the social model of disability
  // rejects the frame outright. Both belong in the open.
  it("names the sick role's limits and the social model's objection", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/functionalist ideal type from 1951/);
    expect(refs).toMatch(/social model of disability rejects this frame outright/i);
    expect(flat("playwright_instructions.md")).toMatch(/social model of disability/);
  });
  // Chaos is a real account rather than a stage to be moved through, and the
  // playwright guide must refuse the two ways a play would tidy it away.
  it("keeps chaos from being resolved into the other two shapes", () => {
    expect(flat("process_chaos_story.md")).toMatch(
      /not a failure of the teller or a stage to be moved through/,
    );
    expect(flat("playwright_instructions.md")).toMatch(
      /Do give a persona chaos and let it be unbearable/,
    );
  });
});

describe("illness: the boundary with the body and the mark", () => {
  it("delegates the physical state and the discrediting attribute explicitly", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/What the body is doing \(body\)/);
    expect(refs).toMatch(/The discrediting mark \(stigma\)/);
  });
  it("names no symptom and no mark among its members", () => {
    const foreign = ["pain", "fatigue", "symptom", "stigma", "disgust"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("illness: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every stage: root first, then the movement, then the stage", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Illness");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a stage a three-link chain: root, movement, stage", () => {
    expect(chains["process_chaos_story.md"]).toEqual([
      ROOT,
      "process_telling.md",
      "process_chaos_story.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_diagnosis.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
