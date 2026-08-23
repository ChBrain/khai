// The vouching engine tests only what is vouching-specific: that the package
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

const ROOT = "process_vouching.md";
const MOVEMENTS = [
  "process_request_vouching.md",
  "process_writing_vouching.md",
  "process_stake_vouching.md",
  "process_reading_vouching.md",
];

describe("vouching: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("vouching: manifest", () => {
  it("declares the vouching process tree with a single root", () => {
    expect(manifest.engine).toBe("vouching");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- a vouch being run, not a state", () => {
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

describe("vouching: the four movements", () => {
  // The four run once per application and set who can be asked the next time.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("keeps the four movements in the order a vouch runs", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads).toEqual(MOVEMENTS);
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the reading's three moves in the order a reader makes them", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_reading_vouching.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_discounted_text.md",
      "process_the_weighed_source.md",
      "process_the_absent_letter.md",
    ]);
  });
});

describe("vouching: the twist lives at the root", () => {
  // The compression is a property of the whole channel rather than of any one
  // letter. The reading carries it downward.
  it("the root's Echo names the agreement as the only signal", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /Nothing in a reference is informative except the fact that somebody agreed to give one/i,
    );
    expect(echo).toMatch(/mostly reporting the shape of their acquaintance/i);
  });
  it("the reading movement carries the same keystone", () => {
    expect(flat("process_reading_vouching.md")).toMatch(
      /nothing in a reference is informative except the fact that somebody agreed to give one/i,
    );
  });
  it("reads the engine on who agreed rather than on what was said", () => {
    expect(flat(ROOT)).toMatch(/Vouching is read on who agreed to give it, never on what it said/i);
  });
});

describe("vouching: the list was fixed years before the form", () => {
  it("makes the pool a network property rather than a personal one", () => {
    expect(flat("process_the_short_list.md")).toMatch(
      /The Short List is a network property presented as a personal one/i,
    );
  });
  it("converts a reservation into a letter rather than a refusal", () => {
    const u = flat("process_the_unrefusable_ask.md");
    expect(u).toMatch(/The Unrefusable Ask converts a reservation into a letter/i);
    expect(u).toMatch(/both are the word yes/i);
  });
  it("reads an innocent absence as a substitution", () => {
    expect(flat("process_the_second_choice.md")).toMatch(
      /The Second Choice is read as a substitution whatever it was/i,
    );
  });
});

describe("vouching: the floor is protective and disabling at once", () => {
  it("states the compression at the movement head", () => {
    expect(flat("process_writing_vouching.md")).toMatch(
      /The Writing produces warmth that cannot be graded/i,
    );
  });
  it("keeps the floor a genuine protection", () => {
    const p = flat("process_the_positive_floor.md");
    expect(p).toMatch(/The Positive Floor protects the candidate by disabling the instrument/i);
    expect(p).toMatch(/careers survive difficult managers because of it/i);
  });
  it("has the code restore the signal and import assumptions with it", () => {
    expect(flat("process_the_code.md")).toMatch(
      /The Code restores the signal and carries somebody else's assumptions with it/i,
    );
  });
  it("makes length the only uncompellable component and mostly noise", () => {
    expect(flat("process_the_length.md")).toMatch(
      /The Length is the only uncompellable part and is mostly noise/i,
    );
  });
});

describe("vouching: what the referee has actually put down", () => {
  it("explains why letters are uniform and phone calls are not", () => {
    expect(flat("process_stake_vouching.md")).toMatch(
      /The Stake is what makes the strongest vouches rare and the warm ones universal/i,
    );
  });
  it("values the candidate at the referee's rate", () => {
    expect(flat("process_the_borrowed_standing.md")).toMatch(
      /The Borrowed Standing values the candidate at the referee's rate/i,
    );
  });
  it("keeps the collateral real and never itemised", () => {
    expect(flat("process_the_collateral.md")).toMatch(
      /The Collateral is real, uncollected, and never itemised/i,
    );
  });
  it("hands the obligation mechanism back to debt and owing", () => {
    const r = flat("process_the_repayment.md");
    expect(r).toMatch(/The Repayment is owed to somebody who is not collecting/i);
    expect(r).toMatch(/The obligation a transfer creates is debt's and the owing composite's/i);
  });
});

describe("vouching: the reader is right to discount everything", () => {
  it("makes the discounting correct rather than cynical", () => {
    const rd = flat("process_reading_vouching.md");
    expect(rd).toMatch(/This is not cynicism/i);
    expect(rd).toMatch(/importing the shape of a network instead/i);
  });
  it("notes that only one of the three parties takes the text seriously", () => {
    expect(flat("process_the_discounted_text.md")).toMatch(
      /The Discounted Text is taken seriously by exactly one of the three parties/i,
    );
  });
  it("assesses the referee and scores the candidate", () => {
    expect(flat("process_the_weighed_source.md")).toMatch(
      /The Weighed Source assesses the referee and scores the candidate/i,
    );
  });
  it("makes the absence the only signal and an uninterpretable one", () => {
    expect(flat("process_the_absent_letter.md")).toMatch(
      /The Absent Letter is the only signal available and cannot be interpreted/i,
    );
  });
});

describe("vouching: nobody has to be sabotaging anybody", () => {
  it("refuses the treacherous referee and the lazy reader", () => {
    expect(flat("process_reading_vouching.md")).toMatch(
      /stages a referee as sabotaging somebody has replaced the mechanism with a betrayal/i,
    );
    expect(flat("REFERENCES.md")).toMatch(
      /The referees were sincere\. The letters were warm and true\./,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do keep every letter warm/);
  });
});

describe("vouching: what the engine refuses to over-claim", () => {
  // One firm measured leg, one narrow one, and a good deal of structural
  // reasoning, weighted differently and said so.
  it("names the firm leg and the narrow one separately", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The low validity of unstructured references is well established/i);
    expect(refs).toMatch(/The language findings are measured and narrow/i);
    expect(refs).toMatch(/not a universal law of letters/i);
  });
  it("marks the stake movement as structural reasoning", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The stake movement is structural reasoning, not measurement/i,
    );
  });
  it("concedes the absent-letter claim is its own inference and unreliable per case", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The absent-letter claim is the engine's own inference/i);
    expect(refs).toMatch(/unreliable in any individual case/i);
  });
  it("bounds the engine to the setting its literature comes from", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The engine is written from a professional-appointment setting/i,
    );
  });
  it("refuses the reading that referees are dishonest", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /referees are dishonest, that references should be abolished/i,
    );
  });
});

describe("vouching: the boundary with asking, advice, and interview", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The request for help \(asking, gift, debt, owing\)/);
    expect(refs).toMatch(/The second judgement on a decision \(advice, expertise\)/);
    expect(refs).toMatch(/The hour in a room \(interview, presentation, face\)/);
    expect(refs).toMatch(/The talk that circulates \(gossip, grapevine, reputation, stigma\)/);
  });
  it("credits Highhouse to the interview engine while using him", () => {
    expect(flat("REFERENCES.md")).toMatch(/Used here, owned by the interview engine/);
  });
  it("names no help, interview, or gossip form among its members", () => {
    const foreign = ["help", "favour", "interview", "gossip", "rumour"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("vouching: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Vouching");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_absent_letter.md"]).toEqual([
      ROOT,
      "process_reading_vouching.md",
      "process_the_absent_letter.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_open_testimonial.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
