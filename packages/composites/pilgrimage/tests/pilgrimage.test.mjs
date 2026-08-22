import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_pilgrimage.md";
const BRIDGES = [
  "process_pilgrimage_arrival.md",
  "process_pilgrimage_custody.md",
  "process_pilgrimage_claim.md",
];

describe("pilgrimage: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("pilgrimage: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("pilgrimage");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe(ROOT);
  });

  it("hangs all three bridges off the pilgrimage root, in the order the custody moves", () => {
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
    // Advisory, not a hard gate: a persona can be visiting a sight, or holding a
    // burial right, without being in this arrangement at all.
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

describe("pilgrimage: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["grave", "tourism"]);
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.engine).toBe(name);
    }
  });

  it("wires atoms of two different shapes, both attached where the composite reads", () => {
    // The pairing is deliberately uneven: a process tree and a piece engine.
    expect(atoms.tourism.manifest.type).toBe("process");
    expect(atoms.grave.manifest.type).toBe("piece");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // The keystone runs between tourism's marker -- the reason anybody comes, which
  // is never anything intrinsic to the place -- and grave's next of kin, whose
  // powers are the thing the funding quietly buys. Losing either would leave the
  // custody bridge with no account of what transfers.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.tourism.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_the_marker.md", "process_the_account_home.md"]),
    );
    expect(atoms.grave.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["position_next_of_kin.md", "process_the_lapsing.md"]),
    );
  });

  // An engine can be in 0..n composites. This is the first to wire either atom;
  // if a second ever wires one, the boundary to keep straight is that this
  // composite owns neither -- only what they make when the visitors have the most
  // distant possible relation to the dead.
  it("is the only composite wiring tourism or grave so far", () => {
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
    expect(wiring("@chbrain/khai-engine-tourism")).toEqual(["pilgrimage"]);
    expect(wiring("@chbrain/khai-engine-grave")).toEqual(["pilgrimage"]);
    expect(flat("REFERENCES.md")).toMatch(/Both atoms are wired here for the first time/i);
    expect(flat("REFERENCES.md")).toMatch(/an engine can be in 0\.\.n composites/i);
  });
});

describe("pilgrimage: the joining is named, not assumed", () => {
  // THE CONNECTIVE-SOURCE RULE: a composite names an author and a work arguing
  // the joining itself, in the spine prose and as the leading Origin row.
  it("names Seaton as the joining in the spine and in the table", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/\*\*Seaton is the joining\.\*\*/);
    expect(refs).toMatch(/how far the visitor stands from the person who died/i);
    expect(refs).toMatch(/\*\*The joining\.\*\* Travel motivated by an encounter with death/);
  });
  it("states why the pairing is structural rather than convenient", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/the two meet on a single object/i);
    expect(refs).toMatch(
      /a visitor whose relationship to a place is an hour; grave supplies an object whose relationship to anybody is a chore/i,
    );
  });
});

describe("pilgrimage: the twist lives at the root", () => {
  it("the root's Echo names what the maintenance buys", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /the better a death is looked after, the less of it belongs to the people it happened to/i,
    );
    expect(echo).toMatch(/Nobody takes it\. It transfers with the invoice/i);
  });
  it("the claim bridge carries the same keystone", () => {
    expect(flat("process_pilgrimage_claim.md")).toMatch(
      /the better a death is looked after, the less of it belongs to the people it happened to/i,
    );
  });
  it("reads the composite on who decides rather than on who comes", () => {
    expect(flat(ROOT)).toMatch(/Pilgrimage is read on who decides, never on who comes/i);
  });
});

describe("pilgrimage: the three bridges", () => {
  it("adds attendance without adding maintenance", () => {
    expect(flat("process_pilgrimage_arrival.md")).toMatch(
      /The Arrival puts more people at the grave and no more hands on it/i,
    );
  });
  it("makes the rescue real before the loss", () => {
    const c = flat("process_pilgrimage_custody.md");
    expect(c).toMatch(/The Custody buys the object a future and prices it in decisions/i);
    expect(c).toMatch(/consultation is a different thing from standing/i);
  });
  it("leaves the family's version with no channel and nobody suppressing it", () => {
    expect(flat("process_pilgrimage_claim.md")).toMatch(
      /Nobody is suppressing it; there is simply no panel for it/i,
    );
  });
});

describe("pilgrimage: hard links reach both atoms by package name", () => {
  // A composite points at its atoms; it never copies their reading into itself.
  it("links tourism and grave members from inside the bridges", () => {
    const all = BRIDGES.concat(ROOT)
      .map((f) => flat(f))
      .join(" ");
    expect(all).toMatch(/@chbrain\/khai-engine-tourism\/process_the_marker\.md/);
    expect(all).toMatch(/@chbrain\/khai-engine-tourism\/process_the_account_home\.md/);
    expect(all).toMatch(/@chbrain\/khai-engine-grave\/position_next_of_kin\.md/);
    expect(all).toMatch(/@chbrain\/khai-engine-grave\/process_the_lapsing\.md/);
    expect(all).toMatch(/@chbrain\/khai-engine-grave\/piece_grave\.md/);
  });
  it("declares both atoms as dependencies", () => {
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    expect(Object.keys(pkg.dependencies).sort()).toEqual([
      "@chbrain/khai-arch",
      "@chbrain/khai-engine-grave",
      "@chbrain/khai-engine-tourism",
    ]);
  });
});

describe("pilgrimage: nobody has to be behaving badly", () => {
  it("refuses the ghoulish visitor and the ungrateful family", () => {
    expect(flat("process_pilgrimage_claim.md")).toMatch(
      /stages the visitors as ghouls has replaced the mechanism with a mob/i,
    );
    expect(flat("REFERENCES.md")).toMatch(
      /The visitors were sincere\. The trust was competent\. The family was grateful/,
    );
    expect(flat("playwright_instructions.md")).toMatch(/Do keep the visitors sincere/);
  });
});

describe("pilgrimage: what the composite refuses to over-claim", () => {
  it("inherits both atoms' stated weaknesses rather than hiding behind them", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/A composite cannot be firmer than the atoms it stands on/i);
    expect(refs).toMatch(/grave's records that it has no experimental base at all/i);
  });
  it("says the field is young, contested, and mostly conceptual", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /Dark tourism is a young and contested field, and it is mostly conceptual/i,
    );
  });
  it("admits it borrows across a gap in the kind of site studied", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /The literature's centre of gravity is a different kind of site from this composite's/i,
    );
    expect(refs).toMatch(/deliberately rather than accidentally/i);
  });
  it("names its most speculative bridge and the study that would settle it", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The Claim bridge is the composite's most speculative leg/i);
    expect(refs).toMatch(/does not appear to have been done/i);
  });
  it("refuses the reading that visitors are ghouls or families victims", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /visitors are ghouls, that trusts are appropriators, or that families are victims/i,
    );
  });
});

describe("pilgrimage: compose()", () => {
  it("composes every bridge: root first, then the bridge", () => {
    const leaves = Object.keys(chains);
    expect(leaves.sort()).toEqual([...BRIDGES].sort());
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Pilgrimage");
      expect(out.includes("## Lever")).toBe(true);
    }
  });
  it("gives a bridge a two-link chain: root, bridge", () => {
    expect(chains["process_pilgrimage_claim.md"]).toEqual([ROOT, "process_pilgrimage_claim.md"]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_pilgrimage_ticket.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
