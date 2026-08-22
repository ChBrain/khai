// The advice engine tests only what is advice-specific: that the package
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

const ROOT = "process_advice.md";
const MOVEMENTS = [
  "process_approach_advice.md",
  "process_weighing_advice.md",
  "process_return_advice.md",
  "process_keeping_advice.md",
];

describe("advice: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("advice: manifest", () => {
  it("declares the advice process tree with a single root", () => {
    expect(manifest.engine).toBe("advice");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- an episode being run, not a state", () => {
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

describe("advice: the four movements", () => {
  // The four run in order for one episode and loop across many, since the
  // keeping selects who gets asked the next time.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("keeps the four movements in the order an episode runs", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads).toEqual(MOVEMENTS);
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the keeping's three forms in the order they are produced", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_keeping_advice.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_second_name.md",
      "process_the_citation.md",
      "process_the_next_advisor.md",
    ]);
  });
});

describe("advice: the twist lives at the root", () => {
  // What survives an episode is the attachment rather than the content, which
  // is a property of the whole arrangement. The keeping carries it downward.
  it("the root's Echo names the adviser kept and the advice discarded", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/A persona takes almost none of the advice and keeps all of the adviser/i);
    expect(echo).toMatch(/produced in full whether or not a single word was used/i);
  });
  it("the keeping movement carries the same keystone", () => {
    expect(flat("process_keeping_advice.md")).toMatch(
      /a persona takes almost none of the advice and keeps all of the adviser/i,
    );
  });
  it("reads the engine on what was kept rather than on what was said", () => {
    expect(flat(ROOT)).toMatch(/Advice is read on what was kept, never on what was said/i);
  });
});

describe("advice: the approach settles the meaning before the content", () => {
  it("makes the entry decide more than the evaluation", () => {
    expect(flat("process_approach_advice.md")).toMatch(
      /The Approach settles what the advice will mean before anybody has evaluated it/i,
    );
  });
  it("prices the invitation in standing", () => {
    expect(flat("process_the_invitation.md")).toMatch(/The Invitation buys candour with standing/i);
  });
  it("puts the decision before the consultation", () => {
    expect(flat("process_the_prepared_answer.md")).toMatch(
      /The Prepared Answer sets the advice to arrive after the decision/i,
    );
  });
  it("keeps the unbidden advice correct and still unusable", () => {
    const u = flat("process_the_unbidden.md");
    expect(u).toMatch(/The Unbidden pays for its accuracy with its reception/i);
    expect(u).toMatch(/being right about it usually makes it worse/i);
  });
});

describe("advice: the weighing moves almost nothing", () => {
  // Egocentric discounting is the engine's firmest measured ground, so the
  // members state the ratio and what it does and does not track.
  it("states the ratio and that averaging would beat it", () => {
    const w = flat("process_weighing_advice.md");
    expect(w).toMatch(/The Weighing moves less than it feels like and by less than it should/i);
    expect(w).toMatch(/three parts in ten toward it and keep seven of their own/i);
  });
  it("puts the discount on visibility rather than on validity", () => {
    expect(flat("process_the_own_view_kept.md")).toMatch(
      /The Own View Kept discounts the adviser for being outside the persona's head/i,
    );
  });
  it("names confidence as a cue that cannot carry the weight", () => {
    expect(flat("process_the_confident_voice.md")).toMatch(
      /The Confident Voice is followed for a signal it cannot support/i,
    );
  });
  it("runs the uptake curve backwards to the usefulness curve", () => {
    const a = flat("process_the_agreeing_word.md");
    expect(a).toMatch(/The Agreeing Word is taken whole because it costs nothing to take/i);
    expect(a).toMatch(/the uptake curve runs backwards to the usefulness curve/i);
  });
});

describe("advice: the adviser never finds out", () => {
  it("makes the only feedback in the system not feedback", () => {
    expect(flat("process_the_report_back.md")).toMatch(
      /The Report Back is the only feedback in the system and it is not feedback/i,
    );
  });
  it("keeps the thanks sincere and about the wrong thing", () => {
    expect(flat("process_the_unfollowed_thanks.md")).toMatch(
      /The Unfollowed Thanks are true about the person and false about the advice/i,
    );
  });
  it("costs the adviser the outsideness that made them worth asking", () => {
    expect(flat("process_the_advisor_invested.md")).toMatch(
      /The Adviser Invested loses the outsideness that made them worth asking/i,
    );
  });
});

describe("advice: what the episode was producing", () => {
  it("attaches the second name by the asking rather than by the advice", () => {
    expect(flat("process_the_second_name.md")).toMatch(
      /The Second Name is acquired by the asking rather than by the advice/i,
    );
  });
  it("issues the citation in one direction only", () => {
    expect(flat("process_the_citation.md")).toMatch(
      /The Citation is dated to the bad news and is never issued after good news/i,
    );
  });
  it("selects the next adviser on the conversation rather than the outcome", () => {
    expect(flat("process_the_next_advisor.md")).toMatch(
      /The Next Adviser is chosen on the conversation rather than on the outcome/i,
    );
  });
});

describe("advice: nobody has to be manipulating anybody", () => {
  it("refuses the manipulative asker and the foolish adviser", () => {
    expect(flat("process_keeping_advice.md")).toMatch(
      /stages the asker as manipulative has replaced the mechanism with a con/i,
    );
    expect(flat("REFERENCES.md")).toMatch(
      /The adviser was competent\. The asker was sincere\. The advice was sound/,
    );
    expect(flat("playwright_instructions.md")).toMatch(
      /Do keep the adviser competent and the advice sound/,
    );
  });
});

describe("advice: what the engine refuses to over-claim", () => {
  // A firm centre and soft edges, and the shape of that is stated rather than
  // smoothed into a single level of confidence.
  it("names the firm ground and the paradigm it came from", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /Egocentric discounting is among the better replicated effects in judgement research/i,
    );
    expect(refs).toMatch(
      /The paradigm it comes from is nothing like the scenes this engine describes/i,
    );
    expect(refs).toMatch(/the single largest liberty taken here/i);
  });
  it("locates the twist's soft joint precisely", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The twist's soft joint is the citation, not the sharing/i,
    );
  });
  it("says why a well-known finding was left out", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/One well-known finding was deliberately left out/i);
    expect(refs).toMatch(/under serious investigation for data integrity/i);
    expect(refs).toMatch(/no member depends on it/i);
  });
  it("refuses the reading that advisers are useless or asking is a manoeuvre", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /advisers are useless, that seeking advice is a manoeuvre, or that discounting is stupidity/i,
    );
  });
});

describe("advice: the boundary with asking, persuasion, and expertise", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The request for help \(asking, gift, debt\)/);
    expect(refs).toMatch(/Moving a mind that was not offered \(persuasion, reactance, influence\)/);
    expect(refs).toMatch(/Whether the adviser knows anything \(expertise, overriding, measure\)/);
    expect(refs).toMatch(/The threat of the remark \(face, embarrassment, status-move\)/);
  });
  it("names no help, persuasion, or expertise form among its members", () => {
    const foreign = ["help", "favour", "persuas", "expert", "trust"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("advice: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Advice");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_second_name.md"]).toEqual([
      ROOT,
      "process_keeping_advice.md",
      "process_the_second_name.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_referral.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
