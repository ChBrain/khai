// The spine engine ships its own structural tests alongside the shared
// conformance kit. It is `class: meta` (the spine: the collaboration
// instructions and the architecture, the extension point), so the conformance
// suite validates it through its meta branch; these tests pin the manifest
// contract, compose() behavior, and the file hygiene the canon's TECHNICAL.md
// requires of every .md file.
//
// The instructions file is moving from `instructions_raw.md` (a flavor) to a
// single `instructions.md` (the basis), and the flavor machinery is retiring
// with it. The rename-dependent assertions are guarded by RENAMED, computed
// from the manifest, so they stay dormant until the source change lands and
// activate automatically once it does. Source and tests are separate PRs.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { manifest, compose, architecture, raw } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const mdFiles = readdirSync(pkgDir).filter((f) => f.endsWith(".md") && f !== "CHANGELOG.md");

// The single instructions.md (the basis) has replaced the instructions_<flavor>
// convention. True once the source rename lands; false on the old shape.
const RENAMED = manifest.members.some((m) => m.file === "instructions.md");

// --- manifest contract (source-agnostic) ----------------------------------
describe("spine: manifest", () => {
  it("declares the meta spine engine and its architecture", () => {
    expect(manifest.engine).toBe("spine");
    expect(manifest.class).toBe("meta");
    const byType = (t) => manifest.members.filter((m) => m.type === t).map((m) => m.file);
    expect(byType("architecture")).toEqual(["architecture.md"]);
    expect(byType("instructions").length).toBe(1);
  });
});

// --- behavior: compose() returns the collaboration contract ---------------
// A bare compose() returns the basis contract in both shapes (the old flavor
// model defaults to raw; the new single-file model has nothing to choose), so
// these hold across the transition.
describe("spine: compose()", () => {
  it("composes the collaboration contract, all five HACKS chapters", () => {
    const out = compose();
    for (const chapter of [
      "## Human",
      "## Agent",
      "## Collaboration",
      "## Knowledge",
      "## System",
    ]) {
      expect(out).toContain(chapter);
    }
  });

  it("strips frontmatter from the composed output", () => {
    expect(compose().startsWith("---")).toBe(false);
  });
});

// --- the architecture (the extension point) -------------------------------
describe("spine: architecture", () => {
  it("carries the TO GROW chapters", () => {
    for (const chapter of ["## Ground", "## Root", "## Open", "## Weave"]) {
      expect(architecture).toContain(chapter);
    }
  });
});

// --- the renamed basis (dormant until the source rename lands) -------------
describe.skipIf(!RENAMED)("spine: instructions.md (the basis)", () => {
  it("declares the single instructions.md as the contract member", () => {
    const instr = manifest.members.filter((m) => m.type === "instructions").map((m) => m.file);
    expect(instr).toEqual(["instructions.md"]);
  });

  it("keeps the setup plan as the anchor", () => {
    const plans = manifest.members.filter((m) => m.type === "plan").map((m) => m.file);
    expect(plans).toContain("plan_setup.md");
  });

  it("keeps the on-disk original's frontmatter (stamping/provenance)", () => {
    expect(raw["instructions.md"].startsWith("---")).toBe(true);
  });
});

// --- file hygiene: TECHNICAL.md rules for every .md file ------------------
describe("spine: file hygiene", () => {
  for (const file of mdFiles) {
    const text = readFileSync(join(pkgDir, file), "utf8");
    it(`${file}: UTF-8 without BOM, LF only, one trailing newline, no em-dash`, () => {
      expect(text.charCodeAt(0)).not.toBe(0xfeff); // no byte-order mark
      expect(text).not.toContain("\r"); // POSIX LF, no CRLF
      expect(text).not.toContain("—"); // no em-dash
      expect(text).not.toContain("�"); // no replacement char
      expect(text.endsWith("\n")).toBe(true);
      expect(text.endsWith("\n\n")).toBe(false); // exactly one trailing newline
    });
  }
});
