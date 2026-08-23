import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flat = (file) => readFileSync(join(pkgDir, file), "utf8").replace(/\s+/g, " ");

const ROOT = "process_interval.md";
const BRIDGES = [
  "process_interval_vacancy.md",
  "process_interval_furnishing.md",
  "process_interval_defence.md",
];

describe("interval: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("interval: manifest", () => {
  it("declares a process composite: a process root over three bridges", () => {
    expect(manifest.engine).toBe("interval");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
    expect(manifest.members.find((m) => m.parent === null).file).toBe(ROOT);
  });

  it("hangs all three bridges off the interval root, in the order the hour is made", () => {
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
    // Advisory, not a hard gate: a persona can have a commute, or stand in a
    // concourse, without being in this arrangement at all.
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

describe("interval: atoms", () => {
  it("re-exports the two engines it wires, each a loaded engine", () => {
    expect(Object.keys(atoms).sort()).toEqual(["commute", "nonPlace"]);
    expect(atoms.commute.manifest.engine).toBe("commute");
    expect(atoms.nonPlace.manifest.engine).toBe("non-place");
  });

  it("wires a process tree and a place engine, both attached where the composite reads", () => {
    // The two atoms have different manifest shapes: commute declares members,
    // non-place declares an anchor and expressions with its own compose().
    expect(atoms.commute.manifest.type).toBe("process");
    expect(atoms.nonPlace.manifest.type).toBe("place");
    expect(Array.isArray(atoms.commute.manifest.members)).toBe(true);
    expect(atoms.nonPlace.manifest.members).toBeUndefined();
    expect(atoms.nonPlace.manifest.anchor).toBe("place_non_place.md");
    for (const [name, atom] of Object.entries(atoms)) {
      expect(atom.manifest.requires, name).toContainEqual({
        on: "persona",
        section: "Projection",
        link: "expression",
        level: "fail",
      });
    }
  });

  // The keystone runs between commute's hollow hour -- unpaid, unchosen, and
  // not rest -- and non-place's solitude, which supplies the room that asks
  // nothing. Losing either would leave the defence bridge with no account of
  // what is being defended.
  it("keeps the members the keystone runs between", () => {
    expect(atoms.commute.manifest.members.map((m) => m.file)).toEqual(
      expect.arrayContaining(["process_the_hollow_hour.md", "process_ledger_commute.md"]),
    );
    expect(Object.values(atoms.nonPlace.manifest.expressions)).toEqual(
      expect.arrayContaining(["place_transit.md", "place_solitude.md"]),
    );
  });

  // An engine can be in 0..n composites. This is the first to wire either atom.
  it("is the only composite wiring commute or non-place so far", () => {
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
    expect(wiring("@chbrain/khai-engine-commute")).toEqual(["interval"]);
    expect(wiring("@chbrain/khai-engine-non-place")).toEqual(["interval"]);
    expect(flat("REFERENCES.md")).toMatch(/Both atoms are wired here for the first time/i);
    expect(flat("REFERENCES.md")).toMatch(/an engine can be in 0\.\.n composites/i);
  });
});

describe("interval: the joining is named, not assumed", () => {
  // THE CONNECTIVE-SOURCE RULE: a composite names an author and a work arguing
  // the joining itself, in the spine prose and as the leading Origin row.
  it("names Lyons and Urry as the joining in the spine and in the table", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/\*\*Lyons and Urry are the joining\.\*\*/);
    expect(refs).toMatch(/the mobilities finding is that the hour is nevertheless full/i);
    expect(refs).toMatch(/\*\*The joining\.\*\* Travel time is not a pure cost/);
  });
  it("states why the pairing is structural rather than convenient", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(
      /the two engines supply the same hour from opposite ends -- one a duration with no owner, the other a room with no memory/i,
    );
  });
});

describe("interval: the twist lives at the root", () => {
  it("the root's Echo names the unchosen hour and the defence", () => {
    const echo = flat(ROOT).split("## Echo")[1];
    expect(echo).toMatch(
      /the hour a persona never chose becomes the only one nobody can claim, and defending it is what keeps them making the journey/i,
    );
    expect(echo).toMatch(/the defence is an argument for the arrangement that produced it/i);
  });
  it("the defence bridge carries the same keystone", () => {
    expect(flat("process_interval_defence.md")).toMatch(
      /the hour a persona never chose becomes the only one nobody can claim, and defending it is what keeps them making the journey/i,
    );
  });
  it("reads the composite on what the hour is for rather than what it costs", () => {
    expect(flat(ROOT)).toMatch(/Interval is read on what the hour is for, never on what it costs/i);
  });
});

