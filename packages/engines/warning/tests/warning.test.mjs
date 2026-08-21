// The warning engine tests only what is warning-specific: that the package
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

const ROOT = "process_warning.md";
const MOVEMENTS = [
  "process_issuing_warning.md",
  "process_receiving_warning.md",
  "process_repetition_warning.md",
  "process_aftermath_warning.md",
];

describe("warning: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("warning: manifest", () => {
  it("declares the warning process tree with a single root", () => {
    expect(manifest.engine).toBe("warning");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- a signal being handled, not a state", () => {
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

describe("warning: the four movements", () => {
  // The four run in order for one signal and loop across many, since the
  // aftermath sets the volume the next warning is heard at.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("keeps the four movements in the order a signal runs", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads).toEqual(MOVEMENTS);
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the aftermath's three forms in the order the accounting runs", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_aftermath_warning.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_averted.md",
      "process_the_blame.md",
      "process_the_next_warning.md",
    ]);
  });
});

describe("warning: the twist lives at the root", () => {
  // Success being unrecordable is a property of the whole arrangement rather than
  // of any one movement, so it belongs to the anchor. The aftermath carries it.
  it("the root's Echo names the indistinguishable outcomes", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/A warning that works looks exactly like one that was wrong/i);
    expect(echo).toMatch(
      /the only warnings that clearly earn their credibility are the ones nobody acted on/i,
    );
  });
  it("the aftermath movement carries the same keystone", () => {
    expect(flat("process_aftermath_warning.md")).toMatch(
      /a warning that works looks exactly like one that was wrong/i,
    );
  });
  it("makes the averted the best outcome and the weakest exhibit", () => {
    expect(flat("process_the_averted.md")).toMatch(
      /The Averted is the engine's best outcome and its weakest exhibit/i,
    );
  });
});

describe("warning: the threshold buys sensitivity with noise", () => {
  // The engine's structural constraint: the care that makes a system safe is
  // what makes it cry wolf, and no adjustment separates the two.
  it("keeps the trade a property of deciding rather than a defect", () => {
    const t = flat("process_the_threshold_set.md");
    expect(t).toMatch(/a property of deciding under uncertainty rather than a defect/i);
    expect(t).toMatch(/the very care that makes the system safe is what makes it cry wolf/i);
  });
  it("makes over-warning structural rather than nervous", () => {
    expect(flat("process_the_liability.md")).toMatch(
      /over-warning is structural rather than a failure of nerve/i,
    );
  });
});

describe("warning: the receiving is not panic", () => {
  // The best-evidenced claim in the domain runs against the popular picture:
  // warned populations mill and under-respond, they do not stampede.
  it("states the no-panic finding in the movement and in the references", () => {
    expect(flat("process_receiving_warning.md")).toMatch(
      /Panic is rare enough that the warning literature treats it as a myth/i,
    );
    expect(flat("REFERENCES.md")).toMatch(
      /a play that stages a warned crowd as hysterical is contradicting the best-evidenced claim in the domain/i,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do not stage a warned crowd as panicking/);
  });
  it("puts the outcome in the personalising rather than in belief", () => {
    const p = flat("process_the_personalising.md");
    expect(p).toMatch(/predicts protective action better than belief in the warning/i);
    expect(p).toMatch(/The Personalising decides the outcome and is made in a second/i);
  });
  it("keeps the normalcy read correct almost always and worthless where it counts", () => {
    expect(flat("process_the_normalcy_read.md")).toMatch(
      /correct on almost every occasion and fails on all the ones that matter/i,
    );
  });
});

describe("warning: nobody has to be foolish", () => {
  it("makes the discounting correct rather than negligent", () => {
    expect(flat("process_the_recalibration.md")).toMatch(
      /The Recalibration is good reasoning arriving at a lethal answer/i,
    );
    expect(flat("process_repetition_warning.md")).toMatch(
      /which is learning rather than negligence/i,
    );
  });
  it("keeps the muting competent and locally right", () => {
    expect(flat("process_the_muting.md")).toMatch(
      /The Muting is defensible one at a time and indefensible in a list/i,
    );
  });
  it("refuses the vindicated prophet and the foolish doubters", () => {
    expect(flat("process_aftermath_warning.md")).toMatch(
      /stages the warner as vindicated has replaced the mechanism with a prophecy/i,
    );
    expect(flat("playwright_instructions.md")).toMatch(
      /Do not stage the warner as vindicated or the doubters as fools/,
    );
  });
});

describe("warning: what the engine refuses to over-claim", () => {
  // The field research is the strong leg, Breznitz's own experiments are the weak
  // one, and the twist is unmeasurable for exactly the reason it states.
  it("names the field research as the strongest leg", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The warning-response field research is the strongest thing on this page/i,
    );
  });
  it("names Breznitz's experiments as the weak leg while keeping his framing", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Breznitz's own experimental work is the weak leg/i);
    expect(refs).toMatch(/while taking his framing, which no later work has bettered/i);
  });
  it("states that its own twist cannot be measured, and why", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/it cannot be measured for exactly the reason it states/i);
    expect(refs).toMatch(/from the outside the two are the same event/i);
  });
  it("gives the alarm-fatigue pattern without inventing a number", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /vary enough between studies that the engine states the pattern and not a number/i,
    );
  });
  it("marks Rose's prevention paradox as an analogy rather than support", () => {
    expect(flat("REFERENCES.md")).toMatch(/used here only by analogy, not as support/i);
  });
});

describe("warning: the boundary with the hazard and the fright", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The hazard itself \(risk\)/);
    expect(refs).toMatch(/The response to a threat in the room \(fear, apprehension\)/);
    expect(refs).toMatch(/The design of the instrument \(usability, ergonomics, attention\)/);
    expect(refs).toMatch(/The crowd as an environment \(crowd, contagion, tipping-point\)/);
  });
  it("separates milling from contagion inside the restriction", () => {
    expect(flat("REFERENCES.md")).toMatch(/which is the opposite mechanism from contagion/i);
  });
  it("names no hazard, fear, or interface form among its members", () => {
    const foreign = ["hazard", "fear", "panic", "alarm_design", "trust"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("warning: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Warning");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_recalibration.md"]).toEqual([
      ROOT,
      "process_repetition_warning.md",
      "process_the_recalibration.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_siren.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
