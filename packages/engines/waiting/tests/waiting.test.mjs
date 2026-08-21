// The waiting engine tests only what is waiting-specific: that the package
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

const ROOT = "process_waiting.md";
const MOVEMENTS = [
  "process_summons.md",
  "process_hold_waiting.md",
  "process_order_waiting.md",
  "process_schooling.md",
];

describe("waiting: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("waiting: manifest", () => {
  it("declares the waiting process tree with a single root", () => {
    expect(manifest.engine).toBe("waiting");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- a wait is time being transferred, not a state", () => {
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

describe("waiting: the four movements", () => {
  // The tree is exactly two deep: root -> movement -> form. The movements are not
  // a sequence -- the summons is settled before any waiting is done, and the
  // schooling is about repetition rather than about any particular wait.
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
  it("keeps the summons at three forms, split by whether the wait has an edge", () => {
    // The bounded/unbounded distinction is the engine's most load-bearing cut:
    // an appointed hour returns the interval before it and the other two do not.
    const three = manifest.members
      .filter((m) => m.parent === "process_summons.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_appointed_hour.md",
      "process_open_call.md",
      "process_standing_by.md",
    ]);
    expect(flat("process_appointed_hour.md")).toMatch(/returns the time before it/i);
    expect(flat("process_open_call.md")).toMatch(/holding every hour until it comes/i);
    expect(flat("process_summons.md")).toMatch(/availability cannot be part-held/i);
  });
});

describe("waiting: the twist lives at the root", () => {
  // Uncertainty rather than duration is a property of the arrangement rather than
  // of any one form, so it belongs to the anchor. The schooling carries it downward.
  it("the root's Echo names uncertainty as the instrument", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/The instrument is not duration, it is \*\*uncertainty\*\*/);
    expect(echo).toMatch(/nothing has been refused/);
  });
  it("the schooling movement carries the same keystone", () => {
    expect(flat("process_schooling.md")).toMatch(
      /not making somebody wait long but declining to say how long/,
    );
  });
});

describe("waiting: the order's local defence", () => {
  // Milgram's finding is the engine's sharpest: the queue is defended by whoever
  // is directly displaced, which is why it holds against a jumper and is silent
  // about the side door. Losing this would make the order axis merely about
  // fairness rather than about legitimacy.
  it("keeps the defence local, and says what that leaves undefended", () => {
    const intrusion = flat("process_queue_intrusion.md");
    expect(intrusion).toMatch(
      /directly behind the point of entry, and almost never from further back/,
    );
    expect(intrusion).toMatch(
      /holds against the rude individual and is silent about the institution/,
    );
    expect(flat("process_order_waiting.md")).toMatch(/polices the queue and cannot see the door/);
  });
});

describe("waiting: nobody has to be acting badly", () => {
  // The mechanism runs on reasonable officials and genuine delays. A play that
  // supplies a villain has replaced it, and the engine says so in its own text.
  it("keeps intent out of the schooling", () => {
    const schooling = flat("process_schooling.md");
    expect(schooling).toMatch(/no step in this is malicious and most of it is not even deliberate/);
    expect(schooling).toMatch(/a play that supplies one has misread it/);
    expect(flat("playwright_instructions.md")).toMatch(
      /a play that supplies a hostile clerk has replaced the mechanism with a scene/,
    );
  });
  it("refuses the over-reading in the references", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /short step from "waiting subordinates" to "waiting is designed to subordinate"/,
    );
    expect(refs).toMatch(
      /not that institutions make people wait on purpose|institutions make people wait on purpose/i,
    );
  });
});

describe("waiting: the boundary with the feeling and the duration", () => {
  it("delegates suspense, time-perception, and boredom explicitly", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The hold on a possible bad outcome \(suspense\)/);
    expect(refs).toMatch(/The felt passage of duration \(time-perception\)/);
    expect(refs).toMatch(/The unengaged mind \(boredom\)/);
  });
  it("names no affect and no rank among its members", () => {
    const foreign = ["suspense", "boredom", "anxiety", "status", "rank"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("waiting: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Waiting");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_open_call.md"]).toEqual([
      ROOT,
      "process_summons.md",
      "process_open_call.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_queue.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
