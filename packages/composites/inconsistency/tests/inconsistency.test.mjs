import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_inconsistency.md";
const BRIDGES = [
  "process_inconsistency_transit.md",
  "process_inconsistency_record.md",
  "process_inconsistency_verdict.md",
];

describe("inconsistency: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("inconsistency: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("inconsistency");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe(ROOT);
  });

  it("hangs all three bridges off the root, in the order the account travels", () => {
    const bridges = manifest.members.filter((m) => m.parent !== null).map((m) => m.file);
    expect(bridges).toEqual(BRIDGES);
    for (const m of manifest.members.filter((m) => m.parent !== null)) {
      expect(m.parent).toBe(ROOT);
    }
  });

  it("wires the law at fail and the cargo on persona at Projection, advisory (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    // Advisory, not a hard gate: a persona can be interpreted for, or be
    // disbelieved, without being in this arrangement at all.
    expect(manifest.requires).toContainEqual({
      on: "persona",
      section: "Projection",
      link: "expression",
      level: "audit",
    });
    const cargo = manifest.requires.filter((r) => r.on !== "instructions");
    expect(cargo.map((r) => r.on)).toEqual(["persona"]);
  });
});

describe("inconsistency: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["credibility", "interpreting"]);
    expect(atoms.interpreting.manifest.engine).toBe("interpreting");
    expect(atoms.credibility.manifest.engine).toBe("credibility");
  });

  it("wires two process trees, both attached where the composite reads", () => {
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.type, name).toBe("process");
      expect(Array.isArray(atom.manifest.members), name).toBe(true);
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // The keystone runs between interpreting's compression -- which drops hedges,
  // self-corrections, and colouring -- and credibility's manner, which is what a
  // hearer reads honesty from. Losing either would leave the transit bridge with
  // no account of why the two versions never matched.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.interpreting.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining([
        "process_the_compression.md",
        "process_the_voicing.md",
        "process_the_relaying.md",
        "process_the_finding.md",
      ]),
    );
    expect(atoms.credibility.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining([
        "process_the_manner.md",
        "process_the_corroboration.md",
        "process_discount_credibility.md",
        "process_the_deficit.md",
      ]),
    );
  });

  // An engine can be in 0..n composites. Interpreting is new here; credibility
  // is on its second, and the boundary between the two is stated.
  it("is the first composite wiring interpreting and the second wiring credibility", () => {
    const dir = join(pkgDir, "..");
    const wiring = (name) =>
      readdirSync(dir)
        .filter((c) => {
          try {
            const pkg = JSON.parse(readFileSync(join(dir, c, "package.json"), "utf8"));
            return name in (pkg.dependencies ?? {});
          } catch {
            return false;
          }
        })
        .sort();
    expect(wiring("@chbrain/khai-engine-interpreting")).toEqual(["inconsistency"]);
    expect(wiring("@chbrain/khai-engine-credibility")).toEqual(["inconsistency", "raising"]);
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/an engine can be in 0\.\.n composites/i);
    expect(refs).toMatch(
      /\*\*Interpreting is wired here for the first time\. Credibility is wired for the second\*\*/,
    );
    expect(refs).toMatch(/here the account is doubted for having changed/i);
  });
});

describe("inconsistency: the joining is named, not assumed", () => {
  // THE CONNECTIVE-SOURCE RULE: a composite names an author and a work arguing
  // the joining itself, in the spine prose and as the leading Origin row.
  it("names Maryns as the joining in the spine and in the table", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/\*\*Maryns is the joining\.\*\*/);
    expect(refs).toMatch(
      /Variation produced by the procedure's own machinery arrives at the decision as variation in the speaker/i,
    );
    expect(refs).toMatch(/\*\*The joining\.\*\* How a narrative is interpreted, transcribed/);
  });
  it("brings Blommaert in from the other side rather than as decoration", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /what a procedure reads as evasion, vagueness, or incoherence is frequently a person telling their story with the resources they have/i,
    );
  });
  it("states why the pairing is structural rather than convenient", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /what one engine says the channel drops is exactly what the other says the hearer reads/i,
    );
  });
});

describe("inconsistency: the twist lives at the root", () => {
  it("the root's Echo names the channel, the charge, and the absent witness", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /The channel makes the discrepancy and the teller is charged with it, because the only witness to the difference is the one nobody thinks was in the room/i,
    );
    expect(echo).toMatch(/an absence cannot testify to what it did/i);
  });
  it("the verdict bridge completes the same keystone", () => {
    expect(flat("process_inconsistency_verdict.md")).toMatch(
      /the discrepancy is the channel's and the charge is the persona's/i,
    );
  });
  it("reads the composite on the gap rather than on either telling", () => {
    expect(flat(ROOT)).toMatch(
      /Inconsistency is a test that measures the channel and reports on the person/i,
    );
  });
});

