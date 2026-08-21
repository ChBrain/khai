// The credibility engine tests only what is credibility-specific: that the
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

const ROOT = "process_credibility.md";
const MOVEMENTS = [
  "process_report_credibility.md",
  "process_discount_credibility.md",
  "process_missing_word_credibility.md",
  "process_aftermath_credibility.md",
];

describe("credibility: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("credibility: manifest", () => {
  it("declares the credibility process tree with a single root", () => {
    expect(manifest.engine).toBe("credibility");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- an account being priced, not a state", () => {
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

describe("credibility: the four movements", () => {
  // Not a schedule: the missing word can precede any hearing at all, and the
  // aftermath compounds across occasions rather than following one.
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
  it("keeps the aftermath's three forms in the order the damage lands", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_aftermath_credibility.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_self_doubt.md",
      "process_the_belated.md",
      "process_the_owing_back.md",
    ]);
  });
});

describe("credibility: the twist lives at the root", () => {
  // The damage landing on the knower rather than the claim is a property of the
  // whole arrangement, so it belongs to the anchor. The aftermath carries it.
  it("the root's Echo names the degraded source", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /Being disbelieved does not leave a persona holding an unheard truth\. It leaves them holding less of one/i,
    );
    expect(echo).toMatch(/it degrades it at the source/i);
  });
  it("the aftermath movement carries the same keystone", () => {
    expect(flat("process_aftermath_credibility.md")).toMatch(
      /being disbelieved does not leave a persona holding an unheard truth, it leaves them holding less of one/i,
    );
  });
  it("refuses the picture of an intact knower waiting for a better listener", () => {
    expect(flat("process_aftermath_credibility.md")).toMatch(
      /waiting intact for a better listener\. That is not what repeated discounting produces/i,
    );
  });
});

describe("credibility: the report cannot be strengthened", () => {
  it("makes first-person access real and untransmittable", () => {
    const f = flat("process_the_first_person.md");
    expect(f).toMatch(/The First Person knows and cannot show, and the knowing does not help/i);
    expect(f).toMatch(/reads to a doubter as intensity rather than as evidence/i);
  });
  it("turns a sound standard into a filter on the class", () => {
    expect(flat("process_the_corroboration.md")).toMatch(
      /converts the standard into a filter on the class/i,
    );
  });
  it("makes every register readable against the speaker", () => {
    expect(flat("process_the_manner.md")).toMatch(
      /The Manner supplies whatever the hearer brought with them/i,
    );
  });
});

describe("credibility: nobody has to be behaving badly", () => {
  it("keeps the hearer sincere and unable to inspect the discount", () => {
    const s = flat("process_the_sincere_hearer.md");
    expect(s).toMatch(
      /The Sincere Hearer is the ordinary case and is not improved by being sincere/i,
    );
    expect(s).toMatch(/every item in it will be true/i);
    expect(flat("playwright_instructions.md")).toMatch(/Do not stage a dismissive hearer/);
  });
  it("keeps the deficit undetectable case by case", () => {
    expect(flat("process_the_deficit.md")).toMatch(
      /undetectable case by case and unmistakable in aggregate/i,
    );
  });
  it("refuses the dismissive hearer and the vindicated persona", () => {
    expect(flat("process_aftermath_credibility.md")).toMatch(
      /stages the hearers as dismissive has replaced the mechanism with a villain/i,
    );
  });
});

describe("credibility: the missing word precedes the hearer", () => {
  // Fricker's harder half: the gap is in the collective resources, so nobody has
  // discounted anything and the persona still cannot be heard.
  it("locates the shortfall in the collective rather than in a listener", () => {
    const m = flat("process_missing_word_credibility.md");
    expect(m).toMatch(/The hearer is not discounting\. There is nothing yet to discount/i);
    expect(m).toMatch(/a shortfall in the collective, borne by an individual/i);
  });
  it("makes the private fault a correct inference from a defective list", () => {
    const p = flat("process_the_private_fault.md");
    expect(p).toMatch(/the correct inference from a defective set of options/i);
    expect(p).toMatch(/The Private Fault is the best available explanation and it is not true/i);
  });
  it("keeps the coining from repairing the past", () => {
    expect(flat("process_the_coining.md")).toMatch(
      /The Coining fixes the future case and closes none of the old ones/i,
    );
  });
});

describe("credibility: what the engine refuses to over-claim", () => {
  // A philosophical frame joined to a measured literature, with the join named
  // and the least-tested part identified as the twist itself.
  it("marks Fricker as philosophy rather than measurement", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Fricker's _Epistemic Injustice_ is philosophy, not measurement/i);
    expect(refs).toMatch(/nobody has operationalised/i);
  });
  it("names its own twist as the least directly tested part", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/is the twist and is the least directly tested part of it/i);
    expect(refs).toMatch(/which is a hard study to design/i);
  });
  it("bounds the measured deficits to the domains they were measured in", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /takes the direction as well-established and does not import any particular effect size/i,
    );
  });
  it("declines to make the coining a general law", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /does not claim that every unnamed wrong is waiting for a word/i,
    );
  });
  it("refuses the reading that doubting is itself a wrong", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /that doubting an account is a wrong, that hearers are usually prejudiced, or that a persona's report is correct because it was discounted/i,
    );
  });
});

describe("credibility: the boundary with trust, belief, and the fair hearing", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The bet on another's reliability \(trust\)/);
    expect(refs).toMatch(/Holding a proposition true \(belief\)/);
    expect(refs).toMatch(/What a fair procedure buys \(heeding, recognition\)/);
    expect(refs).toMatch(/The account demanded rather than offered \(confession\)/);
  });
  it("separates itself from a scrupulously fair procedure", () => {
    expect(flat("REFERENCES.md")).toMatch(/which a scrupulously fair procedure does not correct/i);
  });
  it("names no trust, belief, or stigma form among its members", () => {
    const foreign = ["trust", "belief", "stigma", "rumor", "procedure"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("credibility: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Credibility");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_unnamed.md"]).toEqual([
      ROOT,
      "process_missing_word_credibility.md",
      "process_the_unnamed.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_witness_box.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
