import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_raising.md";
const BRIDGES = [
  "process_raising_standing.md",
  "process_raising_substitution.md",
  "process_raising_proportion.md",
];

describe("raising: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("raising: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("raising");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe(ROOT);
  });

  it("hangs all three bridges off the raising root, in the order the scrutiny moves", () => {
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
    // Advisory, not a hard gate: a persona can be issuing a warning, or having an
    // account discounted, without being in this arrangement at all.
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

describe("raising: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["credibility", "warning"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires two process atoms, both attached where the composite reads", () => {
    expect(atoms.warning.manifest.type).toBe("process");
    expect(atoms.credibility.manifest.type).toBe("process");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // The keystone runs between warning's threshold -- a setting somebody chose that
  // decides which error the system makes -- and credibility's deficit, which turns
  // that setting into a property of the speaker. Losing either would leave the
  // standing bridge with no account of why the earliest warnings are quietest.
  it("keeps the two members the keystone runs between", () => {
    expect(atoms.warning.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_the_threshold_set.md", "process_the_averted.md"]),
    );
    expect(atoms.credibility.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_the_deficit.md", "process_the_corroboration.md"]),
    );
  });

  // An engine can be in 0..n composites. This is the first to wire either atom;
  // if a second ever wires one, the boundary to keep straight is that this
  // composite owns neither -- only what they make when the claim is about a harm
  // that has not happened.
  it("is the only composite wiring warning or credibility so far", () => {
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
    expect(wiring("@chbrain/khai-engine-warning")).toEqual(["raising"]);
    expect(wiring("@chbrain/khai-engine-credibility")).toEqual(["raising"]);
    expect(flat("REFERENCES.md")).toMatch(/Both atoms are wired here for the first time/i);
  });
});

describe("raising: the joining is named, not assumed", () => {
  // THE CONNECTIVE-SOURCE RULE: a composite names an author and a work arguing
  // the joining itself, in the spine prose and as the leading Origin row.
  it("names Alford as the joining in the spine and in the table", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/\*\*Alford is the joining\.\*\*/);
    expect(refs).toMatch(/the substance of the claim is characteristically never addressed/i);
    expect(refs).toMatch(/\*\*The joining\.\*\* The substance of the claim/);
  });
  it("states why the pairing is structural rather than convenient", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/carries both atoms' difficulties simultaneously/i);
    expect(refs).toMatch(/It cannot be corroborated, because there is nothing yet to corroborate/i);
  });
});

describe("raising: the twist lives at the root", () => {
  it("the root's Echo names the scrutiny scaling with the implication", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /the more expensive a warning would be to act on, the more thoroughly the warner is examined instead/i,
    );
    expect(echo).toMatch(/Doubt has to go somewhere and it goes where it costs least/i);
  });
  it("the proportion bridge carries the same keystone", () => {
    expect(flat("process_raising_proportion.md")).toMatch(
      /the more expensive a warning would be to act on, the more thoroughly the warner is examined instead/i,
    );
  });
  it("makes the standing quietest where the hazard is first visible", () => {
    expect(flat("process_raising_standing.md")).toMatch(
      /The Standing sets the alarm quietest where the hazard is first visible/i,
    );
  });
  it("makes the substitution undetectable to the people inside it", () => {
    expect(flat("process_raising_substitution.md")).toMatch(
      /a question about the speaker looks exactly like rigour/i,
    );
  });
});

describe("raising: nobody has to be concealing anything", () => {
  it("keeps the receiver conscientious and the search for a reason legitimate", () => {
    expect(flat(ROOT)).toMatch(
      /a search for a reason not to act, conducted by people who would be right to want one/i,
    );
    expect(flat("REFERENCES.md")).toMatch(
      /The receiver is conscientious\. The warning is right\. Nobody is retaliating/,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do not stage a cover-up/);
  });
  it("refuses the conspiracy and the courtroom", () => {
    const p = flat("process_raising_proportion.md");
    expect(p).toMatch(/covering something up has replaced the mechanism with a conspiracy/i);
    expect(p).toMatch(/vindicated at the end has replaced it with a courtroom/i);
    expect(flat("playwright_instructions.md")).toMatch(/Do not close on vindication/);
  });
});

describe("raising: what the composite refuses to over-claim", () => {
  it("names Alford's sample as the tail rather than the distribution", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/interview-based and selected in a way that matters/i);
    expect(refs).toMatch(/an account of the tail rather than of the distribution/i);
  });
  it("names its own twist as an unmeasured inference", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The twist is an inference and has not been measured/i);
    expect(refs).toMatch(/it is not obvious how a study would get a comparable measure/i);
  });
  // The sharpest concession: the composite's own evidence base is selected on
  // disasters that happened, which is the exact bias its parent engine describes.
  it("turns the warning engine's own critique onto its own case literature", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /The case literature has the same defect the warning engine describes, applied to itself/i,
    );
    expect(flat("REFERENCES.md")).toMatch(
      /reasoning from exactly the biased sample its own parent engine warns against/i,
    );
  });
  it("refuses the reading that receivers are covering up or warners usually right", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /that receivers are covering things up, that people who raise concerns are usually right/i,
    );
  });
});

describe("raising: the boundary with its own atoms", () => {
  it("delegates both atoms whole and names the neighbours", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The signal itself \(warning\)/);
    expect(refs).toMatch(/The account itself \(credibility\)/);
    expect(refs).toMatch(/The tolerated exception becoming the norm \(drift\)/);
    expect(refs).toMatch(/Leaving instead of speaking up \(loyalty, politics, membership\)/);
  });
  it("explains why procedural fairness does not correct it", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /A scrupulously fair procedure is exactly what the Substitution runs inside/i,
    );
  });
  it("hard-links its atoms rather than restating them", () => {
    const root = readFileSync(join(pkgDir, ROOT), "utf8");
    expect(root).toMatch(/@chbrain\/khai-engine-warning\/process_warning\.md/);
    expect(root).toMatch(/@chbrain\/khai-engine-credibility\/process_credibility\.md/);
    expect(readFileSync(join(pkgDir, "process_raising_standing.md"), "utf8")).toMatch(
      /@chbrain\/khai-engine-warning\/process_the_threshold_set\.md/,
    );
  });
});

describe("raising: compose()", () => {
  it("composes every bridge root-first, carrying the raising root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Raising")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_raising_proportion.md" });
    expect(out.indexOf("# Process: Raising\n")).toBeLessThan(
      out.indexOf("# Process: Raising, the Proportion"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
