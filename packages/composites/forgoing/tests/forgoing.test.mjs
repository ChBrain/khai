import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_forgoing.md";
const BRIDGES = [
  "process_forgoing_price.md",
  "process_forgoing_avoidance.md",
  "process_forgoing_undercount.md",
];

describe("forgoing: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("forgoing: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("forgoing");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe(ROOT);
  });

  it("hangs all three bridges off the forgoing root, in the order the price is paid", () => {
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
    // Advisory, not a hard gate: a persona can be in either atom -- carrying a
    // mark, or making a request -- without being in this arrangement at all, and
    // the audit surfaces where a play puts help in reach of somebody it would
    // classify and never says what that cost.
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

describe("forgoing: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["asking", "stigma"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  // The two atoms are shaped differently and that is the point of the pairing:
  // asking is a process tree with movement heads and forms, stigma is a piece
  // engine hanging a bearer and two processes flat beneath the mark.
  it("wires one process atom and one piece atom, both attached where the composite reads", () => {
    expect(atoms.asking.manifest.type).toBe("process");
    expect(atoms.stigma.manifest.type).toBe("piece");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // The keystone runs between asking's unmade request -- the term that closes
  // with no result and leaves no record -- and stigma's passing, which is what
  // the remaining visible cases have run out of. Losing either would leave the
  // undercount with no account of who is missing.
  it("keeps the two members the keystone runs between", () => {
    expect(atoms.asking.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_the_ask_unmade.md", "process_the_imposition.md"]),
    );
    expect(atoms.stigma.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_passing.md", "process_discrediting.md"]),
    );
  });

  // An engine can be in 0..n composites. This is the third to wire stigma:
  // membership reads the mark from the group's side, carrying reads what
  // concealing it costs, and this one reads the moment a request would disclose
  // it. Asking is wired here for the first time.
  it("is the third composite to wire stigma and the first to wire asking", () => {
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
    expect(wiring("@chbrain/khai-engine-stigma")).toEqual(["carrying", "forgoing", "membership"]);
    expect(wiring("@chbrain/khai-engine-asking")).toEqual(["forgoing"]);
    expect(flat("REFERENCES.md")).toMatch(/third composite to wire the stigma engine/i);
  });
});

describe("forgoing: the joining is named, not assumed", () => {
  // THE CONNECTIVE-SOURCE RULE: a composite names an author and a work arguing
  // the joining itself, in the spine prose and as the leading Origin row.
  it("names Corrigan as the joining in the spine and in the table", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/\*\*Corrigan is the joining\.\*\*/);
    expect(refs).toMatch(/a specific route he named \*\*label avoidance\*\*/);
    expect(refs).toMatch(/\*\*The joining\.\*\* Label avoidance/);
  });
  it("states the joining inside the root rather than only in the references", () => {
    const root = flat(ROOT);
    expect(root).toMatch(/This composite adds no third engine/i);
    expect(root).toMatch(/a request whose price is paid in identity rather than in imposition/i);
  });
});

describe("forgoing: the twist lives at the root", () => {
  it("the root's Echo names the loop", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(/the forgoing is what keeps the mark worth avoiding/i);
    expect(echo).toMatch(/consists entirely of people who did not come forward/i);
  });
  it("the undercount bridge carries the same keystone", () => {
    expect(flat("process_forgoing_undercount.md")).toMatch(
      /the forgoing is what keeps the mark worth avoiding/i,
    );
  });
  it("keeps the avoidance about the label rather than the service", () => {
    const a = flat("process_forgoing_avoidance.md");
    expect(a).toMatch(/A decision about a word, filed as a decision about a need/i);
    expect(a).toMatch(/leave the price exactly where it was/i);
  });
});

describe("forgoing: nobody has to be behaving badly", () => {
  it("keeps the help good and the staff decent", () => {
    expect(flat(ROOT)).toMatch(/are not gatekeeping anybody/i);
    expect(flat("REFERENCES.md")).toMatch(/The help is good\. The staff are decent/);
    expect(flat("playwright_instructions.md")).toMatch(/Do make the help good/);
  });
  it("keeps the persona's reason sound rather than obtuse", () => {
    expect(flat("process_forgoing_avoidance.md")).toMatch(/defensible, and sometimes true/i);
    expect(flat("playwright_instructions.md")).toMatch(
      /Do give the persona a defensible reason and let it stand/,
    );
  });
});

describe("forgoing: what the composite refuses to over-claim", () => {
  // One modest evidence leg, one uncomfortable counter-finding kept rather than
  // dropped, and a twist bridge named as an inference.
  it("bounds Clement's review to what it found", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/144 studies/);
    expect(refs).toMatch(/very nearly all cross-sectional, so the direction is not established/i);
  });
  it("refuses to claim stigma is the largest barrier", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /Stigma is not the largest barrier and the composite does not claim it is/i,
    );
    expect(refs).toMatch(/in several samples outrank stigma/i);
  });
  it("keeps the counter-finding that better beliefs did not reduce social distance", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /desired social distance did not, which means the mechanism is not simply what people believe/i,
    );
  });
  it("names its own twist bridge as an inference", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /The Undercount bridge is an inference, and it is the composite's least evidenced and most important claim/i,
    );
    expect(refs).toMatch(/nobody has measured the loop/i);
  });
  it("states that the evidence base is one field and the extension is thinner", () => {
    expect(flat("REFERENCES.md")).toMatch(/evidence base is overwhelmingly mental health/i);
  });
});

describe("forgoing: the boundary with its own atoms", () => {
  it("delegates both atoms whole and names carrying as the neighbour", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The mark itself \(stigma\)/);
    expect(refs).toMatch(/The request itself \(asking\)/);
    expect(refs).toMatch(/Holding a discrediting attribute \(carrying\)/);
    expect(refs).toMatch(/The provision itself \(the world\)/);
  });
  it("hard-links its atoms rather than restating them", () => {
    const root = readFileSync(join(pkgDir, ROOT), "utf8");
    expect(root).toMatch(/@chbrain\/khai-engine-stigma\/piece_stigma\.md/);
    expect(root).toMatch(/@chbrain\/khai-engine-asking\/process_asking\.md/);
    expect(readFileSync(join(pkgDir, "process_forgoing_undercount.md"), "utf8")).toMatch(
      /@chbrain\/khai-engine-asking\/process_the_ask_unmade\.md/,
    );
  });
});

describe("forgoing: compose()", () => {
  it("composes every bridge root-first, carrying the forgoing root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Forgoing")).toBe(true);
    }
  });

  it("carries the root above each bridge", () => {
    const out = compose({ leaf: "process_forgoing_undercount.md" });
    expect(out.indexOf("# Process: Forgoing\n")).toBeLessThan(
      out.indexOf("# Process: Forgoing, the Undercount"),
    );
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
