// The interview engine tests only what is interview-specific: that the package
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

const ROOT = "process_interview.md";
const MOVEMENTS = [
  "process_room_interview.md",
  "process_read_interview.md",
  "process_sense_interview.md",
  "process_keeper_interview.md",
];

describe("interview: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("interview: manifest", () => {
  it("declares the interview process tree with a single root", () => {
    expect(manifest.engine).toBe("interview");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- an encounter being run, not a state", () => {
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

describe("interview: the four movements", () => {
  // The four run in order for one candidate and run again unchanged for the
  // next, since the keeper is what returns the free hand to the next panel.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("keeps the four movements in the order the encounter runs", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads).toEqual(MOVEMENTS);
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the room's three forms in the order they constrain the hour", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_room_interview.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_short_hour.md",
      "process_the_two_performances.md",
      "process_the_free_hand.md",
    ]);
  });
});

describe("interview: the twist lives at the root", () => {
  // What the hour supplies is certainty rather than information, which is a
  // property of the whole arrangement. The keeper carries it downward.
  it("the root's Echo names the confidence rather than the accuracy", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /The interview contributes least to the decision and supplies all of the confidence in it/i,
    );
    expect(echo).toMatch(
      /the only part of the process that feels like judging rather than filing/i,
    );
  });
  it("the keeper movement carries the same keystone", () => {
    expect(flat("process_keeper_interview.md")).toMatch(
      /the interview contributes least to the decision and supplies all of the confidence in it/i,
    );
  });
  it("reads the engine on the certainty produced rather than the information collected", () => {
    expect(flat(ROOT)).toMatch(
      /read on the certainty it produced, never on the information it collected/i,
    );
  });
});

describe("interview: the room improvises its own instrument", () => {
  it("names the comparison problem rather than only the accuracy problem", () => {
    const r = flat("process_room_interview.md");
    expect(r).toMatch(/The Room improvises the instrument and then trusts the readings/i);
    expect(r).toMatch(/comparison needs the same instrument twice/i);
  });
  it("puts the hour's brevity on the institution rather than on anybody's fault", () => {
    expect(flat("process_the_short_hour.md")).toMatch(
      /the right length for the institution and the wrong length for the question/i,
    );
  });
  it("keeps structure's advantage stated and its unpopularity explained", () => {
    const f = flat("process_the_free_hand.md");
    expect(f).toMatch(/The Free Hand is defended as skill and behaves as noise/i);
    expect(f).toMatch(/one of the larger and better replicated findings in the field/i);
  });
});

describe("interview: the read comes from the wrong material", () => {
  it("states the substitution at the movement head", () => {
    expect(flat("process_read_interview.md")).toMatch(
      /The Read is a true account of the wrong hour's worth of evidence/i,
    );
  });
  it("makes the early verdict a defence rather than a test", () => {
    expect(flat("process_the_early_verdict.md")).toMatch(
      /The Early Verdict makes the rest of the hour a defence/i,
    );
  });
  it("keeps fit real and its material resemblance, with nobody intending it", () => {
    const t = flat("process_the_fit_test.md");
    expect(t).toMatch(/The Fit Test finds resemblance and reports merit/i);
    expect(t).toMatch(/excellence keeps looking like them/i);
  });
  it("scores the telling rather than the history", () => {
    expect(flat("process_the_told_story.md")).toMatch(
      /The Told Story converts the same history into different evidence/i,
    );
  });
});

describe("interview: the hour cannot come back empty", () => {
  // Dana, Dawes and Peterson: a picture forms from answers with nothing in
  // them, so completeness is not evidence that the hour contained anything.
  it("makes the null result the movement's claim", () => {
    const s = flat("process_sense_interview.md");
    expect(s).toMatch(/an instrument that cannot return nothing/i);
    expect(s).toMatch(/The Sense Made is the reason the room never feels wasted/i);
  });
  it("names the random-answer demonstration where it is load bearing", () => {
    expect(flat("process_the_absorbed_answer.md")).toMatch(
      /The Absorbed Answer means the instrument has no reading for absence/i,
    );
  });
  it("keeps the written reasons downstream of the verdict", () => {
    expect(flat("process_the_reasons_after.md")).toMatch(
      /The Reasons After document a judgement they did not produce/i,
    );
  });
});

describe("interview: why nothing gets corrected", () => {
  it("stops experience from accumulating into accuracy", () => {
    expect(flat("process_the_missing_half.md")).toMatch(
      /experience at interviewing cannot accumulate into accuracy/i,
    );
  });
  it("keeps the ceremony owed and then turned into evidence", () => {
    expect(flat("process_the_shared_ceremony.md")).toMatch(
      /owed to the candidate and is then used against the file/i,
    );
  });
  it("returns the free hand by reasonable exceptions rather than by decision", () => {
    expect(flat("process_the_next_panel.md")).toMatch(
      /restores the free hand one reasonable exception at a time/i,
    );
  });
});

describe("interview: nobody has to be prejudiced", () => {
  it("refuses the bigoted panel and the foolish interviewer", () => {
    expect(flat("process_keeper_interview.md")).toMatch(
      /stages the panel as prejudiced has replaced the mechanism with a villain/i,
    );
    expect(flat("REFERENCES.md")).toMatch(
      /The panel was conscientious\. The questions were reasonable\. The candidate was treated well/,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do keep the panel conscientious/);
  });
});

describe("interview: what the engine refuses to over-claim", () => {
  // A well evidenced subject resting on one small memorable experiment, and the
  // difference is stated rather than smoothed over.
  it("names the firmest leg and the field's own revision of the numbers", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /The structured-versus-loose gap is one of the better replicated findings/i,
    );
    expect(refs).toMatch(
      /The headline validity numbers everybody quotes were re-estimated in 2022/i,
    );
  });
  it("names its own weakest joint", () => {
    expect(flat("REFERENCES.md")).toMatch(/The absorbed answer is the engine's weakest joint/i);
  });
  it("bounds the fit mechanism to the sector it was established in", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /Rivera's fit mechanism is established in one sector of one country/i,
    );
  });
  it("corrects the popular version of the early verdict rather than borrowing it", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The early verdict is stated more carefully here than it usually is/i);
    expect(refs).toMatch(/is not well supported/i);
  });
  it("refuses the reading that interviews should be abolished or interviewers are fools", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /interviews should be abolished, that interviewers are fools or bigots/i,
    );
  });
});

describe("interview: the boundary with overriding, presentation, and bias", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /The instrument-versus-judgement dispute \(overriding, expertise, measure\)/,
    );
    expect(refs).toMatch(/The candidate's front \(presentation, face, impression, deception\)/);
    expect(refs).toMatch(/The halo, the overconfidence, and the selected sample \(bias\)/);
    expect(refs).toMatch(/Who is allowed to apply at all \(capital, heritage, credentialism/);
  });
  it("hands the borrowed mechanisms back from inside the members that use them", () => {
    expect(flat("process_the_coherent_stranger.md")).toMatch(
      /The general appetite for a coherent picture is bias's and surprise's/i,
    );
    expect(flat("process_the_missing_half.md")).toMatch(
      /The general mechanism of a sample selected on the outcome is bias's/i,
    );
    expect(flat("process_the_reasons_after.md")).toMatch(
      /belongs to the moral-account composite and to attribution/i,
    );
  });
  it("names no rule, halo, or front form among its members", () => {
    const foreign = ["rule", "formula", "halo", "front"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("interview: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Interview");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_free_hand.md"]).toEqual([
      ROOT,
      "process_room_interview.md",
      "process_the_free_hand.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_reference_check.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
