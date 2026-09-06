// The ocd engine tests what an atom owns: canon conformance through the shared
// kit, the manifest contract, and compose(). No atoms block -- ocd declares no
// engine dependencies, which is the point of an atom.
//
// Rule 3's second PR for #1539, dormant until it lands. The sentinel asks the DISK
// whether the loader exists, not a hardcoded flag: a flag satisfies the
// untested-packages wall while testing nothing and never switches itself on. The
// import is dynamic because a static one throws at link time, before skipIf can
// spare it.

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
  "process_inflated_responsibility.md",
  "process_neutralizing.md",
  "process_thought_action_fusion.md",
];

// The four the engine says it is not. Each is close enough that a silent drop
// would widen this engine's claim without any structural wall noticing.
const DELEGATES = ["`superstition`", "`ritual`", "`habit`", "`disgust`"];

describe.skipIf(DORMANT)("ocd: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe.skipIf(DORMANT)("ocd: manifest", () => {
  it("declares a process root over three movements", () => {
    expect(manifest.engine).toBe("ocd");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_ocd.md");
  });

  // The loop closes only when all three run: the reading makes the intrusion
  // mean something, the duty makes it the persona's to answer, the act discharges
  // it and blocks the disconfirmation. Merge any pair and the seal is gone while a
  // count of three still passes, so the set is asserted rather than the count.
  it("carries the three movements of the loop, every one of them a process", () => {
    const movements = manifest.members.filter((m) => m.parent === "process_ocd.md");
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

describe.skipIf(DORMANT)("ocd: the root states the loop it routes into", () => {
  // Pinning this FILE's own claim, not a house rule. The canon says nothing about
  // what an Echo links, and inventing that convention from a handful of files is a
  // mistake recorded in docs/BOUNDARY.md. What is asserted is local: this root's
  // Echo says the loop "runs across three movements" and names them.
  it("links all three movements from the Echo that claims them", () => {
    const echo = raw["process_ocd.md"].split("## Echo")[1];
    expect(echo, "the root has no Echo chapter").toBeTruthy();
    for (const file of MOVEMENTS) expect(echo).toContain(`(${file})`);
  });

  // This engine is defined by proximity to four others, more than any engine so
  // far: superstition shares the magical reading, ritual shares the repeated act,
  // habit shares the automaticity, disgust shares the contamination content. The
  // delegations are the entire case for its altitude, and they live in prose that
  // nothing else checks.
  it("names all four neighbours it delegates to", () => {
    const echo = raw["process_ocd.md"].split("## Echo")[1];
    for (const neighbour of DELEGATES) expect(echo).toContain(neighbour);
  });

  // Foa & Kozak's "Emotional processing of fear" is carried by `ptsd`. Citing it
  // here would be a real overlap, so REFERENCES refuses it by name. A later author
  // adding it back would pass every structural wall and fail the overlap wall for
  // a reason nothing in this package explains -- unless the refusal is asserted.
  it("keeps refusing the citation that belongs to ptsd", () => {
    const refs = readFileSync(join(pkgDir, "REFERENCES.md"), "utf8");
    const restrictions = refs.split("## Restrictions")[1].split("## Encoding")[0];
    expect(restrictions).toContain("Foa");
    expect(restrictions).toContain("`ptsd`");
    expect(refs.split("## Origin")[1].split("## Restrictions")[0]).not.toContain("Foa");
  });
});

describe.skipIf(DORMANT)("ocd: compose()", () => {
  it("composes every movement root-first, carrying the ocd root", () => {
    for (const leaf of Object.keys(chains)) {
      expect(compose({ leaf }).trimStart().split("\n")[0]).toBe("# Process: OCD");
    }
  });

  // Against the leaf's OWN title, never a chapter every member carries: a
  // `## Direction` anchor matches the root's copy and stays green when compose()
  // drops the leaf entirely. Gap measured on body-image (#1528).
  it("puts the root before the movement it carries", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      const leafTitle = `# ${readFileSync(join(pkgDir, leaf), "utf8").split("# ")[1].split("\n")[0]}`;
      expect(out.indexOf("# Process: OCD")).toBeLessThan(out.indexOf(leafTitle));
    }
  });

  it("rejects an unknown movement", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing movement", () => {
    expect(() => compose({})).toThrow();
  });
});
