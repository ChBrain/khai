// The interpreting engine tests only what is interpreting-specific: that the
// package conforms to the canon through the shared conformance kit
// (@chbrain/khai-tests), its manifest contract, the process-tree shape, the
// twist and where it is carried, and its compose() behavior.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_interpreting.md";
const MOVEMENTS = [
  "process_the_summoning.md",
  "process_the_relaying.md",
  "process_the_coordinating.md",
  "process_the_invisibility.md",
];

describe("interpreting: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("interpreting: manifest", () => {
  it("declares a process engine anchored on the triadic conversation", () => {
    expect(manifest.engine).toBe("interpreting");
    expect(manifest.type).toBe("process");
    const roots = manifest.members.filter((m) => m.parent === null);
    expect(roots).toHaveLength(1);
    expect(roots[0].file).toBe(ROOT);
  });
  it("hangs exactly four movements beneath the root", () => {
    const heads = manifest.members.filter((m) => m.parent === ROOT).map((m) => m.file);
    expect(heads.sort()).toEqual([...MOVEMENTS].sort());
  });
  it("gives each movement exactly three forms", () => {
    for (const head of MOVEMENTS) {
      expect(manifest.members.filter((m) => m.parent === head)).toHaveLength(3);
    }
    expect(manifest.members).toHaveLength(17);
  });
  it("keeps the tree exactly two deep", () => {
    const heads = new Set([ROOT, ...MOVEMENTS]);
    for (const m of manifest.members) {
      if (m.parent !== null) expect(heads.has(m.parent)).toBe(true);
    }
  });
  it("wires the law and a persona at Projection", () => {
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

describe("interpreting: the twist lives in the root's Echo", () => {
  // What the role forbids is what makes the exchange run.
  it("names the requirement and the addition in one sentence", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /The room requires the interpreter to add nothing, and what they add is the only reason the conversation runs/i,
    );
  });
  it("says the additions are decisions rather than lapses", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/Those decisions are the conversation/i);
    expect(echo).toMatch(/the first thing denied when anybody asks what happened/i);
  });
  it("is carried by the coordinating, not by the relaying", () => {
    expect(flat("process_the_coordinating.md")).toMatch(
      /The Coordinating is the work, and the role is defined as its absence/i,
    );
    expect(flat("process_the_relaying.md")).not.toMatch(/the engine's twist/i);
  });
});

describe("interpreting: the third person is the whole point", () => {
  it("states that the room describes a triad as a dyad", () => {
    const r = flat(ROOT);
    expect(r).toMatch(
      /the conversation has three people in it and is described, by everybody present, as having two/i,
    );
  });
  it("makes success depend on both parties forgetting the arrangement", () => {
    expect(flat(ROOT)).toMatch(
      /succeeds exactly to the extent that both parties forget the arrangement/i,
    );
  });
});

describe("interpreting: the summoning sets terms the interpreter did not negotiate", () => {
  it("marks the party who needed the interpreter", () => {
    expect(flat("process_the_summoning.md")).toMatch(
      /brings in the person the conversation needs and marks the party who needed them/i,
    );
  });
  it("keeps the professional booking on the institution's terms", () => {
    expect(flat("process_the_booking.md")).toMatch(
      /The Booking is neutrality supplied on the terms of one side/i,
    );
  });
  it("puts the pressed interpreter inside the situation being interpreted", () => {
    const p = flat("process_the_pressing.md");
    expect(p).toMatch(/an interpreter who is inside the situation being interpreted/i);
    expect(p).toMatch(/somebody inside it who cannot leave afterwards/i);
  });
  it("reads the waiver as a claim about a self rather than about language", () => {
    const w = flat("process_the_waiver.md");
    expect(w).toMatch(/The waiver is rarely about language/i);
    expect(w).toMatch(/The Waiver protects a self at the cost of the conditional clause/i);
  });
});

describe("interpreting: the relaying cannot be audited by anybody present", () => {
  it("says neither party can check the rendering", () => {
    expect(flat("process_the_relaying.md")).toMatch(
      /The Relaying produces an utterance nobody in the room can check/i,
    );
  });
  it("makes compression systematic rather than random", () => {
    const c = flat("process_the_compression.md");
    expect(c).toMatch(/the losses are systematic rather than random/i);
    expect(c).toMatch(
      /The Compression keeps the content and drops the evidence of how it was said/i,
    );
  });
  it("reads first-person voicing as manufacturing the absence", () => {
    const v = flat("process_the_voicing.md");
    expect(v).toMatch(/The Voicing lends a pronoun and takes a presence/i);
    expect(v).toMatch(/the invisibility being manufactured sentence by sentence/i);
  });
  it("leaves the untranslatable undecided by any rule", () => {
    expect(flat("process_the_untranslatable.md")).toMatch(/There is no rule that decides this/i);
  });
});

