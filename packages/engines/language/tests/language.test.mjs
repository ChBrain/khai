// The language engine tests what is language-specific: that the package conforms
// to the canon through the shared conformance kit (@chbrain/khai-tests), its
// members manifest contract, and its compose() behavior over the ladder. The
// kit's own drift detection is proved in khai-tests against its fixtures, not
// re-proved here through language's files.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, raw } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const body = (md) => md.replace(/^---\n[\s\S]*?\n---\n/, "").trim();

// --- self-conformance: language certifies itself against the canon ----------
describe("language: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

// --- manifest contract ------------------------------------------------------
describe("language: manifest", () => {
  it("declares the language process engine as a members ladder", () => {
    expect(manifest.engine).toBe("language");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(24);
    expect(manifest.members.every((m) => m.type === "process")).toBe(true);
  });

  it("roots at using language, with five channels hanging off it", () => {
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("process_using_language.md");
    const channels = manifest.members
      .filter((m) => m.parent === "process_using_language.md")
      .map((m) => m.file)
      .sort();
    expect(channels).toEqual([
      "process_hearing.md",
      "process_reading.md",
      "process_speaking.md",
      "process_thinking.md",
      "process_writing.md",
    ]);
  });

  it("runs the four I/O channels at four widths and thinking at the two deepest", () => {
    const widthsOf = (channel) => manifest.members.filter((m) => m.parent === channel).length;
    expect(widthsOf("process_speaking.md")).toBe(4);
    expect(widthsOf("process_hearing.md")).toBe(4);
    expect(widthsOf("process_reading.md")).toBe(4);
    expect(widthsOf("process_writing.md")).toBe(4);
    expect(widthsOf("process_thinking.md")).toBe(2);
  });

  it("declares the two wiring altitudes (Instructions law + persona link)", () => {
    // The law: declared once in the world's Instructions Knowledge chapter,
    // linking the root. The link: each persona links a width leaf under
    // Projection. Both are the structural floor, so both are declared fail.
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

// --- behavior: compose() carries the chain upward ---------------------------
describe("language: compose()", () => {
  it("composes a width as its whole root-to-leaf chain, root first", () => {
    expect(chains["process_speaking_worn.md"]).toEqual([
      "process_using_language.md",
      "process_speaking.md",
      "process_speaking_worn.md",
    ]);
    const out = compose({ leaf: "process_speaking_worn.md" });
    const at = chains["process_speaking_worn.md"].map((file) => out.indexOf(body(raw[file])));
    expect(at.every((i) => i > -1)).toBe(true); // every member present
    expect(at).toEqual([...at].sort((a, b) => a - b)); // root, then channel, then width
  });

  it("composes every leaf to a non-empty string", () => {
    for (const leaf of Object.keys(chains)) {
      const out = compose({ leaf });
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
    }
  });

  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_not_a_real_file.md" })).toThrow();
  });

  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
