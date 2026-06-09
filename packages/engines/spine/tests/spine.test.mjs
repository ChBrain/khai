// The spine engine ships its own structural tests alongside the shared
// conformance kit. It is `class: meta` (the spine: flavored instructions + the
// architecture), so the conformance suite validates it through its meta branch;
// these tests pin the manifest contract, compose() behavior, and the file
// hygiene the canon's TECHNICAL.md requires of every .md file.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { manifest, compose, architecture, flavors, flavorFiles, raw } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const mdFiles = readdirSync(pkgDir).filter((f) => f.endsWith(".md") && f !== "CHANGELOG.md");

// --- manifest contract ----------------------------------------------------
describe("spine: manifest", () => {
  it("declares the meta spine engine and its members", () => {
    expect(manifest.engine).toBe("spine");
    expect(manifest.class).toBe("meta");
    const byType = (t) => manifest.members.filter((m) => m.type === t).map((m) => m.file);
    expect(byType("instructions")).toContain("instructions_raw.md");
    expect(byType("architecture")).toEqual(["architecture.md"]);
  });

  it("derives the raw flavor from the instructions members", () => {
    expect(flavorFiles.raw).toBe("instructions_raw.md");
  });

  it("every manifest-referenced file exists and is loadable", () => {
    expect(architecture.length).toBeGreaterThan(0);
    for (const name of Object.keys(flavorFiles)) {
      expect(flavors[name].length).toBeGreaterThan(0);
    }
  });
});

// --- behavior: compose() returns the chosen flavor's instructions ---------
describe("spine: compose()", () => {
  it("defaults to the raw flavor", () => {
    expect(compose()).toBe(compose({ flavor: "raw" }));
  });

  it("composes the raw collaboration contract, all five HACKS chapters", () => {
    const out = compose({ flavor: "raw" });
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
    expect(compose({ flavor: "raw" }).startsWith("---")).toBe(false);
    expect(raw["instructions_raw.md"].startsWith("---")).toBe(true); // on-disk original keeps it
  });

  it("rejects an unknown flavor", () => {
    expect(() => compose({ flavor: "not-a-flavor" })).toThrow();
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
