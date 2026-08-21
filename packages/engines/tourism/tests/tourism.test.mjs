// The tourism engine tests only what is tourism-specific: that the package
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

const ROOT = "process_tourism.md";
const MOVEMENTS = [
  "process_marking_tourism.md",
  "process_seeking_tourism.md",
  "process_staging_tourism.md",
  "process_residue_tourism.md",
];

describe("tourism: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("tourism: manifest", () => {
  it("declares the tourism process tree with a single root", () => {
    expect(manifest.engine).toBe("tourism");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("every member is a process -- an arrangement being run, not a state", () => {
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

describe("tourism: the four movements", () => {
  // The four run in order for one visit and continuously across many, since each
  // residue becomes the next visit's marking.
  it("hangs exactly four movement heads off the root, and nothing else", () => {
    const children = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(children.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("keeps the four movements in the order a visit runs", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads).toEqual(MOVEMENTS);
  });
  it("puts every form under a movement, never under the root or another form", () => {
    const heads = new Set(MOVEMENTS);
    const forms = manifest.members.filter((m) => m.file !== ROOT && !heads.has(m.file));
    expect(forms.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const m of forms) expect(heads.has(m.parent)).toBe(true);
  });
  it("keeps the staging's three forms in the order the arrangement becomes visible", () => {
    const three = manifest.members
      .filter((m) => m.parent === "process_staging_tourism.md")
      .map((m) => m.file);
    expect(three).toEqual([
      "process_the_staged_back.md",
      "process_the_host_performing.md",
      "process_the_authenticity_sold.md",
    ]);
  });
});

describe("tourism: the twist lives at the root", () => {
  // The demand producing the supply is a property of the whole arrangement, so it
  // belongs to the anchor. The staging carries it downward.
  it("the root's Echo names the demand building the stage", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/The demand for the unstaged is what builds the stage/i);
    expect(echo).toMatch(/any back region a visitor can reach has been made reachable/i);
  });
  it("the staging movement carries the same keystone", () => {
    expect(flat("process_staging_tourism.md")).toMatch(
      /the demand for the unstaged is what builds the stage/i,
    );
  });
  it("states the impossibility inside the real sought", () => {
    expect(flat("process_the_real_sought.md")).toMatch(
      /The Real Sought cannot be handed over without ceasing to be it/i,
    );
  });
});

describe("tourism: the sight is made by its marker", () => {
  it("keeps nothing intrinsically worth seeing", () => {
    const m = flat("process_marking_tourism.md");
    expect(m).toMatch(/Nothing is intrinsically worth seeing/i);
    expect(flat("process_the_marker.md")).toMatch(
      /The Marker creates the significance it reports/i,
    );
  });
  it("makes the off path a position rather than a location", () => {
    const o = flat("process_the_off_path.md");
    expect(o).toMatch(/a position rather than a location/i);
    expect(o).toMatch(/The Off Path is found by the people who close it/i);
  });
  it("keeps every tourist disowning the word", () => {
    expect(flat("process_the_tourist_disowned.md")).toMatch(
      /Contempt for tourists is the tourist's own signature position/i,
    );
  });
});

describe("tourism: nobody has to be cynical or foolish", () => {
  it("keeps the hosts sincere and the visitors sincere", () => {
    expect(flat("process_staging_tourism.md")).toMatch(
      /stages the hosts as cynical has replaced the mechanism with a swindle/i,
    );
    expect(flat("REFERENCES.md")).toMatch(
      /The visitor genuinely wants the real thing\. The host genuinely offers it/i,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do keep the visitor sincere/);
    expect(flat("playwright_instructions.md")).toMatch(/Do keep the host sincere/);
  });
  it("makes the price the disclosure rather than the corruption", () => {
    const a = flat("process_the_authenticity_sold.md");
    expect(a).toMatch(/The price is not the corruption\. It is the disclosure/i);
    expect(a).toMatch(/the least dishonest step and the one that reads worst/i);
  });
  it("keeps the staged back genuine while not being the back", () => {
    expect(flat("process_the_staged_back.md")).toMatch(
      /The Staged Back is genuine and is not the back/i,
    );
  });
});

describe("tourism: what the engine refuses to over-claim", () => {
  // The field's central question is openly unresolved, and the engine names the
  // rival account, takes a side, and says it has not refuted it.
  it("marks MacCannell as an argument rather than a study", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /MacCannell's _The Tourist_ is an argument, not a study/i,
    );
  });
  it("names Boorstin as the rival and says the choice is a choice", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /It directly contradicts Boorstin, and the engine takes a side and says so/i,
    );
    expect(refs).toMatch(/a choice rather than a finding/i);
    expect(refs).toMatch(/the engine has not refuted it/i);
  });
  it("keeps Cohen's emergent authenticity as the counterweight", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /Cohen's emergent authenticity cuts against the twist and is kept for that reason/i,
    );
  });
  it("admits Wang could relocate the question entirely", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /the engine's whole apparatus is reading the wrong side of the transaction, and that possibility is live/i,
    );
  });
  it("refuses the reading that tourists are fools or tourism ruins places", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /tourists are fools, that hosts are deceiving anybody, or that tourism ruins places/i,
    );
  });
});

describe("tourism: the boundary with the guest and the back region", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The conversion of a stranger into a guest \(hospitality\)/);
    expect(refs).toMatch(/Front and back regions \(backstage, presentation, face\)/);
    expect(refs).toMatch(/Living from one's own values \(authenticity\)/);
    expect(refs).toMatch(
      /Incomers displacing residents \(gentrification, dereliction, neighborhood-cycle\)/,
    );
  });
  it("borrows Goffman's regions without restating them", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /Owned by the backstage engine; MacCannell borrows them and this engine uses the borrowing without restating the theory/i,
    );
  });
  it("names no guest, region, or heritage form among its members", () => {
    const foreign = ["guest", "stranger", "front_region", "back_region", "heritage"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("tourism: compose()", () => {
  // chains is keyed by true leaf only: the root and the four movement heads are
  // carried upward by whatever hangs below them.
  it("composes every form: root first, then the movement, then the form", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Tourism");
      expect(out.includes("## Initiated by")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_off_path.md"]).toEqual([
      ROOT,
      "process_seeking_tourism.md",
      "process_the_off_path.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_guidebook.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
