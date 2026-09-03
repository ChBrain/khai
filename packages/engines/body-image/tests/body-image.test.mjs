// The body-image engine tests what an atom owns: canon conformance through the
// shared kit, the manifest contract, and compose(). No atoms block -- body-image
// declares no engine dependencies, which is the point of an atom.
//
// Rule 3's second PR for #1527. Authored by Perplexity alongside the source and
// lifted here; two of its assertions are rewritten rather than carried, and the
// reasons are on them.

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");

// Dormant until the source lands (#1527). Structural, not textual: ask the disk
// whether the loader exists rather than reading it for a phrase a comment could
// satisfy -- the sentinel this repo has twice paid for. The import is dynamic
// because a static one throws at link time, before skipIf can spare it.
const DORMANT = !existsSync(join(pkgDir, "index.mjs"));
let manifest, compose, chains;
beforeAll(async () => {
  if (DORMANT) return;
  ({ manifest, compose, chains } = await import("../index.mjs"));
});
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe.skipIf(DORMANT)("body-image: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe.skipIf(DORMANT)("body-image: manifest", () => {
  it("declares a position root over three movements", () => {
    expect(manifest.engine).toBe("body-image");
    expect(manifest.type).toBe("position");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("position_body_image.md");
  });

  // The engine's whole claim is that the three are dissociable rather than three
  // views of one flatness: internalization is an attitude, surveillance an
  // attentional posture, contingency the worth stake. Merge any pair and the
  // engine stops being able to say which one a persona is running. So the SET is
  // asserted, sorted -- not the order, which carries no meaning here and would
  // fail a harmless reshuffle.
  it("carries the three movements as distinct positions", () => {
    const movements = manifest.members.filter((m) => m.parent === "position_body_image.md");
    expect(movements.map((m) => m.file).sort()).toEqual([
      "position_appearance_contingency.md",
      "position_body_surveillance.md",
      "position_thin_ideal_internalization.md",
    ]);
    for (const m of movements) expect(m.type).toBe("position");
  });

  // Both altitudes are fail, and the persona one is the unusual half -- most
  // engines audit the Projection link. Here an unnamed link is an error.
  it("declares both wiring altitudes at fail, the persona link included", () => {
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

  // An atom cites; it does not compose. A dependency on another engine would make
  // this a composite wearing an engine's name -- and body-image is exactly the
  // engine that must NOT reach into comparison, self-discrepancy or body, since
  // its whole boundary claim is that it owns only what they delegate.
  it("declares no engine dependencies -- it is an atom", () => {
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    const engines = Object.keys(pkg.dependencies ?? {}).filter(
      (d) => d.startsWith("@chbrain/khai-engine-") || d.startsWith("@chbrain/khai-composite-"),
    );
    expect(engines).toEqual([]);
  });
});

describe.skipIf(DORMANT)("body-image: compose()", () => {
  it("composes every movement root-first, carrying the body-image root", () => {
    expect(Object.keys(chains)).toHaveLength(3);
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Position: Body Image");
    }
  });

  // The ordering assertion, rewritten. The original compared the root title
  // against `## Has`, and `## Has` is a chapter EVERY member carries -- so it
  // always matched the root's own, at a fixed offset, and the comparison was
  // true by construction for every leaf (measured: root@2, ## Has@161, all
  // three). It could not fail. Comparing the root's title against the LEAF's
  // title can: it is false the moment compose() emits the chain in the wrong
  // order or drops the root.
  it("puts the root before the movement it carries", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      const leafTitle = `# ${readFileSync(join(pkgDir, leaf), "utf8").split("# ")[1].split("\n")[0]}`;
      expect(out.indexOf("# Position: Body Image")).toBeLessThan(out.indexOf(leafTitle));
    }
  });

  it("rejects an unknown movement", () => {
    expect(() => compose({ leaf: "position_unknown.md" })).toThrow();
  });

  it("rejects a missing movement", () => {
    expect(() => compose({})).toThrow();
  });
});
