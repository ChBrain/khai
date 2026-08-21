// The sleep engine tests only what is sleep-specific: that the package conforms
// to the canon through the shared conformance kit (@chbrain/khai-tests), its
// manifest contract, the four-movement shape, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_sleep.md";
const MOVEMENTS = [
  "process_surrender_sleep.md",
  "process_debt_sleep.md",
  "process_effort_sleep.md",
  "process_schedule_sleep.md",
];

describe("sleep: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("sleep: manifest", () => {
  it("declares the sleep process tree with a single root", () => {
    expect(manifest.engine).toBe("sleep");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- a requirement being met or failing, not a state", () => {
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

describe("sleep: the four movements", () => {
  // The tree is exactly two deep: root -> movement -> form. The movements are not
  // stages of a night -- they are independent ways the same thing goes wrong, and
  // a persona can be in all four at once.
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
  it("carries Espie's three steps in order", () => {
    // Attention, then intention, then effort. The order is the model: each step
    // is the reasonable response to the previous one's failure, and they compound.
    const three = manifest.members
      .filter((m) => m.parent === "process_effort_sleep.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_attention_turned.md",
      "process_intending_sleep.md",
      "process_trying.md",
    ]);
  });
});

describe("sleep: the twist lives at the root", () => {
  // Effort being disqualifying is a property of the need rather than of any one
  // movement, so it belongs to the anchor. The effort movement carries it down.
  it("the root's Echo names sleep as the one need effort cannot serve", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/only thing a persona cannot obtain by trying to/i);
    expect(echo).toMatch(/cannot be done on purpose/i);
  });
  it("the effort movement carries the same keystone", () => {
    expect(flat("process_effort_sleep.md")).toMatch(
      /the only thing a persona cannot obtain by trying to/i,
    );
  });
  // The way out cannot be staged as a decision, because deciding to stop trying
  // is trying. This is the single most likely thing a play would get wrong.
  it("refuses the relax-and-drift-off scene in the member and the guide", () => {
    expect(flat("process_trying.md")).toMatch(
      /should not release the persona by having them decide to stop trying/i,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Deciding to stop trying is trying/);
  });
});

describe("sleep: nobody is at fault", () => {
  // The persona in the effort loop is competent and their reasoning is sound;
  // the persona in deficit is honest and wrong. Both readings would collapse if
  // the engine let a temperament or a denial in.
  it("keeps the striving competent rather than anxious", () => {
    expect(flat("process_trying.md")).toMatch(
      /a competent person being defeated by their competence/i,
    );
    expect(flat("playwright_instructions.md")).toMatch(
      /has replaced the mechanism with a temperament/,
    );
  });
  it("keeps the impaired persona sincere rather than in denial", () => {
    expect(flat("process_blunted_gauge.md")).toMatch(/not in denial/i);
    expect(flat("process_blunted_gauge.md")).toMatch(/dangerous, and honest, and wrong/i);
  });
  it("keeps the light sleeper succeeding rather than failing", () => {
    expect(flat("process_surrender_sleep.md")).toMatch(
      /not failing at sleep, they are succeeding at survival/i,
    );
  });
});

describe("sleep: what the engine refuses to over-claim", () => {
  // The lab population, the individual differences, and the looseness of the
  // debt metaphor are the three things most likely to be over-read.
  it("names the laboratory population and the individual differences", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/young healthy adults in controlled laboratory conditions/i);
    expect(refs).toMatch(/large, stable individual differences in vulnerability/i);
  });
  it("concedes the debt metaphor is looser than the movement title suggests", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /debt metaphor is looser than the engine's own movement title suggests/i,
    );
    expect(flat("process_accumulation.md")).toMatch(/real and does not behave like money/i);
  });
  it("declines to be clinical guidance", () => {
    expect(flat("REFERENCES.md")).toMatch(/or that any of this constitutes clinical guidance/i);
    expect(flat("playwright_instructions.md")).toMatch(
      /not clinical guidance and should not be used as any/,
    );
  });
});

describe("sleep: the boundary with the body and the drift", () => {
  it("delegates the physical demand, the drift, and the dream explicitly", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The physical demand \(body\)/);
    expect(refs).toMatch(/Thought drifting inward \(mind-wandering, rumination\)/);
    expect(refs).toMatch(/does not model dreams/);
  });
  it("names no bodily demand and no dream among its members", () => {
    const foreign = ["fatigue", "hunger", "pain", "dream", "rumination"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("sleep: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Sleep");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_trying.md"]).toEqual([
      ROOT,
      "process_effort_sleep.md",
      "process_trying.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_insomnia.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
