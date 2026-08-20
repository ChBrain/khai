import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const FACES = ["position_first_face.md", "position_second_face.md", "position_third_face.md"];
const LEVERS = [
  "process_agenda_setting.md",
  "process_dimension_splitting.md",
  "process_scope_shifting.md",
  "process_coalition_building.md",
  "process_logrolling.md",
  "process_stalling.md",
  "process_rule_contest.md",
];
const FOOTINGS = [
  "position_veto_point.md",
  "position_broker_seat.md",
  "position_bloc_hold.md",
  "position_mandate_claim.md",
  "position_outsider_stand.md",
];

describe("politics: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("politics: manifest", () => {
  it("declares a process engine: one root over three faces, seven levers, and five footings", () => {
    expect(manifest.engine).toBe("politics");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(16);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_politics.md");
  });

  it("hangs every member off the root, flat, since the three altitudes are not nested", () => {
    const children = manifest.members.filter((m) => m.parent !== null);
    expect(children).toHaveLength(15);
    for (const m of children) expect(m.parent).toBe("process_politics.md");
    expect(children.map((m) => m.file)).toEqual([...FACES, ...LEVERS, ...FOOTINGS]);
  });

  // The member tree mixes types under a process root: the faces and footings are positions a
  // persona holds, the levers are processes they run. A consumer reading this tree must not
  // assume a single member type.
  it("mixes position and process members, with the levers process-typed", () => {
    const typeOf = (file) => manifest.members.find((m) => m.file === file).type;
    for (const f of [...FACES, ...FOOTINGS]) expect(typeOf(f), f).toBe("position");
    for (const l of LEVERS) expect(typeOf(l), l).toBe("process");
  });

  it("wires the law at fail and the cargo on persona at Projection, at fail as engines do", () => {
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

describe("politics: boundaries", () => {
  // Rule 7 is one phenomenon, one engine. Hirschman's triad belongs whole to the loyalty
  // engine, which carries exit and voice as its expressions, so politics must not restate
  // them -- it begins after a persona has decided to press rather than leave. This pins the
  // delegation the Restrictions section makes.
  it("leaves exit and voice with the loyalty engine, where Hirschman's triad lives", () => {
    const loyalty = JSON.parse(readFileSync(join(pkgDir, "..", "loyalty", "package.json"), "utf8"));
    expect(loyalty.khai.expressions).toEqual({
      exit: "position_exit.md",
      voice: "position_voice.md",
    });
    const files = manifest.members.map((m) => m.file);
    expect(files).not.toContain("position_exit.md");
    expect(files).not.toContain("position_voice.md");
  });

  // The power engine owns French & Raven's six bases -- what a persona can move others with.
  // Politics takes those as given and reads what they can do with them where a body decides,
  // so the bases are the resource and the levers are the play.
  it("leaves the bases of power with the power engine", () => {
    const power = JSON.parse(readFileSync(join(pkgDir, "..", "power", "package.json"), "utf8"));
    expect(Object.keys(power.khai.expressions).sort()).toEqual([
      "coercive",
      "expert",
      "informational",
      "legitimate",
      "referent",
      "reward",
    ]);
    expect(manifest.members.map((m) => m.file)).not.toContain("position_legitimate.md");
  });

  // The engine's twist is that a complete victory leaves nothing to see, which needs all
  // three faces present and ordered: a record, an absence, and nothing at all. Losing any of
  // them would leave the root's echo with no gradient to run down.
  it("keeps the three faces the twist runs down", () => {
    expect(manifest.members.map((m) => m.file)).toEqual(expect.arrayContaining(FACES));
  });

  // The outsider footing is the absence of the other four and carries exactly one lever. The
  // member hard-links scope-shifting by name, so that lever must exist for the footing to
  // have anything at all.
  it("keeps the one lever the outsider footing carries", () => {
    const outsider = readFileSync(join(pkgDir, "position_outsider_stand.md"), "utf8");
    expect(outsider).toContain("process_scope_shifting.md");
    expect(manifest.members.map((m) => m.file)).toContain("process_scope_shifting.md");
  });
});

describe("politics: compose()", () => {
  it("composes every member root-first, carrying the politics root", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().startsWith("# Process: Politics")).toBe(true);
    }
  });

  // The root is not itself a leaf: chains are keyed by leaf, and every one of the fifteen
  // members composes as [root, member]. So each face, lever, and footing arrives with the
  // whole root above it and nothing between.
  it("carries the root above each face, lever, and footing, and only those", () => {
    expect(Object.keys(chains).sort()).toEqual([...FACES, ...LEVERS, ...FOOTINGS].sort());
    for (const leaf of [...FACES, ...LEVERS, ...FOOTINGS]) {
      expect(chains[leaf], leaf).toEqual(["process_politics.md", leaf]);
      expect(compose({ leaf }).indexOf("# Process: Politics\n"), leaf).toBe(0);
    }
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
