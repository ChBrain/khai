// The commute engine tests only what is commute-specific: that the package
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

const ROOT = "process_commute.md";
const MOVEMENTS = [
  "process_trade_commute.md",
  "process_passage_commute.md",
  "process_settling_commute.md",
  "process_ledger_commute.md",
];

describe("commute: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("commute: manifest", () => {
  it("declares the commute process tree with a single root", () => {
    expect(manifest.engine).toBe("commute");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- an arrangement running, not a state", () => {
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

describe("commute: the four movements", () => {
  // The four run once per move and repeat at the next one, since the ledger is
  // what the next trade is decided from.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("keeps the four movements in the order the arrangement runs", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads).toEqual(MOVEMENTS);
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the settling's three forms in the order the two sides separate", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_settling_commute.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_house_absorbed.md",
      "process_the_drive_unabsorbed.md",
      "process_the_widening_gap.md",
    ]);
  });
});

describe("commute: the twist lives at the root", () => {
  // The asymmetry belongs to the whole arrangement rather than to any one
  // movement. The ledger carries it downward.
  it("the root's Echo names the asymmetric adaptation", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /Everything the commute was traded for stops being felt, and the commute does not/i,
    );
    expect(echo).toMatch(/neither movement is visible to the person making them/i);
  });
  it("the ledger movement carries the same keystone", () => {
    expect(flat("process_ledger_commute.md")).toMatch(
      /everything the commute was traded for stops being felt, and the commute does not/i,
    );
  });
  it("reads the engine on what the trade did rather than on whether it was sensible", () => {
    expect(flat(ROOT)).toMatch(
      /Commute is read on what the trade did afterwards, never on whether it was sensible/i,
    );
  });
});

describe("commute: the trade compares unlike things", () => {
  it("states the mismatch at the movement head", () => {
    expect(flat("process_trade_commute.md")).toMatch(
      /The Trade compares something inspected with something estimated/i,
    );
  });
  it("keeps the gain real and its signal temporary", () => {
    expect(flat("process_the_extra_room.md")).toMatch(
      /The Extra Room keeps its value and loses its voice/i,
    );
  });
  it("prices the journey on its best day", () => {
    expect(flat("process_the_minutes_priced.md")).toMatch(
      /The Minutes Priced describe the journey on its best day/i,
    );
  });
  it("leaves the decision with no feedback loop", () => {
    expect(flat("process_the_one_calculation.md")).toMatch(
      /The One Calculation is made in advance and never checked against the outcome/i,
    );
  });
});

describe("commute: the cost is in the buffer, not the delay", () => {
  it("makes the ordinary day the expensive one", () => {
    expect(flat("process_passage_commute.md")).toMatch(
      /The Passage costs most on the days it goes as expected/i,
    );
  });
  it("charges every morning for the worst one", () => {
    const v = flat("process_the_variance.md");
    expect(v).toMatch(/The Variance charges every day for the worst one/i);
    expect(v).toMatch(/The buffer is the larger part/i);
  });
  it("keeps the effort and removes the option", () => {
    expect(flat("process_the_no_control.md")).toMatch(
      /The No Control keeps the effort and removes the option/i,
    );
  });
  it("lets the hollow hour be genuinely defended", () => {
    const h = flat("process_the_hollow_hour.md");
    expect(h).toMatch(/The Hollow Hour is worth having and not worth what it costs/i);
    expect(h).toMatch(/the only time nobody wants anything from them/i);
  });
});

describe("commute: adaptation acts on one side only", () => {
  it("names the asymmetry at the movement head and hands the mechanism back", () => {
    const s = flat("process_settling_commute.md");
    expect(s).toMatch(/The Settling erases one side of the bargain and leaves the other standing/i);
    expect(s).toMatch(/The general return to a baseline is hedonic-adaptation's/i);
  });
  it("keeps the absorbed gain intact and silent", () => {
    expect(flat("process_the_house_absorbed.md")).toMatch(
      /The House Absorbed is entirely intact and no longer counts for anything/i,
    );
  });
  it("explains the unabsorbed side by what its edge is made of", () => {
    const d = flat("process_the_drive_unabsorbed.md");
    expect(d).toMatch(/The Drive Unabsorbed keeps its edge because of what its edge is made of/i);
    expect(d).toMatch(/This is not a claim about weakness/i);
  });
  it("makes the deterioration entirely of adaptation", () => {
    expect(flat("process_the_widening_gap.md")).toMatch(
      /The Widening Gap is a deterioration made entirely of adaptation/i,
    );
  });
});

describe("commute: the account cannot be audited from inside", () => {
  it("leaves the justification recitable and unfeelable", () => {
    expect(flat("process_the_invisible_gain.md")).toMatch(
      /The Invisible Gain is a good argument with nothing behind it/i,
    );
  });
  it("posts the cost to the wrong account every time", () => {
    expect(flat("process_the_unattributed_cost.md")).toMatch(
      /The Unattributed Cost is paid in a currency it is not recorded in/i,
    );
  });
  it("sends the persona into the next decision with nothing usable", () => {
    expect(flat("process_the_next_move.md")).toMatch(
      /The Next Move is decided by somebody who has learned nothing they can use/i,
    );
  });
});

describe("commute: nobody has to have made a mistake", () => {
  it("refuses the misery reading and the regret reading", () => {
    expect(flat("process_ledger_commute.md")).toMatch(
      /stages the commute as misery has replaced the mechanism with a complaint/i,
    );
    expect(flat("REFERENCES.md")).toMatch(
      /The trade was sensible\. The house is good\. The journey is mostly fine/,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do make the trade defensible/);
  });
});

describe("commute: what the engine refuses to over-claim", () => {
  // A famous result that is weaker and more contested than its fame, said first.
  it("marks the paradox as panel evidence rather than experimental", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The commuting paradox is panel evidence, not experimental/i);
  });
  it("keeps the contrary evidence rather than dropping it", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/There is real contrary evidence and it is not dropped here/i);
    expect(refs).toMatch(/mode is an enormous moderator/i);
    expect(refs).toMatch(/the flattening is the largest thing wrong with it/i);
  });
  it("names the load-bearing inference as an argument", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The asymmetric-adaptation claim is the engine's load-bearing inference/i,
    );
  });
  it("bounds the day-reconstruction ranking to what it can carry", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The day-reconstruction ranking is one method on one sample/i,
    );
  });
  it("refuses the reading that commuting is bad for everybody", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /commuting is bad for everybody, that people who commute have erred/i,
    );
  });
});

describe("commute: the boundary with hedonic-adaptation, waiting, and stress", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The return to a baseline \(hedonic-adaptation, lasting, savoring\)/);
    expect(refs).toMatch(/The imposed wait \(waiting, queue norms\)/);
    expect(refs).toMatch(
      /The load on the body \(stress, coping, restoration, restorative-environment\)/,
    );
    expect(refs).toMatch(/The bond to a place \(place-attachment, dwelling, third-place\)/);
  });
  it("names no adaptation, waiting, or stress form among its members", () => {
    const foreign = ["adapt", "waiting", "stress", "baseline"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("commute: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Commute");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_variance.md"]).toEqual([
      ROOT,
      "process_passage_commute.md",
      "process_the_variance.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_season_ticket.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