describe("inconsistency: the three bridges", () => {
  it("makes the transit strip exactly what the assessment reads", () => {
    const t = flat("process_inconsistency_transit.md");
    expect(t).toMatch(/The Transit removes the manner and delivers the content/i);
    expect(t).toMatch(
      /a frightened person and a composed liar arrive at the assessor's ear in the same register/i,
    );
  });
  it("makes the record the only version, uncheckable by construction", () => {
    const r = flat("process_inconsistency_record.md");
    expect(r).toMatch(/The Record makes the rendering permanent and the original unavailable/i);
    expect(r).toMatch(/the check and the thing being checked are the same object/i);
  });
  it("keeps the verdict a sound inference on an unsound observation", () => {
    const v = flat("process_inconsistency_verdict.md");
    expect(v).toMatch(/The Verdict is a fair test applied to a contaminated sample/i);
    expect(v).toMatch(/this is not prejudice and should not be staged as prejudice/i);
  });
});

describe("inconsistency: hard links reach both atoms by package name", () => {
  // A composite points at its atoms; it never copies their reading into itself.
  it("links interpreting and credibility members from inside the members", () => {
    const all = BRIDGES.concat(ROOT)
      .map((f) => flat(f))
      .join(" ");
    for (const link of [
      "@chbrain\\/khai-engine-interpreting\\/process_the_compression\\.md",
      "@chbrain\\/khai-engine-interpreting\\/process_the_voicing\\.md",
      "@chbrain\\/khai-engine-interpreting\\/process_the_relaying\\.md",
      "@chbrain\\/khai-engine-interpreting\\/process_the_finding\\.md",
      "@chbrain\\/khai-engine-credibility\\/process_the_manner\\.md",
      "@chbrain\\/khai-engine-credibility\\/process_the_corroboration\\.md",
      "@chbrain\\/khai-engine-credibility\\/process_discount_credibility\\.md",
      "@chbrain\\/khai-engine-credibility\\/process_the_deficit\\.md",
    ]) {
      expect(all).toMatch(new RegExp(link));
    }
  });
  it("declares both atoms as dependencies", () => {
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    expect(Object.keys(pkg.dependencies).sort()).toEqual([
      "@chbrain/khai-arch",
      "@chbrain/khai-engine-credibility",
      "@chbrain/khai-engine-interpreting",
    ]);
  });
});

describe("inconsistency: nobody has to be acting badly", () => {
  it("keeps the assessor reasonable and the interpreter competent", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The assessor is reasonable and is using the only instrument they have\. The interpreter is competent\./,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do keep the assessor sympathetic/);
  });
  it("refuses to settle whether the account was true", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The persona is telling the truth, or is not, and the composite never says which/i,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do close without resolving it/);
  });
});

describe("inconsistency: what the composite refuses to over-claim", () => {
  it("marks the joining as argued from one country's procedure", () => {
    expect(flat("REFERENCES.md")).toMatch(/The joining is argued from one country's procedure/i);
  });
  it("keeps consistency a good test rather than debunking it", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Consistency is a good test and the composite does not say otherwise/i);
    expect(refs).toMatch(
      /an assessor who ignored that would be failing the people with true accounts/i,
    );
  });
  it("names its own weakest joint: it cannot tell the two apart either", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The composite cannot tell a manufactured discrepancy from a real one/i);
    expect(refs).toMatch(
      /anybody who reads this as a method for identifying wrongly-decided cases has read it wrong/i,
    );
  });
  it("admits the two atoms are wired across a gap in the literature", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The two atoms are wired across a gap in the literature/i,
    );
  });
  it("refuses the reading that assessors are prejudiced", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /interpreted assessments are worthless, that assessors are prejudiced/i,
    );
  });
});

describe("inconsistency: the boundary with its neighbours", () => {
  it("delegates the neighbouring phenomena by name", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/Two frames misgrounding \(crosstalk, grounding, repair\)/);
    expect(refs).toMatch(/The doubted warner \(raising, warning\)/);
    expect(refs).toMatch(/The institution's record \(document, register, writ, legibility\)/);
  });
  it("names no member of its own beyond the root and the three bridges", () => {
    expect(manifest.members.map((m) => m.file)).toEqual([ROOT, ...BRIDGES]);
  });
});

describe("inconsistency: compose()", () => {
  it("keys chains by bridge only", () => {
    const leaves = Object.keys(chains);
    expect(leaves.sort()).toEqual([...BRIDGES].sort());
    expect(leaves).not.toContain(ROOT);
  });
  it("composes every bridge root first", () => {
    for (const leaf of BRIDGES) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Inconsistency");
      expect(out.includes("## Lever")).toBe(true);
    }
  });
  it("gives a bridge a two-link chain: root, bridge", () => {
    expect(chains["process_inconsistency_verdict.md"]).toEqual([
      ROOT,
      "process_inconsistency_verdict.md",
    ]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_inconsistency_appeal.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
