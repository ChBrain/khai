// The asking engine tests only what is asking-specific: that the package
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

const ROOT = "process_asking.md";
const MOVEMENTS = [
  "process_reluctance_asking.md",
  "process_misestimate_asking.md",
  "process_act_asking.md",
  "process_granting_asking.md",
];

describe("asking: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("asking: manifest", () => {
  it("declares the asking process tree with a single root", () => {
    expect(manifest.engine).toBe("asking");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- a request being placed, not a state", () => {
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

describe("asking: the four movements", () => {
  // The tree is exactly two deep: root -> movement -> form. The four run in order
  // within a single request and loop across many, since the granting does not
  // update the asker.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("keeps the four movements in the order a request runs", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads).toEqual(MOVEMENTS);
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the granting's three forms in the order they arrive", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_granting_asking.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_helping.md",
      "process_the_standing_conferred.md",
      "process_the_next_ask.md",
    ]);
  });
});

describe("asking: the twist lives at the root", () => {
  // The two readings of one act failing to meet is a property of the whole
  // operation, so it belongs to the anchor. The granting carries it down.
  it("the root's Echo names taking felt and giving landed", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/Asking feels like taking and lands like giving/i);
    expect(echo).toMatch(/The two readings of the same act never meet/i);
  });
  it("the granting movement carries the same keystone", () => {
    expect(flat("process_granting_asking.md")).toMatch(
      /asking feels like taking and lands like giving/i,
    );
  });
  it("reads the engine on what was not asked for", () => {
    expect(flat(ROOT)).toMatch(/read on what was not asked for, never on what was/i);
  });
});

describe("asking: the misestimate is self-sealing", () => {
  // The engine's evidential core: the error is directional and cannot correct
  // itself, because the correcting evidence is produced only by asking.
  it("names the error as a forecast rather than a fear", () => {
    expect(flat("process_the_no_expected.md")).toMatch(
      /The No Expected is a forecast, not a fear/i,
    );
  });
  it("makes the unmade ask the largest term with no evidence trail", () => {
    const u = flat("process_the_ask_unmade.md");
    expect(u).toMatch(/the engine's largest term and leaves no trace/i);
    expect(flat("process_misestimate_asking.md")).toMatch(
      /prevents the experiment that would correct it/i,
    );
  });
  it("keeps the engine failing to teach at the next ask", () => {
    expect(flat("process_the_next_ask.md")).toMatch(
      /the reluctance survives all of its own disconfirmations/i,
    );
  });
});

describe("asking: standing is conserved", () => {
  // The good news is not evenly distributed: the act that raises the helper marks
  // the asker, so who is asking decides what asking costs.
  it("keeps the counterweight inside the member, not only in the references", () => {
    const s = flat("process_the_standing_conferred.md");
    expect(s).toMatch(/standing is conserved/i);
    expect(s).toMatch(/costs a secure persona nothing/i);
  });
  it("makes the free refusal unequally available", () => {
    expect(flat("process_the_free_refusal.md")).toMatch(/not equally available to everybody/i);
  });
});

describe("asking: nobody has to be behaving badly", () => {
  it("refuses the put-upon helper and the asker working an angle", () => {
    expect(flat("process_granting_asking.md")).toMatch(
      /stages the helper as put upon has replaced the mechanism with an imposition/i,
    );
    expect(flat("playwright_instructions.md")).toMatch(
      /Do not stage the asker as working an angle/,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do make the helper pleased and mean it/);
  });
  it("keeps the reluctance a virtue rather than a defect", () => {
    expect(flat("process_reluctance_asking.md")).toMatch(/a good habit running on bad numbers/i);
  });
});

describe("asking: what the engine refuses to over-claim", () => {
  // One strong directional finding sampled from small favours among strangers,
  // one badly over-quoted classic, and one weak leg named as weak.
  it("bounds the underestimation effect to the settings it was measured in", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/small favours asked of strangers in campus and laboratory/i);
    expect(refs).toMatch(/the error is directional, not that any given request will be granted/i);
  });
  it("restores the half of the placebic-reason finding that gets dropped", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/most over-quoted findings in psychology/i);
    expect(refs).toMatch(/worked for the small favour and failed for the large one/i);
    expect(flat("process_the_reason_given.md")).toMatch(/works as a shape, up to a point/i);
  });
  it("names the Ben Franklin effect as the weakest leg", () => {
    expect(flat("REFERENCES.md")).toMatch(/The Ben Franklin effect is the weakest leg here/i);
  });
  it("keeps Blau because he cuts against the engine's own good news", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /cuts against the engine's own good news and is kept for that reason/i,
    );
  });
  it("declines to rest a member on retracted-adjacent work", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /retracted for data fabrication, and the engine will not rest a member on work that has not been independently re-established/i,
    );
  });
  it("refuses just ask as advice", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /is "just ask" as advice, or that reluctance is irrational/i,
    );
  });
});

describe("asking: the boundary with the gift, the debt, and persuasion", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The transfer that binds by naming no price \(gift, debt, owing\)/);
    expect(refs).toMatch(/The engineering of compliance \(persuasion, swaying, captology\)/);
    expect(refs).toMatch(/Nobody moving when a stranger collapses \(bystander-effect\)/);
    expect(refs).toMatch(/The account required rather than offered \(confession\)/);
  });
  it("names no gift, debt, or influence form among its members", () => {
    const foreign = ["gift", "debt", "owed", "reciproc", "compliance"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("asking: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Asking");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_ask_unmade.md"]).toEqual([
      ROOT,
      "process_misestimate_asking.md",
      "process_the_ask_unmade.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_favour.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
