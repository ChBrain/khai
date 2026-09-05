// The social-anxiety engine tests what an atom owns: canon conformance through
// the shared kit, the manifest contract, and compose(). No atoms block --
// social-anxiety declares no engine dependencies, which is the point of an atom.
//
// Rule 3's second PR for #1530. The source landed, so nothing here is dormant.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, raw } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

const MOVEMENTS = [
  "process_anticipatory_processing.md",
  "process_post_event_processing.md",
  "process_self_focused_attention.md",
];

describe("social-anxiety: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

describe("social-anxiety: manifest", () => {
  it("declares a process root over three movements", () => {
    expect(manifest.engine).toBe("social-anxiety");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    expect(manifest.members.find((m) => m.parent === null).file).toBe("process_social_anxiety.md");
  });

  // Clark & Wells' model is a maintaining LOOP, not three symptoms: anticipatory
  // processing runs before the exposure, self-focused attention during it,
  // post-event processing after -- and each hands the next its material. Drop or
  // merge one and the remaining two stop being a cycle while a count of three
  // still passes, so the set is asserted rather than the count. All three are
  // processes because all three are things the persona runs, not states it is in.
  it("carries the three phases of the loop, every one of them a process", () => {
    const movements = manifest.members.filter((m) => m.parent === "process_social_anxiety.md");
    expect(movements.map((m) => m.file).sort()).toEqual(MOVEMENTS);
    for (const m of movements) expect(m.type).toBe("process");
  });

  // The persona link is AUDIT here, where disability and body-image make it fail.
  // Asserted by name so a copy from a fail-routed sibling goes red rather than
  // quietly tightening what this engine asks of a play.
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

  // An atom cites; it does not compose. A dependency on another engine would make
  // this a composite wearing an engine's name -- and this engine's boundary claim
  // is that fear, embarrassment and shame own what it delegates, so reaching into
  // them is exactly the failure worth catching.
  it("declares no engine dependencies -- it is an atom", () => {
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    const engines = Object.keys(pkg.dependencies ?? {}).filter(
      (d) => d.startsWith("@chbrain/khai-engine-") || d.startsWith("@chbrain/khai-composite-"),
    );
    expect(engines).toEqual([]);
  });
});

describe("social-anxiety: the root states the loop it routes into", () => {
  // Pinning this FILE's own claim, not a house rule. The canon says nothing about
  // what an Echo must link -- a measurement across all process-rooted composites
  // once found Echo linking nothing in 66 of 101, and inventing a convention from
  // a handful of files is a mistake this repo has already paid for (docs/BOUNDARY.md).
  // What is asserted here is narrower and local: this root's Echo says the loop
  // "runs across three movements" and names them, so a movement that stops being
  // named there turns the engine's own sentence into a lie while every structural
  // wall stays green.
  it("links all three movements from the Echo that claims them", () => {
    const echo = raw["process_social_anxiety.md"].split("## Echo")[1];
    expect(echo, "the root has no Echo chapter").toBeTruthy();
    for (const file of MOVEMENTS) expect(echo).toContain(`(${file})`);
  });
});

describe("social-anxiety: compose()", () => {
  it("composes every movement root-first, carrying the social-anxiety root", () => {
    for (const leaf of Object.keys(chains)) {
      expect(compose({ leaf }).trimStart().split("\n")[0]).toBe("# Process: Social Anxiety");
    }
  });

  // Against the leaf's OWN title, never a chapter every member carries: a
  // `## Has`-style anchor matches the root's copy and stays green when compose()
  // drops the leaf entirely. That gap was measured on body-image (#1528).
  it("puts the root before the movement it carries", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      const leafTitle = `# ${readFileSync(join(pkgDir, leaf), "utf8").split("# ")[1].split("\n")[0]}`;
      expect(out.indexOf("# Process: Social Anxiety")).toBeLessThan(out.indexOf(leafTitle));
    }
  });

  it("rejects an unknown movement", () => {
    expect(() => compose({ leaf: "process_unknown.md" })).toThrow();
  });

  it("rejects a missing movement", () => {
    expect(() => compose({})).toThrow();
  });
});
