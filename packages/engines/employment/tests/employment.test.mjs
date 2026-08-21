// The employment engine tests only what is employment-specific: that the package
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

const ROOT = "process_employment.md";
const MOVEMENTS = [
  "process_indeterminacy.md",
  "process_control_work.md",
  "process_gift_work.md",
  "process_consent_work.md",
];

describe("employment: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("employment: manifest", () => {
  it("declares the employment process tree with a single root", () => {
    expect(manifest.engine).toBe("employment");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- the bargain is settled daily, never a state", () => {
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

describe("employment: the four movements", () => {
  // The tree is exactly two deep: root -> movement -> form. The movements are not
  // alternatives and not a sequence -- every workplace runs several at once, and
  // what distinguishes one from another is the mix.
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
  it("carries Edwards' three control forms plus the fourth khai adds", () => {
    // Simple, technical, and bureaucratic are Edwards'. Metric is khai's addition
    // from a much newer literature, and the references say so; dropping or
    // reordering these is a real edit rather than a tidy-up.
    const forms = manifest.members
      .filter((m) => m.parent === "process_control_work.md")
      .map((m) => m.file);
    expect(forms).toEqual([
      "process_simple_control.md",
      "process_technical_control.md",
      "process_bureaucratic_control.md",
      "process_metric_control.md",
    ]);
    expect(flat("REFERENCES.md")).toMatch(/khai's addition to Edwards/);
  });
  it("keeps work-to-rule inside the gift, since it is the gift's proof", () => {
    const wtr = manifest.members.find((m) => m.file === "process_work_to_rule.md");
    expect(wtr.parent).toBe("process_gift_work.md");
    expect(flat("process_gift_work.md")).toMatch(
      /an organisation running only on its enforceable terms does not run/i,
    );
  });
});

describe("employment: the twist lives at the root", () => {
  // The consent mechanism is a property of the bargain rather than of any one form,
  // so it belongs to the anchor. The consent movement carries it downward.
  it("the root's Echo names consent produced by trying to do well", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/makes the day bearable is the thing that ratifies the terms/);
    expect(echo).toMatch(/manufactured by the ordinary experience of trying to do well/);
  });
  it("the consent movement carries the same keystone", () => {
    expect(flat("process_consent_work.md")).toMatch(
      /makes the day bearable is the thing that ratifies its terms/,
    );
  });
});

describe("employment: the engine does not sneer at the work", () => {
  // Every movement is given its genuine case before its cost. A reader who finds
  // only the critical half has read selectively, and the engine says so.
  it("grants bureaucratic control its real improvement", () => {
    expect(flat("process_bureaucratic_control.md")).toMatch(/a real improvement in working life/);
  });
  it("keeps the absorption earned rather than deluded", () => {
    const consent = flat("process_consent_work.md");
    expect(consent).toMatch(/none of this is false consciousness and the persona is not a dupe/);
    expect(consent).toMatch(/the engine should not sneer at it/);
    expect(flat("playwright_instructions.md")).toMatch(
      /a play that stages the worker as deceived has replaced the mechanism with a villain/,
    );
  });
  it("refuses both readings in the references", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/essentially exploitative or essentially benign/i);
    expect(refs).toMatch(/a reader who finds only the critical half has read selectively/i);
  });
});

describe("employment: what the engine refuses to over-claim", () => {
  // Three legs, supported very differently: gift-exchange is best evidenced,
  // Edwards is a historical typology, Burawoy is a single shop-floor study.
  it("names the standing of each leg separately", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/a historical typology/);
    expect(refs).toMatch(/single participant-observation study of one machine shop/);
    expect(refs).toMatch(/least established member of that movement/);
  });
});

describe("employment: the boundary with culture and display", () => {
  it("delegates the organisation's culture and the role's feeling explicitly", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/How an organisation operates \(org\)/);
    expect(refs).toMatch(/The feeling a role demands \(emotional-labor\)/);
    expect(refs).toMatch(/Absorption itself \(flow\)/);
  });
  it("names no culture type and no display rule among its members", () => {
    const foreign = ["clan", "adhocracy", "masking", "method_acting", "flow"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("employment: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Employment");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_making_out.md"]).toEqual([
      ROOT,
      "process_consent_work.md",
      "process_making_out.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_wage.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
