// A BOM-prefixed content file must still be discovered as an instance (and then
// flagged by checkEncoding) instead of being skipped and left unvalidated.
// Dormant until the source fix lands on main -- probe the source for the
// BOM-tolerant marker the fix introduces, per the parse.test.mjs convention.

import { describe, it, expect } from "vitest";
import { validateProject } from "../index.mjs";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "validate.mjs");
const BOM_DORMANT = !readFileSync(SRC, "utf8").includes("\\uFEFF?---");

const INSTANCE = `---
khai: persona
title: "X"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-07-17"
type: fictional
---

# Persona: X

## Taxonomy
parent
`;

function fixtureRoot(prefix) {
  const root = mkdtempSync(join(tmpdir(), "bom-inst-"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "t", version: "0.0.0" }));
  const pdir = join(root, "plays", "t_001_x");
  mkdirSync(pdir, { recursive: true });
  writeFileSync(join(pdir, "persona_x.md"), prefix + INSTANCE);
  return root;
}

describe.skipIf(BOM_DORMANT)("instance discovery tolerates a leading BOM", () => {
  it("discovers a BOM-prefixed instance and flags the BOM (never silently skips it)", () => {
    const results = validateProject({ root: fixtureRoot("\uFEFF") });
    const file = results.find((r) => r.file.endsWith("persona_x.md"));
    expect(file, "BOM-prefixed instance must be discovered, not skipped").toBeTruthy();
    expect(file.errors.join(" ")).toContain("BOM present");
  });

  it("still discovers the same instance without a BOM (no regression)", () => {
    const results = validateProject({ root: fixtureRoot("") });
    const file = results.find((r) => r.file.endsWith("persona_x.md"));
    expect(file, "a normal instance must still be discovered").toBeTruthy();
    expect(file.errors.join(" ")).not.toContain("BOM present");
  });
});
