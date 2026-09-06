// The dissociation engine tests what an atom owns: canon conformance through the
// shared kit, the manifest contract, and compose(). No atoms block -- dissociation
// declares no engine dependencies, which is the point of an atom.
//
// Rule 3's second PR for #1544, dormant until it lands. The sentinel asks the DISK
// for index.mjs, not a hardcoded flag: a flag satisfies the untested-packages wall
// while testing nothing and never switches itself on. The import is dynamic
// because a static one throws at link time, before skipIf can spare it.

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const DORMANT = !existsSync(join(pkgDir, "index.mjs"));
let manifest, compose, chains, raw;
beforeAll(async () => {
  if (DORMANT) return;
  ({ manifest, compose, chains, raw } = await import("../index.mjs"));
});

const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const MOVEMENTS = [
  "process_amnesic_barrier.md",
  "process_depersonalization.md",
  "process_structural_split.md",
];

// The four the engine says it is not. `the-unconscious` is the load-bearing one:
// it is the OPPOSITE mechanism (material pushed down by one unified mind, against
// pieces that never arrive together), and confusing the two is the single most
// likely misreading of this engine.
const DELEGATES = ["`the-unconscious`", "`ptsd`", "`defense`", "`absorption`"];

describe.skipIf(DORMANT)("dissociation: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe.skipIf(DORMANT)("dissociation: manifest", () => {
  it("declares a process root over three movements", () => {
    expect(manifest.engine).toBe("dissociation");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_dissociation.md");
  });

  // These are depths, not stages: a persona may run depersonalization for a
  // lifetime and never reach the others. Drop or merge one and the domain loses a
  // depth while a count of three still passes, so the set is asserted rather than
  // the count. All three are processes -- each is something the mind does, not a
  // state it rests in.
  it("carries the three depths, every one of them a process", () => {
    const movements = manifest.members.filter((m) => m.parent === "process_dissociation.md");
    expect(movements.map((m) => m.file).sort()).toEqual(MOVEMENTS);
    for (const m of movements) expect(m.type).toBe("process");
  });

  it("declares the law at fail and the persona link at audit", () => {
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
      level: "audit",
    });
  });

  it("declares no engine dependencies -- it is an atom", () => {
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    const engines = Object.keys(pkg.dependencies ?? {}).filter(
      (d) => d.startsWith("@chbrain/khai-engine-") || d.startsWith("@chbrain/khai-composite-"),
    );
    expect(engines).toEqual([]);
  });
});

describe.skipIf(DORMANT)("dissociation: the root states what it routes into", () => {
  // Pinning this FILE's own claim, not a house rule. The canon says nothing about
  // what an Echo links; inventing that convention from a handful of files is a
  // mistake recorded in docs/BOUNDARY.md. What is asserted is local: this root's
  // Echo says the failure "runs at three depths" and names them.
  it("links all three depths from the Echo that claims them", () => {
    const echo = raw["process_dissociation.md"].split("## Echo")[1];
    expect(echo, "the root has no Echo chapter").toBeTruthy();
    for (const file of MOVEMENTS) expect(echo).toContain(`(${file})`);
  });

  it("names all four neighbours it delegates to", () => {
    const echo = raw["process_dissociation.md"].split("## Echo")[1];
    for (const neighbour of DELEGATES) expect(echo).toContain(neighbour);
  });

  // Freyd's betrayal trauma is carried by `betrayal`. Citing it here would restate
  // a spine another engine owns, so REFERENCES refuses it by name. A later author
  // adding it back in good faith would pass every structural wall and fail the
  // overlap wall for a reason nothing in this package explains -- unless the
  // refusal is asserted in both directions, as it is here.
  it("keeps refusing the citation that belongs to betrayal", () => {
    const refs = readFileSync(join(pkgDir, "REFERENCES.md"), "utf8");
    const restrictions = refs.split("## Restrictions")[1].split("## Encoding")[0];
    expect(restrictions).toContain("Freyd");
    expect(restrictions).toContain("`betrayal`");
    expect(refs.split("## Origin")[1].split("## Restrictions")[0]).not.toContain("Freyd");
  });

  // The citation stays at "et al." on purpose: naming Kathy Steele keys `Steele`,
  // which collides with Claude M. Steele across five existing rows and would need
  // a homonym declaration this engine does not otherwise require. A later author
  // "completing" the author list would turn a green package red for a reason the
  // package does not explain.
  it("keeps van der Hart's co-authors unnamed, which is what keeps Steele clear", () => {
    const origin = readFileSync(join(pkgDir, "REFERENCES.md"), "utf8").split("## Origin")[1];
    expect(origin).toContain("van der Hart et al.");
    expect(origin).not.toContain("Steele");
  });
});

describe.skipIf(DORMANT)("dissociation: compose()", () => {
  it("composes every depth root-first, carrying the dissociation root", () => {
    for (const leaf of Object.keys(chains)) {
      expect(compose({ leaf }).trimStart().split("\n")[0]).toBe("# Process: Dissociation");
    }
  });

  // Against the leaf's OWN title, never a chapter every member carries: a
  // `## Direction` anchor matches the root's copy and stays green when compose()
  // drops the leaf entirely. Gap measured on body-image (#1528).
  it("puts the root before the depth it carries", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      const leafTitle = `# ${readFileSync(join(pkgDir, leaf), "utf8").split("# ")[1].split("\n")[0]}`;
      expect(out.indexOf("# Process: Dissociation")).toBeLessThan(out.indexOf(leafTitle));
    }
  });

  it("rejects an unknown depth", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing depth", () => {
    expect(() => compose({})).toThrow();
  });
});
