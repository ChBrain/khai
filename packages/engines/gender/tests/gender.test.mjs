// The gender engine guards its own rules — the way khai-arch guards the canon.
// It self-certifies against the canon through the shared conformance kit
// (@chbrain/khai-tests), then locks in the behavior that is gender-specific:
// the manifest contract, compose() output, the anchor carried upward, and
// guardrails that bite on the engine's real content. An engine installed
// standalone proves itself with this suite alone.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage, validateContentFile } from "@chbrain/khai-tests";
import { manifest, compose, anchor, expressions } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const owner = { Project: "khai", Engine: "gender" };
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

// --- self-conformance: gender certifies itself against the canon ----------
describe("gender: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose)", async () => {
    expect(flatten(await validateEnginePackage(pkgDir, { executeCompose: true }))).toEqual([]);
  });
});

// --- manifest contract ----------------------------------------------------
describe("gender: manifest", () => {
  it("declares the gender position engine", () => {
    expect(manifest.engine).toBe("gender");
    expect(manifest.type).toBe("position");
    expect(manifest.anchor).toBe("position_gender.md");
    expect(Object.keys(manifest.expressions).sort()).toEqual(["female", "male"]);
  });

  it("teaches both wiring altitudes in the card (Knowledge law + Projection)", () => {
    // Teaching lives in the WIRES card now (single source); the legacy
    // free-text `wiring`/`requirement` fields were removed.
    expect(manifest.card.setup).toContain("Knowledge");
    expect(manifest.card.setup).toContain("Projection");
  });

  it("declares the enforceable wiring requirement: persona -> gender in Projection", () => {
    // The engine owns the contract; the kit enforces it. Here we assert the
    // engine actually ships the machine-readable requirement.
    expect(manifest.requires).toContainEqual({
      on: "persona",
      section: "Projection",
      link: "expression",
    });
  });
});

// --- behavior: compose() carries the anchor upward ------------------------
describe("gender: compose()", () => {
  for (const name of Object.keys(expressions)) {
    it(`composes ${name}: anchor first, then the expression`, () => {
      const out = compose({ expression: name });
      // The anchor is carried upward — it leads, the expression follows.
      expect(out.startsWith(anchor)).toBe(true);
      expect(out).toContain(expressions[name]);
      expect(out.indexOf(anchor)).toBeLessThan(out.indexOf(expressions[name]));
    });
  }

  it("rejects an unknown expression", () => {
    expect(() => compose({ expression: "not-a-gender" })).toThrow();
  });

  it("rejects a missing expression", () => {
    expect(() => compose({})).toThrow();
  });
});

// --- guardrails bite on the engine's real content -------------------------
describe("gender: guardrails reject drift", () => {
  const female = readFileSync(join(pkgDir, "position_female.md"), "utf8");
  const check = (text) => validateContentFile(text, { type: "position", baseDir: pkgDir, owner });

  it("the unmodified female expression passes clean", () => {
    expect(check(female)).toEqual([]);
  });

  it("rejects an invented Owner key (Scope creep)", () => {
    const drifted = female.replace("- Engine: gender", "- Engine: gender\n- Scope: Universal");
    expect(check(drifted).some((e) => e.includes("unknown Owner key: Scope"))).toBe(true);
  });

  it("rejects a dropped HOLD chapter", () => {
    const drifted = female.replace("## Drives", "## Drifted");
    expect(check(drifted).some((e) => e.includes("H2 sections must be exactly"))).toBe(true);
  });

  it("rejects an undeclared ### extension", () => {
    const drifted = female.replace("## Drives", "### sneaky\nx\n\n## Drives");
    expect(check(drifted).some((e) => e.includes("undeclared extension"))).toBe(true);
  });
});
