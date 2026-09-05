// The mania engine tests what an atom owns: canon conformance through the shared
// kit, the manifest contract, and compose(). No atoms block -- mania declares no
// engine dependencies, which is the point of an atom.
//
// Rule 3's second PR for #1536, dormant until it lands.
//
// The sentinel asks the DISK whether the loader exists. It is not `const DORMANT
// = true`: a hardcoded flag satisfies the untested-packages wall while testing
// nothing and never switches itself on, which is worse than shipping no file at
// all. The import is dynamic because a static one throws at link time, before
// skipIf can spare it.

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
  "process_expansive_appraisal.md",
  "process_goal_activation.md",
  "process_rest_forfeit.md",
];

describe.skipIf(DORMANT)("mania: conforms to the canon", () => {
  // validateEnginePackage is ASYNC and resolves to an ARRAY of per-file results.
  // Calling it without await yields a Promise whose .ok and .failures are
  // undefined, and the assertion then throws rather than failing -- a green-looking
  // test that never tested. Awaited and flattened here.
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe.skipIf(DORMANT)("mania: manifest", () => {
  it("declares a process root over three movements", () => {
    expect(manifest.engine).toBe("mania");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_mania.md");
  });

  // The engine's claim is a sequence, not a symptom list: goal activation
  // escalates the target, expansive appraisal drops the downside so the target
  // reads as reasonable, rest forfeit removes the interruption that would end it.
  // Merge any pair and the mechanism collapses while a count of three still
  // passes, so the set is asserted rather than the count. All three are processes
  // because all three are things the persona runs, not states they are in.
  it("carries the three movements of the ascent, every one of them a process", () => {
    const movements = manifest.members.filter((m) => m.parent === "process_mania.md");
    expect(movements.map((m) => m.file).sort()).toEqual(MOVEMENTS);
    for (const m of movements) expect(m.type).toBe("process");
  });

  // Audit, not fail -- as social-anxiety, unlike disability and body-image.
  // Asserted by name so a copy from a fail-routed sibling goes red rather than
  // quietly tightening what the engine demands of a play.
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

  // An atom cites; it does not compose. This engine's boundary claim is that joy,
  // flow and sleep own what it delegates, so reaching into them as a dependency is
  // the failure worth catching.
  it("declares no engine dependencies -- it is an atom", () => {
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    const engines = Object.keys(pkg.dependencies ?? {}).filter(
      (d) => d.startsWith("@chbrain/khai-engine-") || d.startsWith("@chbrain/khai-composite-"),
    );
    expect(engines).toEqual([]);
  });
});

describe.skipIf(DORMANT)("mania: the root states the ascent it routes into", () => {
  // Pinning this FILE's own claim, not a house rule. The canon says nothing about
  // what an Echo links, and inventing that convention from a handful of files is a
  // mistake recorded in docs/BOUNDARY.md. What is asserted is local: this root's
  // Echo says the rise "runs across three movements" and names them, so a movement
  // that stops being named there turns the engine's own sentence into a lie while
  // every structural wall stays green.
  it("links all three movements from the Echo that claims them", () => {
    const echo = raw["process_mania.md"].split("## Echo")[1];
    expect(echo, "the root has no Echo chapter").toBeTruthy();
    for (const file of MOVEMENTS) expect(echo).toContain(`(${file})`);
  });

  // The delegations are the boundary, and the boundary is why the engine exists at
  // its own altitude. Named in the root's own Echo; a silent drop would widen the
  // engine's claim over joy, flow or sleep without any wall noticing.
  it("names the three neighbours it delegates to", () => {
    const echo = raw["process_mania.md"].split("## Echo")[1];
    for (const neighbour of ["`joy`", "`flow`", "`sleep`"]) expect(echo).toContain(neighbour);
  });
});

describe.skipIf(DORMANT)("mania: compose()", () => {
  it("composes every movement root-first, carrying the mania root", () => {
    for (const leaf of Object.keys(chains)) {
      expect(compose({ leaf }).trimStart().split("\n")[0]).toBe("# Process: Mania");
    }
  });

  // Against the leaf's OWN title, never a chapter every member carries: a
  // `## Direction`-style anchor matches the root's copy and stays green when
  // compose() drops the leaf entirely. Gap measured on body-image (#1528).
  it("puts the root before the movement it carries", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      const leafTitle = `# ${readFileSync(join(pkgDir, leaf), "utf8").split("# ")[1].split("\n")[0]}`;
      expect(out.indexOf("# Process: Mania")).toBeLessThan(out.indexOf(leafTitle));
    }
  });

  it("rejects an unknown movement", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing movement", () => {
    expect(() => compose({})).toThrow();
  });
});
