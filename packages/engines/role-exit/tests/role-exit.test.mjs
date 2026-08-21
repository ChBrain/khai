// The role-exit engine tests only what is role-exit-specific: that the package
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

const ROOT = "process_role_exit.md";
const MOVEMENTS = [
  "process_doubts_exit.md",
  "process_alternatives_exit.md",
  "process_turning_point_exit.md",
  "process_ex_role.md",
];

describe("role-exit: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("role-exit: manifest", () => {
  it("declares the role-exit process tree with a single root", () => {
    expect(manifest.engine).toBe("role-exit");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- a leaving being performed, not a state", () => {
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

describe("role-exit: the four movements", () => {
  // Unlike most process trees here, this one is genuinely sequential: the
  // movements are Ebaugh's four stages and they run in order, so the manifest
  // order is load-bearing.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("keeps the four movements in the order the exit runs", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads).toEqual(MOVEMENTS);
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the turning point's three forms in the order they arrive", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_turning_point_exit.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_last_straw.md",
      "process_the_announcing.md",
      "process_the_vacuum.md",
    ]);
  });
});

describe("role-exit: the twist lives at the root", () => {
  // The ex being unresignable is a property of the whole operation rather than of
  // any one movement, so it belongs to the anchor. The ex-role carries it down.
  it("the root's Echo names the unresignable ex", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/A role can be quit; being its ex cannot/i);
    expect(echo).toMatch(/nobody to resign to and no procedure for it/i);
  });
  it("the ex-role movement carries the same keystone", () => {
    expect(flat("process_ex_role.md")).toMatch(/a role can be quit; being its ex cannot/i);
  });
  it("the placing is the point where it cannot be revoked", () => {
    expect(flat("process_the_placing.md")).toMatch(
      /Roles have exits; ex-roles do not, because nobody administers them/i,
    );
  });
});

describe("role-exit: the sequence starts earlier than anybody says", () => {
  // The doubts are the longest movement and the least remembered, and the turning
  // point is the most remembered and did the least.
  it("dates the doubts years before the decision", () => {
    expect(flat("process_doubts_exit.md")).toMatch(
      /dated years earlier than the persona will say/i,
    );
    expect(flat("process_the_first_doubt.md")).toMatch(/too small to argue with/i);
  });
  it("makes the turning point license rather than cause", () => {
    const t = flat("process_turning_point_exit.md");
    expect(t).toMatch(/does not cause the exit; it licenses it/i);
    expect(t).toMatch(/is not where the decision was made/i);
  });
  it("keeps the vacuum a stage rather than a verdict", () => {
    expect(flat("process_the_vacuum.md")).toMatch(
      /The Vacuum is a stage and is experienced as a verdict/i,
    );
  });
});

describe("role-exit: nobody has to have done anything wrong", () => {
  it("refuses the mistaken exit and the punishing institution", () => {
    expect(flat("process_ex_role.md")).toMatch(
      /stages the exit as a mistake has replaced the mechanism with a regret/i,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do make the exit right/);
    expect(flat("playwright_instructions.md")).toMatch(/Do keep the institution decent/);
  });
  it("keeps the placing kind and the side bets innocent", () => {
    expect(flat("process_the_placing.md")).toMatch(
      /done by people who like the persona and cannot be asked to stop/i,
    );
    expect(flat("process_the_side_bets.md")).toMatch(/never wagered on the role/i);
  });
});

describe("role-exit: what the engine refuses to over-claim", () => {
  // One strong qualitative study at the centre, sampled from unusually total
  // roles, with a thin quantitative leg that points the other way as often as not.
  it("names Ebaugh as interview work rather than measurement", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/interview work, not measurement/i);
    expect(refs).toMatch(/reconstructed into four stages after the fact/i);
  });
  it("states the sampling bias toward total roles as its weakest move", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/rests on roles that were unusually total/i);
    expect(refs).toMatch(/the weakest move the engine makes/i);
  });
  it("reports the measured case honestly, including that most exits go well", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/most transitions go reasonably well/i);
    expect(refs).toMatch(/one in six rather than the majority/i);
  });
  it("refuses the reading that exits are traumatic or regretted", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /Most exits are the right decision and are reported as such/i,
    );
  });
});

describe("role-exit: the boundary with liminality, the rite, and the role", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The between-state itself \(liminality, passage, ritual\)/);
    expect(refs).toMatch(/The role as held \(role\)/);
    expect(refs).toMatch(/The discrediting attribute \(stigma\)/);
    expect(refs).toMatch(/The felt absence \(grief, nostalgia, place-attachment\)/);
  });
  it("explains the vacuum member as the missing reincorporation", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/carries a vacuum member and not a reincorporation/i);
    expect(flat("process_the_vacuum.md")).toMatch(/why modern exits so rarely have one/i);
  });
  it("names no threshold, rite, or stigma form among its members", () => {
    const foreign = ["threshold", "rite", "liminal", "stigma", "grief"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("role-exit: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Role Exit");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_side_bets.md"]).toEqual([
      ROOT,
      "process_alternatives_exit.md",
      "process_the_side_bets.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_resignation.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
