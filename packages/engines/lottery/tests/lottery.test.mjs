// The lottery engine tests only what is lottery-specific: that the package
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

const ROOT = "process_lottery.md";
const MOVEMENTS = [
  "process_impasse_lottery.md",
  "process_drawing_lottery.md",
  "process_verdict_lottery.md",
  "process_filling_lottery.md",
];

describe("lottery: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("lottery: manifest", () => {
  it("declares the lottery process tree with a single root", () => {
    expect(manifest.engine).toBe("lottery");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- an allocation being run, not a state", () => {
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

describe("lottery: the four movements", () => {
  // The four run in order for one allocation and loop across many, since the
  // filling supplies what the next draw is entered on.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("keeps the four movements in the order an allocation runs", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads).toEqual(MOVEMENTS);
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the verdict's three forms in the order they are handed out", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_verdict_lottery.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_winner_unearned.md",
      "process_the_loser_unanswered.md",
      "process_the_no_appeal.md",
    ]);
  });
});

describe("lottery: the twist lives at the root", () => {
  // The vacancy filling is a property of the whole arrangement rather than of any
  // one movement, so it belongs to the anchor. The filling carries it downward.
  it("the root's Echo names the invented reasons", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /A lottery works by admitting no reasons, which is why everybody it touches invents one/i,
    );
    expect(echo).toMatch(/manufactured by the one instrument designed to make them impossible/i);
  });
  it("the filling movement carries the same keystone", () => {
    expect(flat("process_filling_lottery.md")).toMatch(
      /a lottery works by admitting no reasons, which is why everybody it touches invents one/i,
    );
  });
  it("reads the engine on what was excluded rather than on what was produced", () => {
    expect(flat(ROOT)).toMatch(/read on what it excluded, never on what it produced/i);
  });
});

describe("lottery: the emptiness is the product", () => {
  // Stone's sanitising effect: the virtue is the exclusion, and it cannot be
  // applied selectively, so the merit goes out with the corruption.
  it("makes the no-reasons rule a virtue that cannot be selective", () => {
    const n = flat("process_the_no_reasons.md");
    expect(n).toMatch(/The No Reasons is a virtue that cannot be applied selectively/i);
    expect(n).toMatch(
      /no reliable way to keep the wrong ones out|the only reliable way to keep the wrong ones out/i,
    );
  });
  it("keeps the merit and the corruption indistinguishable to the device", () => {
    expect(flat("process_drawing_lottery.md")).toMatch(
      /keeps out the corruption and the merit together, because it cannot tell them apart/i,
    );
  });
  it("makes the single run binding and uninformative", () => {
    expect(flat("process_the_single_run.md")).toMatch(
      /The Single Run is binding and tells nobody anything/i,
    );
  });
});

describe("lottery: the impasse is arrived at by trying hardest", () => {
  it("makes the claims incommensurable rather than equal", () => {
    const t = flat("process_the_tied_claims.md");
    expect(t).toMatch(/They are incommensurable/i);
    expect(t).toMatch(/more information about the claimants makes the ranking harder/i);
  });
  it("credits the search for a rule with producing the decision to use none", () => {
    expect(flat("process_impasse_lottery.md")).toMatch(
      /The Impasse is arrived at by trying hardest/i,
    );
  });
  it("names the decider's relief as part of why the method is adopted", () => {
    expect(flat("process_the_exposed_decider.md")).toMatch(
      /relieved by the instrument that leaves the claimant with nobody to ask/i,
    );
  });
});

describe("lottery: equal treatment lands unequally", () => {
  it("states the asymmetry in the verdict movement", () => {
    const v = flat("process_verdict_lottery.md");
    expect(v).toMatch(
      /a good with no story is easy to keep and a refusal with no story is very hard to hold/i,
    );
    expect(v).toMatch(/The Verdict treats everybody equally and lands on them unequally/i);
  });
  it("keeps the mercy real and only legible from outside", () => {
    expect(flat("process_the_loser_unanswered.md")).toMatch(
      /mercy of this kind is only legible from outside/i,
    );
  });
  it("makes the missing appeal a missing hearing", () => {
    expect(flat("process_the_no_appeal.md")).toMatch(
      /The No Appeal protects the process and removes the hearing/i,
    );
  });
});

describe("lottery: nobody has to be cheating", () => {
  it("refuses the rigged draw and the gloating winner", () => {
    expect(flat("process_filling_lottery.md")).toMatch(
      /stages the lottery as rigged has replaced the mechanism with a fraud/i,
    );
    expect(flat("REFERENCES.md")).toMatch(
      /The impasse was real\. The draw was honest\. Nobody was wronged/,
    );
    expect(flat("playwright_instructions.md")).toMatch(
      /Do keep the draw honest and the process clean/,
    );
  });
  it("keeps the invented reasons blameless", () => {
    expect(flat("process_filling_lottery.md")).toMatch(
      /supplying one is not a weakness and cannot be trained out/i,
    );
  });
});

describe("lottery: what the engine refuses to over-claim", () => {
  // A political-philosophy engine with a thin apron, and it names the gap it
  // cannot close rather than papering over it.
  it("marks Stone's sanitising effect as an argument rather than a finding", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Stone's sanitising effect is an argument, not a finding/i);
    expect(refs).toMatch(/no measurement bears on it/i);
  });
  it("names the verdict asymmetry as an inference and says what would settle it", () => {
    expect(flat("REFERENCES.md")).toMatch(/which would be the study that settles it/i);
  });
  it("admits the domain-variation gap instead of papering over it", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /Acceptability varies enormously by domain and the engine does not explain the variation/i,
    );
    expect(refs).toMatch(/which is a real gap/i);
  });
  it("marks the next-draw selection claim as speculative", () => {
    expect(flat("REFERENCES.md")).toMatch(/The next-draw member's selection claim is speculative/i);
  });
  it("refuses the reading that lotteries are bad or their acceptors naive", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /lotteries are bad allocations, that people who accept them are naive/i,
    );
  });
});

describe("lottery: the boundary with bidding, desert, and the sign", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /The contest that awards to the highest estimate \(bidding, negotiation\)/,
    );
    expect(refs).toMatch(
      /The reading of an outcome as deserved \(belief-in-a-just-world, attribution\)/,
    );
    expect(refs).toMatch(/A sign found in an unrelated event \(superstition, meaning\)/);
    expect(refs).toMatch(/Gambling \(addiction, reward, desire\)/);
  });
  it("hands both borrowed mechanisms back from inside the filling movement", () => {
    const f = flat("process_filling_lottery.md");
    expect(f).toMatch(/The reading of an outcome as deserved is belief-in-a-just-world's/i);
    expect(f).toMatch(/both mechanisms are theirs and both arrive here uninvited/i);
  });
  it("names no bidding, gambling, or desert form among its members", () => {
    const foreign = ["bid", "wager", "gamble", "deserving", "justice"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("lottery: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Lottery");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_no_reasons.md"]).toEqual([
      ROOT,
      "process_drawing_lottery.md",
      "process_the_no_reasons.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_ballot.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
