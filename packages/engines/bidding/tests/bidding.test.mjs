// The bidding engine tests only what is bidding-specific: that the package
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

const ROOT = "process_bidding.md";
const MOVEMENTS = [
  "process_contest_bidding.md",
  "process_estimating_bidding.md",
  "process_winning_bidding.md",
  "process_reckoning_bidding.md",
];

describe("bidding: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("bidding: manifest", () => {
  it("declares the bidding process tree with a single root", () => {
    expect(manifest.engine).toBe("bidding");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- a contest being run, not a state", () => {
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

describe("bidding: the four movements", () => {
  // The four run in order for one contest and loop across many, since the
  // reckoning arrives disguised and the next contest starts most of the way back.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("keeps the four movements in the order a contest runs", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads).toEqual(MOVEMENTS);
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the reckoning's three forms in the order the loss is met", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_reckoning_bidding.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_overpay.md",
      "process_the_defence.md",
      "process_the_next_contest.md",
    ]);
  });
});

describe("bidding: the twist lives at the root", () => {
  // Selection on the tail is a property of the whole arrangement rather than of
  // any one movement, so it belongs to the anchor. The reckoning carries it.
  it("the root's Echo names winning as the evidence", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/Winning is the evidence that you were wrong/i);
    expect(echo).toMatch(/the moment of finding out is a celebration/i);
  });
  it("the reckoning movement carries the same keystone", () => {
    expect(flat("process_reckoning_bidding.md")).toMatch(
      /winning is the evidence that you were wrong/i,
    );
  });
  it("reads the engine on the spread rather than on the winning bid", () => {
    expect(flat(ROOT)).toMatch(
      /read on the spread of the estimates, never on the size of the winning one/i,
    );
  });
});

describe("bidding: the field is read backwards", () => {
  // The single most counter-intuitive term: more rivals is treated as a reason to
  // bid higher and is arithmetically a reason to bid lower.
  it("states the inversion in the field member", () => {
    const f = flat("process_the_field.md");
    expect(f).toMatch(/The Field is read as a reason to bid more and is a reason to bid less/i);
    expect(f).toMatch(/the more competition there is, the more the winner will have overpaid/i);
  });
  it("keeps the scatter invisible to everybody bidding", () => {
    const s = flat("process_the_scatter.md");
    expect(s).toMatch(/The Scatter is the answer and is held by the seller/i);
  });
  it("makes the unshared a fix the arrangement forbids", () => {
    expect(flat("process_the_unshared.md")).toMatch(
      /The Unshared is what everybody keeps and nobody benefits from/i,
    );
  });
});

describe("bidding: nobody has to be reckless", () => {
  it("keeps the estimating well done and the rule fair", () => {
    expect(flat("process_estimating_bidding.md")).toMatch(
      /The Estimating is done well by everybody and the spread is the only thing that matters/i,
    );
    expect(flat("process_the_top_estimate.md")).toMatch(
      /The Top Estimate cannot tell keenness from error and does not need to/i,
    );
  });
  it("makes the triumph the first news of the curse", () => {
    expect(flat("process_the_triumph.md")).toMatch(
      /The Triumph is the first news of the curse, received as its opposite/i,
    );
  });
  it("refuses the reckless winner and the sharp seller", () => {
    expect(flat("process_reckoning_bidding.md")).toMatch(
      /stages the winner as reckless has replaced the mechanism with a character/i,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do keep the winner competent/);
  });
});

describe("bidding: what the engine refuses to over-claim", () => {
  // Unusually strong ground -- and a scope condition that is load-bearing, since
  // under private values the mechanism is doing exactly the right thing.
  it("says plainly that the ground here is strong", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /one of the better-established results in experimental economics/i,
    );
  });
  it("states the common-value scope condition as load-bearing", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/narrower than the twist sounds, and the limit is load-bearing/i);
    expect(refs).toMatch(/there is no curse/i);
    expect(refs).toMatch(/applying in proportion rather than universally/i);
  });
  it("keeps the correction real and local rather than claiming nobody learns", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /written to that finding rather than to the stronger claim that nobody ever learns/i,
    );
  });
  it("marks the field evidence and the extensions as weaker", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The field evidence is weaker than the laboratory evidence/i);
    expect(refs).toMatch(/argument rather than evidence/i);
  });
  it("refuses the reading that competition is bad or winners are fools", () => {
    expect(flat("REFERENCES.md")).toMatch(/competitive processes are bad, that winners are fools/i);
  });
});

describe("bidding: the boundary with negotiation and escalation", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The exchange of concessions toward terms \(negotiation\)/);
    expect(refs).toMatch(/Commitment growing on what has been spent \(escalation\)/);
    expect(refs).toMatch(/Overconfidence in one's own estimate \(bias, metacognition\)/);
  });
  it("states that the curse needs no overconfidence, which is why it is here", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /it runs on well-made estimates that happen to scatter, which is why it is in this engine and not there/i,
    );
  });
  it("hands the escalation mechanism back from inside the pushing member", () => {
    expect(flat("process_the_pushing.md")).toMatch(
      /hands the mechanism of the commitment itself to the escalation engine, which owns it/i,
    );
  });
  it("names no negotiation, sunk-cost, or price form among its members", () => {
    const foreign = ["negotiation", "concession", "sunk", "anchor", "worth"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("bidding: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Bidding");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_scatter.md"]).toEqual([
      ROOT,
      "process_estimating_bidding.md",
      "process_the_scatter.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_reserve_price.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
