// The confession engine tests only what is confession-specific: that the
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

const ROOT = "process_confession.md";
const MOVEMENTS = [
  "process_demand_confession.md",
  "process_composing_confession.md",
  "process_listener_confession.md",
  "process_relief_confession.md",
];

describe("confession: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("confession: manifest", () => {
  it("declares the confession process tree with a single root", () => {
    expect(manifest.engine).toBe("confession");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- an act being performed, not a state", () => {
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

describe("confession: the four movements", () => {
  // The tree is exactly two deep: root -> movement -> form. The four run in
  // order -- required, composed, received, relieved -- and only the demand and
  // the relief are ordered internally.
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
  it("keeps the demand's three forms in the order the exit closes", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_demand_confession.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_obligation.md",
      "process_the_question.md",
      "process_the_silence_read.md",
    ]);
  });
  it("keeps the relief's three forms in the order the cycle runs", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_relief_confession.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_unburdening.md",
      "process_the_transformation.md",
      "process_the_return.md",
    ]);
  });
});

describe("confession: the twist lives at the root", () => {
  // The requirement felt as a release is a property of the whole operation
  // rather than of any one movement, so it belongs to the anchor. The relief
  // carries it downward.
  it("the root's Echo names the requirement felt as a release", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/makes a requirement feel like a release/i);
    expect(echo).toMatch(/the more relieved they feel, the less visible it becomes/i);
  });
  it("the relief movement carries the same keystone", () => {
    expect(flat("process_relief_confession.md")).toMatch(
      /makes a requirement feel like a release/i,
    );
  });
  it("the return is where the requirement becomes the persona's own practice", () => {
    expect(flat("process_the_return.md")).toMatch(
      /where the obligation becomes the persona's own practice/i,
    );
  });
});

describe("confession: the telling is produced, not retrieved", () => {
  // The composing is the engine's central claim: an account is assembled in the
  // saying and then replaces the material it was made from.
  it("keeps the account made rather than recalled, and not a lie", () => {
    const a = flat("process_the_account_made.md");
    expect(a).toMatch(/Toward a story where there was material/i);
    expect(a).toMatch(/improves the persona's understanding and destroys the evidence/i);
  });
  it("pins the false-confession mechanism to the detail", () => {
    expect(flat("process_the_detail.md")).toMatch(
      /a false confession is more convincing than a true one/i,
    );
    expect(flat("process_the_detail.md")).toMatch(
      /supplied by the person who needed them to be there/i,
    );
  });
});

describe("confession: nobody has to be behaving badly", () => {
  it("refuses the sinister listener and the hollow relief", () => {
    expect(flat("process_relief_confession.md")).toMatch(
      /stages the listener as sinister has replaced the mechanism with an interrogation/i,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do not stage the listener as sinister/);
    expect(flat("playwright_instructions.md")).toMatch(/Do make the relief real/);
  });
  it("keeps the asymmetry a design rather than a coldness", () => {
    expect(flat("process_the_asymmetry.md")).toMatch(/This is not a failure of intimacy/i);
    expect(flat("REFERENCES.md")).toMatch(
      /at its most interesting when nobody is behaving badly|The listener is kind\. The relief is real\./i,
    );
  });
});

describe("confession: what the engine refuses to over-claim", () => {
  // Foucault is the frame and the least evidenced thing here; Kassin is the
  // strongest leg; Pennebaker cuts against the engine's own authority claim.
  it("marks Foucault as philosophy and history rather than a finding", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/philosophy and history rather than a finding/i);
    expect(refs).toMatch(/the least evidenced thing in it/i);
  });
  it("names the false-confession work as the strongest leg", () => {
    expect(flat("REFERENCES.md")).toMatch(/strongest leg by a distance/i);
  });
  it("states the evidence that cuts against its own authority claim", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/with no listener at all/i);
    expect(refs).toMatch(/not that it requires one to work/i);
  });
});

describe("confession: the boundary with disclosure, the secret, and repair", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The voluntary opening that deepens a bond \(self-disclosure\)/);
    expect(refs).toMatch(/The withheld fact and the work of keeping it \(secret\)/);
    expect(refs).toMatch(
      /The account after a wrong, and the debt behind it \(repair, guilt, forgiveness\)/,
    );
    expect(refs).toMatch(/Watching, the norm, and the examination \(discipline\)/);
  });
  it("hands the record off to measure once it is a number", () => {
    expect(flat("process_the_record.md")).toMatch(/where this engine meets the measure engine/i);
    expect(flat("REFERENCES.md")).toMatch(
      /What the record becomes once it is a number \(measure\)/,
    );
  });
  it("names no disclosure, secret, or penance form among its members", () => {
    const foreign = ["disclosure", "secret", "penance", "guilt", "forgiveness"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("confession: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Confession");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_detail.md"]).toEqual([
      ROOT,
      "process_composing_confession.md",
      "process_the_detail.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_penitent.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
