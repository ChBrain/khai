// The expertise engine tests only what is expertise-specific: that the package
// conforms to the canon through the shared conformance kit (@chbrain/khai-tests),
// its manifest contract, the three-movement shape, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_expertise.md";
const MOVEMENTS = ["process_stages.md", "process_making_expertise.md", "process_tacit.md"];

describe("expertise: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("expertise: manifest", () => {
  it("declares the expertise process tree with a single root", () => {
    expect(manifest.engine).toBe("expertise");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- a performance changing kind, not a state", () => {
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

describe("expertise: the three movements", () => {
  // The tree is exactly two deep: root -> movement -> form. Only the stages are
  // ordered; the making and the tacit are conditions running alongside the climb.
  it("hangs exactly three movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("carries Dreyfus's five stages in order", () => {
    // The order is the model. Reordering or dropping one is a real edit, not a
    // tidy-up: what changes across the five is what the persona attends to.
    const five = manifest.members
      .filter((m) => m.parent === "process_stages.md")
      .map((m) => m.file);
    expect(five).toEqual([
      "process_novice.md",
      "process_advanced_beginner.md",
      "process_competent.md",
      "process_proficient.md",
      "process_expert_stage.md",
    ]);
  });
});

describe("expertise: the twist lives at the root", () => {
  // The account degrading as the competence improves is a property of the
  // mechanism rather than of any one stage, so it belongs to the anchor. The
  // tacit movement carries it downward and the blind spot stages it.
  it("the root's Echo names the destruction of the ability to teach", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/becoming an expert destroys the ability to teach it/i);
    expect(echo).toMatch(/Nobody is being withholding/);
  });
  it("the tacit movement carries the same keystone", () => {
    expect(flat("process_tacit.md")).toMatch(/expertise is bought with the account of itself/i);
  });
});

describe("expertise: the bound is given equal weight", () => {
  // Kahneman & Klein's conditions are the engine's most robust result and the
  // reason it will not present expertise as uniformly real. Dropping this member
  // would turn the engine into an endorsement.
  it("keeps the low-validity environment as a member of the making", () => {
    const lv = manifest.members.find((m) => m.file === "process_low_validity.md");
    expect(lv.parent).toBe("process_making_expertise.md");
    const text = flat("process_low_validity.md");
    expect(text).toMatch(/cannot tell which kind of environment they are in from inside/i);
    expect(text).toMatch(/this is not a debunking of expertise/i);
  });
  it("names the deliberate-practice dispute rather than taking the strong claim", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Ericsson's stronger claims have been challenged by meta-analyses/);
    expect(refs).toMatch(/The engine takes the mechanism and not the strong claim/);
  });
  it("names the Dreyfus model as phenomenological rather than measured", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /Dreyfus stages are a phenomenological model, not a measured taxonomy/,
    );
  });
});

describe("expertise: the blind spot is structural, not a motive", () => {
  it("refuses the gatekeeping reading in the member and the guide", () => {
    const bs = flat("process_expert_blind_spot.md");
    expect(bs).toMatch(/nothing here is bad faith/i);
    expect(bs).toMatch(/cannot correct it by trying harder/i);
    expect(flat("playwright_instructions.md")).toMatch(
      /a play that stages them as guarding their knowledge has replaced the mechanism with a motive/,
    );
  });
});

describe("expertise: the boundary with habit and power", () => {
  it("delegates the grooved response and expert power explicitly", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The response grooved by repetition \(habit, ingraining\)/);
    expect(refs).toMatch(/Expert power over another \(power, status\)/);
    expect(refs).toMatch(/Absorption in a matched challenge \(flow\)/);
  });
  it("names no habit and no power form among its members", () => {
    const foreign = ["habit", "conditioning", "reward", "power", "status"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("expertise: compose()", () => {
  // chains is keyed by true leaf only: the root and the three movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Expertise");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_plateau.md"]).toEqual([
      ROOT,
      "process_making_expertise.md",
      "process_plateau.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_mastery.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