describe("interval: the three bridges", () => {
  it("makes the vacancy a residue rather than a grant", () => {
    expect(flat("process_interval_vacancy.md")).toMatch(
      /The Vacancy is unowned because it was left over/i,
    );
  });
  it("keeps the furnishing real, excellent, and portable", () => {
    const f = flat("process_interval_furnishing.md");
    expect(f).toMatch(
      /The Furnishing is entirely brought and is credited to the place it was brought to/i,
    );
    expect(f).toMatch(/nothing in the furnishing argues for the room/i);
  });
  it("keeps the defence true and load-bearing for the wrong thing", () => {
    const d = flat("process_interval_defence.md");
    expect(d).toMatch(/What the persona says is true/i);
    expect(d).toMatch(/it is still being felt/i);
  });
});

describe("interval: hard links reach both atoms by package name", () => {
  // A composite points at its atoms; it never copies their reading into itself.
  it("links commute and non-place members from inside the members", () => {
    const all = BRIDGES.concat(ROOT)
      .map((f) => flat(f))
      .join(" ");
    expect(all).toMatch(/@chbrain\/khai-engine-commute\/process_the_hollow_hour\.md/);
    expect(all).toMatch(/@chbrain\/khai-engine-commute\/process_ledger_commute\.md/);
    expect(all).toMatch(/@chbrain\/khai-engine-non-place\/place_transit\.md/);
    expect(all).toMatch(/@chbrain\/khai-engine-non-place\/place_solitude\.md/);
  });
  it("declares both atoms as dependencies", () => {
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    expect(Object.keys(pkg.dependencies).sort()).toEqual([
      "@chbrain/khai-arch",
      "@chbrain/khai-engine-commute",
      "@chbrain/khai-engine-non-place",
    ]);
  });
});

describe("interval: nobody has to be deceiving themselves", () => {
  it("refuses the delusion reading and the trapped reading", () => {
    expect(flat("process_interval_defence.md")).toMatch(
      /stages the defence as self-deception has replaced the mechanism with a delusion/i,
    );
    expect(flat("REFERENCES.md")).toMatch(/The persona is right about what they would lose\./);
    expect(flat("playwright_instructions.md")).toMatch(/Do make the answer true/);
  });
});

describe("interval: what the composite refuses to over-claim", () => {
  it("inherits both atoms' stated weaknesses", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/A composite cannot be firmer than its atoms/i);
    expect(refs).toMatch(/Everything here inherits both/i);
  });
  it("names the firm leg and then bounds what it supports", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The travel-time-use finding is the firmest thing in this composite/i);
    expect(refs).toMatch(
      /What that finding supports is narrower than what this composite does with it/i,
    );
  });
  it("admits the two atoms sit in tension and does not resolve it", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The two atoms sit in tension and the composite does not resolve it/i);
    expect(refs).toMatch(/the field itself has not settled how the two results fit together/i);
  });
  it("bounds the composite to the setting its atoms come from", () => {
    const refs = flat("REFERENCES.md");
    expect(refs).toMatch(/The composite is written from the same narrow setting as its atoms/i);
    expect(refs).toMatch(/a vacancy and no furnishing at all/i);
  });
  it("refuses the reading that people who enjoy commuting are deluded", () => {
    expect(flat("REFERENCES.md")).toMatch(
      /people who enjoy their commutes are deluded, that the enjoyment is a coping mechanism/i,
    );
  });
});

describe("interval: compose()", () => {
  it("composes every bridge: root first, then the bridge", () => {
    const leaves = Object.keys(chains);
    expect(leaves.sort()).toEqual([...BRIDGES].sort());
    for (const leaf of leaves) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Interval");
      expect(out.includes("## Lever")).toBe(true);
    }
  });
  it("gives a bridge a two-link chain: root, bridge", () => {
    expect(chains["process_interval_defence.md"]).toEqual([ROOT, "process_interval_defence.md"]);
  });
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_interval_platform.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
