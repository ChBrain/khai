// The collision wall, wired into the conformance kit: within one directory (a
// play's cast) no two instances of different kinds may share a display title,
// and a whole-phenomenon piece may not reuse the play title. The Playwright
// wiring guide is exempt (dev-steering named after the phenomenon, not a cast
// element). This exercises validateProject over a temp house; the engine-member
// path and the meta-engine exemption are covered by the conformance suite (every
// real engine, including the meta spine, validates with zero findings).

import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { validateProject } from "../index.mjs";

// Source-presence guard, per the repo convention (the wall must be on main for
// these to mean anything).
const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "validate.mjs");
const DORMANT = !readFileSync(SRC, "utf8").includes("titleCollisions");

const instance = (kind, name) =>
  `---
khai: ${kind}
title: "${name}"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-07-21"
---

# ${kind.charAt(0).toUpperCase() + kind.slice(1)}: ${name}

## Taxonomy
parent
`;

let dir;
afterEach(() => dir && rmSync(dir, { recursive: true, force: true }));

/** A temp house with a single sub-directory of instances (no plays/ dir, so the
 * registry and casting checks skip and only the collision wall speaks). */
function house(files) {
  dir = mkdtempSync(join(tmpdir(), "khai-collision-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "t", version: "0.0.0" }));
  const scope = join(dir, "cast");
  mkdirSync(scope, { recursive: true });
  for (const [file, kind, name] of files) writeFileSync(join(scope, file), instance(kind, name));
  return dir;
}

const allErrors = (results) => results.flatMap((r) => r.errors ?? []);
const collisionErrors = (results) =>
  allErrors(results).filter((e) => e.includes("display-title collision"));

describe.skipIf(DORMANT)("collision wall: validateProject over a play's cast", () => {
  it("flags two kinds sharing a display title", () => {
    const results = validateProject({
      root: house([
        ["persona_fall.md", "persona", "The Fall"],
        ["piece_fall.md", "piece", "The Fall"],
      ]),
    });
    const hits = collisionErrors(results);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toContain("The Fall");
    expect(hits[0]).toContain("persona");
    expect(hits[0]).toContain("piece");
  });

  it("exempts the Playwright wiring guide co-named with a member", () => {
    const results = validateProject({
      root: house([
        ["playwright_instructions.md", "instructions", "Absorption"],
        ["process_absorption.md", "process", "Absorption"],
      ]),
    });
    expect(collisionErrors(results)).toEqual([]);
  });

  it("does not flag repetition within a single kind", () => {
    const results = validateProject({
      root: house([
        ["persona_a.md", "persona", "Nicias"],
        ["persona_b.md", "persona", "Nicias"],
      ]),
    });
    expect(collisionErrors(results)).toEqual([]);
  });

  it("passes a cast whose titles are all distinct", () => {
    const results = validateProject({
      root: house([
        ["persona_a.md", "persona", "Nicias"],
        ["piece_b.md", "piece", "The Fall"],
      ]),
    });
    expect(collisionErrors(results)).toEqual([]);
  });
});
