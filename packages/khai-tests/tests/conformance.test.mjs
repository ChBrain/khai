import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { discoverEnginePackages, validateEnginePackage, validateContentFile } from "../index.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const pkgs = discoverEnginePackages(root);

const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

// --- suite mode: every engine package must conform to the canon ----------
describe("conformance: engine packages", () => {
  it("discovers at least one engine package", () => {
    expect(pkgs.length).toBeGreaterThan(0);
  });

  for (const dir of pkgs) {
    it(`${relative(root, dir)} conforms`, async () => {
      // Trusted: our own workspace packages, so run the compose() smoke test too.
      expect(flatten(await validateEnginePackage(dir, { executeCompose: true }))).toEqual([]);
    });
  }
});

// --- the guardrails actually bite ----------------------------------------
describe("conformance: guardrails reject drift", () => {
  // Missing ## Drives, an invented Owner key (Scope), and an undeclared ###.
  const broken = `---
khai: position
license: CC-BY-NC-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.1.0
  date: "2026-01-01"
---

# Position: Broken

## Title
Broken

## Owner
- Project: khai
- Engine: gender
- Scope: Universal

## Has
x

## Orders
x

## Loses
x

### sneaky
x
`;

  const errors = validateContentFile(broken, {
    type: "position",
    owner: { Project: "khai", Engine: "gender" },
  });

  it("flags the missing/altered H2 section set", () => {
    expect(errors.some((e) => e.includes("H2 sections must be exactly"))).toBe(true);
  });
  it("flags the invented Owner key (Scope creep)", () => {
    expect(errors.some((e) => e.includes("unknown Owner key: Scope"))).toBe(true);
  });
  it("flags the undeclared ### extension", () => {
    expect(errors.some((e) => e.includes("undeclared extension"))).toBe(true);
  });
});
