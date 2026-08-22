// The complaint engine tests only what is complaint-specific: that the package
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

const ROOT = "process_complaint.md";
const MOVEMENTS = [
  "process_filing_complaint.md",
  "process_procedure_complaint.md",
  "process_cost_complaint.md",
  "process_outcome_complaint.md",
];

describe("complaint: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("complaint: manifest", () => {
  it("declares the complaint process tree with a single root", () => {
    expect(manifest.engine).toBe("complaint");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- a case being run, not a state", () => {
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

describe("complaint: the four movements", () => {
  // The four run in order for one case and loop across many, since the outcome
  // is what the next potential complainer is reasoning from.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("keeps the four movements in the order a case runs", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads).toEqual(MOVEMENTS);
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the procedure's three safeguards in the order they bind", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_procedure_complaint.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_confidence_seal.md",
      "process_the_slow_care.md",
      "process_the_single_case.md",
    ]);
  });
});

describe("complaint: the twist lives at the root", () => {
  // The redistribution is a property of the whole arrangement rather than of
  // any one safeguard. The outcome carries it downward.
  it("the root's Echo names what the process reliably moves", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /A complaint changes the complainer more reliably than it changes anything they complained about/i,
    );
    expect(echo).toMatch(
      /Every one of those protects somebody, and their sum leaves the complainer/i,
    );
  });
  it("the outcome movement carries the same keystone", () => {
    expect(flat("process_outcome_complaint.md")).toMatch(
      /a complaint changes the complainer more reliably than it changes anything they complained about/i,
    );
  });
  it("reads the engine on the cost rather than on the finding", () => {
    expect(flat(ROOT)).toMatch(
      /Complaint is read on what the process cost, never on what it concluded/i,
    );
  });
});

describe("complaint: the filing narrows the grievance", () => {
  it("states the conversion at the movement head", () => {
    expect(flat("process_filing_complaint.md")).toMatch(
      /The Filing converts what happened into what can be alleged/i,
    );
  });
  it("keeps the informal advice good and its effect a filter", () => {
    expect(flat("process_the_informal_word.md")).toMatch(
      /The Informal Word is good advice that functions as a filter/i,
    );
  });
  it("asks for incidents from somebody complaining about a climate", () => {
    expect(flat("process_the_form.md")).toMatch(
      /The Form asks for incidents from somebody complaining about a climate/i,
    );
  });
  it("turns a structural claim into a quarrel between two people", () => {
    expect(flat("process_the_named_respondent.md")).toMatch(
      /The Named Respondent turns a claim about a place into a quarrel between two people/i,
    );
  });
});

describe("complaint: every safeguard is real and protects somebody", () => {
  // The engine's whole method: no step is a pretence, and the mechanism is
  // their sum rather than any one of them.
  it("makes the procedure fair in each part and unequal in practice", () => {
    const p = flat("process_procedure_complaint.md");
    expect(p).toMatch(
      /The Procedure is fair in each of its parts and unequal in its distribution of practice/i,
    );
    expect(p).toMatch(
      /the institution has run this hundreds of times and the complainer is running it once/i,
    );
  });
  it("protects everybody and connects nobody", () => {
    expect(flat("process_the_confidence_seal.md")).toMatch(
      /The Confidence Seal protects everybody and connects nobody/i,
    );
  });
  it("keeps the delay proper and the timescale unlivable", () => {
    expect(flat("process_the_slow_care.md")).toMatch(
      /The Slow Care is the right speed for the process and the wrong speed for a life/i,
    );
  });
  it("excludes the pattern by being fair to the accused", () => {
    const s = flat("process_the_single_case.md");
    expect(s).toMatch(
      /The Single Case is the fairest available treatment of the least useful unit/i,
    );
    expect(s).toMatch(/the persona would want exactly this rule if they were the one accused/i);
  });
});

