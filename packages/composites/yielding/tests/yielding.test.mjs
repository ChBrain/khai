import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_yielding.md";
const BRIDGES = [
  "process_yielding_glance.md",
  "process_yielding_reach.md",
  "process_yielding_denial.md",
];

describe("yielding: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("yielding: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("yielding");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe(ROOT);
  });

  it("hangs all three bridges off the yielding root, in the order the encounter runs", () => {
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
    // Advisory, not a hard gate: a persona can wear a uniform, or comply with an
    // instruction, without being in this arrangement at all.
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

describe("yielding: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["obedience", "uniform"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires atoms of two different shapes, both attached where the composite reads", () => {
    // A piece engine and a small process tree, looking at opposite sides of one
    // encounter.
    expect(atoms.uniform.manifest.type).toBe("piece");
    expect(atoms.obedience.manifest.type).toBe("process");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // The keystone runs between uniform's wearer -- who holds an authority nobody
  // granted them personally, narrow and real -- and the fact that a stranger
  // responds to the garment before consulting any of that. Losing the wearer
  // would leave the reach bridge with no account of where the warrant ends.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.uniform.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["piece_uniform.md", "position_the_wearer.md"]),
    );
    expect(atoms.obedience.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_obedience.md"]),
    );
  });

  // An engine can be in 0..n composites. Obedience is wired here for the second
  // time -- subjection already wires it -- and the two questions are far apart:
  // subjection asks what a lifetime inside institutions makes of a self, this
  // asks what four hundred milliseconds on a pavement makes of a stranger.
  it("records uniform's first wiring and obedience's second", () => {
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
    expect(wiring("@chbrain/khai-engine-uniform")).toEqual(["yielding"]);
    expect(wiring("@chbrain/khai-engine-obedience")).toEqual(["subjection", "yielding"]);
    expect(flat("REFERENCES.md")).toMatch(/an engine can\s*be in 0\.\.n composites/i);
    expect(flat("REFERENCES.md")).toMatch(
      /Subjection asks what a lifetime inside institutions makes of a self/i,
    );
  });
});

describe("yielding: the joining is named, not assumed", () => {
  // THE CONNECTIVE-SOURCE RULE: a composite names an author and a work arguing
  // the joining itself, in the spine prose and as the leading Origin row.
  it("names Bickman as the joining in the spine and in the table", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/\*\*Bickman is the joining\.\*\*/);
    expect(refs).toMatch(/nobody was being watched, and they complied anyway/i);
    expect(refs).toMatch(
      /\*\*The joining\.\*\* Arbitrary street requests obeyed at roughly double/,
    );
  });
  it("states why the pairing is structural rather than convenient", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/the two engines look at opposite sides of the same encounter/i);
    expect(refs).toMatch(/this composite reads the half-second in which they meet/i);
  });
});

describe("yielding: the twist lives at the root", () => {
  it("the root's Echo holds both halves at once", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /the insignia is obeyed by people who correctly believe it has no authority over them/i,
    );
    expect(echo).toMatch(/a response that runs before any belief about authority is consulted/i);
  });
  it("the denial bridge carries the same keystone", () => {
    expect(flat("process_yielding_denial.md")).toMatch(
      /the insignia is obeyed by people who correctly believe it has no authority over them/i,
    );
  });
  it("reads the composite on what was asked rather than on who asked", () => {
    expect(flat(ROOT)).toMatch(/Yielding is read on what was asked, never on who asked/i);
  });
});

describe("yielding: the three bridges", () => {
  it("grants the office before establishing there is one", () => {
    const g = flat("process_yielding_glance.md");
    expect(g).toMatch(/The Glance grants the office before establishing there is one/i);
    expect(g).toMatch(/walked off before it could be carried out/i);
  });
  it("makes the compliance widest where the warrant is narrowest", () => {
    expect(flat("process_yielding_reach.md")).toMatch(
      /The Reach is granted widest where the warrant is narrowest/i,
    );
  });
  it("keeps the account sincere and partly correct", () => {
    const d = flat("process_yielding_denial.md");
    expect(d).toMatch(/They are not being defensive and they are not covering anything/i);
    expect(d).toMatch(/the account is partly correct, which is what makes it durable/i);
  });
});

describe("yielding: hard links reach both atoms by package name", () => {
  // A composite points at its atoms; it never copies their reading into itself.
  it("links uniform and obedience members from inside the members", () => {
    const all = BRIDGES.concat(ROOT)
      .map((f) => flat(f))
      .join(" ");
    expect(all).toMatch(/@chbrain\/khai-engine-uniform\/piece_uniform\.md/);
    expect(all).toMatch(/@chbrain\/khai-engine-uniform\/position_the_wearer\.md/);
    expect(all).toMatch(/@chbrain\/khai-engine-obedience\/process_obedience\.md/);
  });
  it("declares both atoms as dependencies", () => {
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    expect(Object.keys(pkg.dependencies).sort()).toEqual([
      "@chbrain/khai-arch",
      "@chbrain/khai-engine-obedience",
      "@chbrain/khai-engine-uniform",
    ]);
  });
});

describe("yielding: nobody has to be deceiving anybody", () => {
  it("refuses the impostor and the dupe", () => {
    expect(flat("process_yielding_denial.md")).toMatch(
      /stages the requester as an impostor has replaced the mechanism with a swindle/i,
    );
    expect(flat("REFERENCES.md")).toMatch(
      /The requester held the office\. The request was ordinary\. The complier was sensible/,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do keep the requester legitimate/);
  });
});

describe("yielding: what the composite refuses to over-claim", () => {
  it("names the strength of the evidence and its quantity in the same breath", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The core finding is behavioural, in the field, on real strangers/i);
    expect(refs).toMatch(/There is not very much of it and it is old/i);
    expect(refs).toMatch(/as an order of magnitude rather than a coefficient/i);
  });
  it("keeps the denial bridge's borrowing narrow", () => {
    expect(flat("REFERENCES.md")).toMatch(/The Denial bridge borrows a general claim/i);
  });
  it("leaves out the famous nurses study on purpose and says so", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/One famous uniform-adjacent study is deliberately left out/i);
    expect(refs).toMatch(/its absence is a choice rather than an oversight/i);
  });
  it("declines to adjudicate the Milgram debate and says why it need not", () => {
    expect(flat("REFERENCES.md")).toMatch(/The composite does not adjudicate the Milgram debate/i);
  });
  it("refuses the reading that people are dupes or the deference irrational", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /people are dupes, that uniformed staff are exploiting anybody, or that the deference is irrational/i,
    );
  });
});

describe("yielding: compose()", () => {
  it("composes every bridge: root first, then the bridge", () => {
    const leaves = Object.keys(chains);
    expect(leaves.sort()).toEqual([...BRIDGES].sort());
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Yielding");
      expect(out.includes("## Lever")).toBe(true);
    }
  });
  it("gives a bridge a two-link chain: root, bridge", () => {
    expect(chains["process_yielding_denial.md"]).toEqual([ROOT, "process_yielding_denial.md"]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_yielding_badge.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
