// The hospitality engine tests only what is hospitality-specific: that the
// package conforms to the canon through the shared conformance kit
// (@chbrain/khai-tests), its manifest contract, the four-movement shape, and its
// compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_hospitality.md";
const MOVEMENTS = [
  "process_taking_in.md",
  "process_terms_hospitality.md",
  "process_clock_hospitality.md",
  "process_breach_hospitality.md",
];

describe("hospitality: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("hospitality: manifest", () => {
  it("declares the hospitality process tree with a single root", () => {
    expect(manifest.engine).toBe("hospitality");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- an arrangement being performed, not a state", () => {
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

describe("hospitality: the four movements", () => {
  // The tree is exactly two deep: root -> movement -> form. The taking in comes
  // first and the rest follow from it, but only the clock is ordered internally.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the clock's three forms in the order the term runs", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_clock_hospitality.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_welcome.md",
      "process_the_overstay.md",
      "process_the_leaving.md",
    ]);
  });
  it("keeps both breaches and the refusal in one movement", () => {
    // Harming a guest, acting as host, and turning somebody away are held
    // together because all three are enforced by the same horror, which is the
    // movement's whole explanation of the arrangement's durability.
    const three = manifest.members
      .filter((m) => m.parent === "process_breach_hospitality.md")
      .map((m) => m.file);
    expect(three.sort()).toEqual([
      "process_guest_usurpation.md",
      "process_host_betrayal.md",
      "process_the_turning_away.md",
    ]);
  });
});

describe("hospitality: the twist lives at the root", () => {
  // Sovereignty exercised through giving is a property of the arrangement rather
  // than of any one movement, so it belongs to the anchor. The clock carries it.
  it("the root's Echo names the demonstration of ownership", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/honours the guest by demonstrating whose house it is/i);
    expect(echo).toMatch(/To give is to have/);
  });
  it("the clock movement carries the same keystone", () => {
    expect(flat("process_clock_hospitality.md")).toMatch(
      /honours the guest by demonstrating whose house it is/i,
    );
  });
  it("the precedence compresses the twist into a seating arrangement", () => {
    expect(flat("process_the_precedence.md")).toMatch(
      /only somebody with authority can raise another/i,
    );
  });
});

describe("hospitality: the clock cannot be spoken", () => {
  // The welcome is sincere and bounded and those two facts are not visible
  // together; the host has no legitimate way to end it. A play that lets the
  // host ask has staged a breach instead.
  it("keeps the welcome sincere and uncalibratable", () => {
    const w = flat("process_the_welcome.md");
    expect(w).toMatch(/the host is not lying/i);
    expect(w).toMatch(/exactly as warm on the last good day as on the first/i);
  });
  it("refuses the host asking the guest to leave", () => {
    expect(flat("process_clock_hospitality.md")).toMatch(
      /has staged a breach rather than a clock/i,
    );
    expect(flat("playwright_instructions.md")).toMatch(
      /Do not let the host ask the guest to leave/,
    );
  });
});

describe("hospitality: nobody has to be behaving badly", () => {
  it("keeps the host generous and the guest grateful", () => {
    expect(flat(ROOT)).toMatch(/genuinely generous and is not a trick/i);
    expect(flat("REFERENCES.md")).toMatch(
      /at its most interesting when both are conducting themselves correctly/i,
    );
  });
  it("keeps most usurpations innocent", () => {
    expect(flat("process_guest_usurpation.md")).toMatch(
      /Most usurpations are accidents of helpfulness/i,
    );
  });
});

describe("hospitality: what the engine refuses to over-claim", () => {
  // Ethnography and argument rather than measurement, with Pitt-Rivers
  // generalised beyond his base and the forms varying enormously.
  it("names Pitt-Rivers as a structural argument rather than a survey", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/structural argument/i);
    expect(refs).toMatch(/generalised considerably further than that base supports/i);
  });
  it("refuses to give the term a length", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/three-day rule/i);
    expect(refs).toMatch(/folklore rather than findings/i);
  });
  it("marks the breach universality as a convergence rather than a measurement", () => {
    expect(flat("REFERENCES.md")).toMatch(/convergence rather than a measurement/i);
  });
});

describe("hospitality: the boundary with the gift and the neutral ground", () => {
  it("delegates the gift and names third-place as the negative space", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The transfer that binds by naming no price \(gift\)/);
    expect(refs).toMatch(/Ground with no host and no guest \(third-place\)/);
    expect(refs).toMatch(/commercial trade that shares the word/i);
  });
  it("names no gift form and no venue among its members", () => {
    const foreign = ["gift", "debt", "third_place", "hearth", "tavern"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("hospitality: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Hospitality");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_overstay.md"]).toEqual([
      ROOT,
      "process_clock_hospitality.md",
      "process_the_overstay.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_guest.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