describe("complaint: the cost falls on one side", () => {
  it("records the asymmetry nowhere in the file", () => {
    expect(flat("process_cost_complaint.md")).toMatch(
      /The Cost is carried entirely on one side and recorded on neither/i,
    );
  });
  it("makes the channel a resource question", () => {
    expect(flat("process_the_second_job.md")).toMatch(
      /The Second Job makes the complaint a resource question/i,
    );
  });
  it("builds the isolation out of consideration", () => {
    expect(flat("process_the_changed_room.md")).toMatch(
      /The Changed Room is made of consideration and feels like exile/i,
    );
  });
  it("keeps the label accurate and its effect a warning", () => {
    expect(flat("process_the_known_complainer.md")).toMatch(
      /The Known Complainer is described accurately and read as a warning/i,
    );
  });
});

describe("complaint: the ending redistributes almost nothing", () => {
  it("makes the honest finding function as a rejection", () => {
    expect(flat("process_the_partial_upheld.md")).toMatch(
      /The Partial Upheld is the honest finding and functions as a rejection/i,
    );
  });
  it("keeps the settlement good for the person and costly for the next one", () => {
    expect(flat("process_the_settlement.md")).toMatch(
      /a good outcome for the complainer and the reason the next one has no history to consult/i,
    );
  });
  it("has the deterrent produced by fairness rather than by anybody deterring", () => {
    const n = flat("process_the_next_complainer.md");
    expect(n).toMatch(
      /The Next Complainer declines on the evidence, and the evidence was produced by fairness/i,
    );
    expect(n).toMatch(/They are not intimidated and nobody has threatened them/i);
  });
});

describe("complaint: nobody has to be covering anything up", () => {
  it("refuses the conspiracy and the courtroom vindication", () => {
    expect(flat("process_outcome_complaint.md")).toMatch(
      /stages the institution as covering it up has replaced the mechanism with a conspiracy/i,
    );
    expect(flat("REFERENCES.md")).toMatch(
      /The investigator was conscientious\. The safeguards were real\. The finding was defensible/,
    );
    expect(flat("playwright_instructions.md")).toMatch(
      /Do keep the investigator conscientious and the safeguards real/,
    );
  });
});

describe("complaint: what the engine refuses to over-claim", () => {
  // The evidence base has the same defect the engine describes, and the note
  // leads with that rather than burying it.
  it("names its own selection problem first", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Ahmed's material is selected on the outcome/i);
    expect(refs).toMatch(/it is not a sample of complaints/i);
  });
  it("says most complaints work and that this engine is silent on them", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The engine says nothing about complaints that work, and most complaints work/i,
    );
  });
  it("keeps the endogeneity claim narrower than the engine's", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /The endogeneity literature supports a narrower claim than the engine makes/i,
    );
    expect(refs).toMatch(/the second does not follow from the first/i);
  });
  it("marks the deterrence loop as an inference that cannot be measured", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The next-complainer loop is an inference/i);
    expect(refs).toMatch(/leave no record by definition/i);
  });
  it("refuses the reading that procedures are a sham or their staff cynics", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /grievance procedures are a sham, that the people who run them are cynics/i,
    );
  });
});

describe("complaint: the boundary with warning, raising, and loyalty", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The harm not yet arrived \(warning, credibility, raising\)/);
    expect(refs).toMatch(/Going instead of speaking \(loyalty, membership, role-exit\)/);
    expect(refs).toMatch(
      /The wrong and its repair \(repair, forgiveness, moral-account, apology\)/,
    );
    expect(refs).toMatch(/The mark afterwards \(stigma, gossip, reputation\)/);
  });
  it("credits Galanter to the law engine while using him", () => {
    expect(flat("REFERENCES.md")).toMatch(/Used here, owned by the law engine/);
  });
  it("names no warning, exit, or repair form among its members", () => {
    const foreign = ["warning", "exit", "repair", "apolog", "stigma"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("complaint: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Complaint");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_single_case.md"]).toEqual([
      ROOT,
      "process_procedure_complaint.md",
      "process_the_single_case.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_tribunal.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