describe("interpreting: the coordinating is the work and is not counted", () => {
  it("makes competent coordination disappear", () => {
    expect(flat("process_the_coordinating.md")).toMatch(
      /the more competently it is done the more completely it disappears/i,
    );
  });
  it("reads turn holding as authority nobody would call authority", () => {
    expect(flat("process_the_turn_holding.md")).toMatch(
      /The Turn Holding is traffic control described as punctuation/i,
    );
  });
  it("makes every side check exclude somebody, in both directions", () => {
    expect(flat("process_the_side_talk.md")).toMatch(
      /The Side Talk buys accuracy with exclusion, every time, in both directions/i,
    );
  });
  it("attributes the pacing to the wrong people", () => {
    expect(flat("process_the_pacing.md")).toMatch(
      /The Pacing shapes how both parties come across and is credited to neither/i,
    );
  });
});

describe("interpreting: the invisibility is a good rule, and that is the problem", () => {
  it("keeps the conduit norm's protection rather than dismissing it", () => {
    const n = flat("process_the_conduit_norm.md");
    expect(n).toMatch(/The Conduit Norm is a good rule that describes a job nobody has/i);
    expect(n).toMatch(/the alternatives are worse/i);
  });
  it("lands the room's errors at the only auditable address", () => {
    expect(flat("process_the_finding.md")).toMatch(
      /The Finding collects the room's errors at the only address that has one/i,
    );
  });
  it("leaves the whole conversation with the person who was not there", () => {
    expect(flat("process_the_retention.md")).toMatch(
      /leaves the whole conversation with the person the room agreed was not in it/i,
    );
  });
});

describe("interpreting: nobody has to be failing at their job", () => {
  it("keeps every participant competent and reasonable", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The interpreter is skilled\. The official is not obstructive\. The party who waived was making a reasonable decision about themselves\./,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do make the interpreter good/);
  });
});

describe("interpreting: what the engine refuses to over-claim", () => {
  it("marks the founding finding as close work on a small corpus", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Wadensjö's finding is close observation of a small corpus/i);
    expect(refs).toMatch(/an order of magnitude rather than a measured constant/i);
  });
  it("keeps the innocent reading of the self-report gap", () => {
    expect(flat("REFERENCES.md")).toMatch(/the second reading is at least as likely as the first/i);
  });
  it("admits the evidence base is institutional and Western", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The engine's evidence base is institutional and Western/i);
    expect(refs).toMatch(/signed language interpreting/i);
  });
  it("flags the finding as the engine's own extension", () => {
    expect(flat("REFERENCES.md")).toMatch(/The finding is the engine's own extension/i);
  });
  it("says which well-known finding was deliberately left out, and why", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/One well-known finding is deliberately not the engine's spine/i);
    expect(refs).toMatch(/the engine's claim is about position rather than skill/i);
  });
  it("refuses the reading that interpreters are secretly steering", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /interpreters are secretly steering conversations, that the conduit norm is a fiction to be discarded/i,
    );
  });
});

describe("interpreting: the boundary with the dyadic talk engines", () => {
  it("names the dyads it is not, from inside the root", () => {
    const r = flat(ROOT);
    for (const d of ["grounding", "repair", "accommodation", "register"]) {
      expect(r).toMatch(new RegExp(d, "i"));
    }
  });
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The dyad's own machinery \(grounding, repair, accommodation\)/);
    expect(refs).toMatch(/Varieties and the moving between them \(register, legibility\)/);
    expect(refs).toMatch(/What the interpreter carries away \(compassion, upkeep, vigil\)/);
  });
  it("names no grounding, repair, or register member of its own", () => {
    const foreign = ["grounding", "repair", "accommodation", "register", "implicature"];
    const files = manifest.members.map((m) => m.file);
    for (const f of foreign) expect(files.some((x) => x.includes(f))).toBe(false);
  });
});

describe("interpreting: compose()", () => {
  // A process tree composes root, movement, form -- deepest last.
  it("keys chains by true leaf only", () => {
    const leaves = Object.keys(chains);
    expect(leaves.length).toBe(manifest.members.length - 1 - MOVEMENTS.length);
    expect(leaves).not.toContain(ROOT);
    for (const head of MOVEMENTS) expect(leaves).not.toContain(head);
  });
  it("composes every form root first", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Interpreting");
      expect(out.includes("## Lever")).toBe(true);
    }
  });
  it("gives a form a three-link chain: root, movement, form", () => {
    expect(chains["process_the_side_talk.md"]).toEqual([
      ROOT,
      "process_the_coordinating.md",
      "process_the_side_talk.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_the_whispering.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
