// The stack engine ships its own structural tests. It does not carry khai-type
// content, so it is not run through the shared conformance kit
// (@chbrain/khai-tests `validateEnginePackage`, which certifies the five khai
// types). These tests pin the manifest contract, compose() behavior, and the
// file hygiene the canon's TECHNICAL.md requires of every .md file.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { manifest, compose, stack, flavors, raw } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const mdFiles = readdirSync(pkgDir).filter((f) => f.endsWith(".md") && f !== "CHANGELOG.md");

// --- manifest contract ----------------------------------------------------
describe("stack: manifest", () => {
  it("declares the stack engine, its stack surface, and the raw flavor", () => {
    expect(manifest.engine).toBe("stack");
    expect(manifest.stack).toBe("stack.md");
    expect(Object.keys(manifest.flavors)).toContain("raw");
    expect(manifest.flavors.raw).toBe("instructions_raw.md");
  });

  it("every manifest-referenced file exists and is loadable", () => {
    expect(stack.length).toBeGreaterThan(0);
    for (const name of Object.keys(manifest.flavors)) {
      expect(flavors[name].length).toBeGreaterThan(0);
    }
  });
});

// --- behavior: compose() returns the chosen flavor's instructions ---------
describe("stack: compose()", () => {
  it("defaults to the raw flavor", () => {
    expect(compose()).toBe(compose({ flavor: "raw" }));
  });

  it("composes the raw collaboration contract, all five sections", () => {
    const out = compose({ flavor: "raw" });
    for (const section of ["# Human", "# Agent", "# Collaboration", "# Knowledge", "# System"]) {
      expect(out).toContain(section);
    }
  });

  it("strips frontmatter from the composed output", () => {
    expect(compose({ flavor: "raw" }).startsWith("---")).toBe(false);
    expect(raw.raw.startsWith("---")).toBe(true); // the on-disk original keeps it
  });

  it("rejects an unknown flavor", () => {
    expect(() => compose({ flavor: "not-a-flavor" })).toThrow();
  });
});

// --- file hygiene: TECHNICAL.md rules for every .md file ------------------
describe("stack: file hygiene", () => {
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
