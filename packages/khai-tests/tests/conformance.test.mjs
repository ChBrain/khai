import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import {
  discoverEnginePackages,
  validateEnginePackage,
  validateContentFile,
  validateInstanceFile,
  wiringRequirements,
} from "../index.mjs";

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

// --- wiring: engine declares, kit enforces on a consumer instance ---------
describe("wiring: engine requirements enforced on instances", () => {
  // The gender engine declares: every persona must link a gender expression
  // under Projection. We synthesise that requirement and a consumer persona.
  const genderManifest = {
    engine: "gender",
    anchor: "position_gender.md",
    expressions: { male: "position_male.md", female: "position_female.md" },
    requires: [{ on: "persona", section: "Projection", link: "expression" }],
  };
  const requirements = wiringRequirements([genderManifest]);

  const persona = (projectionBody) => `---
khai: persona
license: CC-BY-NC-4.0
stamp:
  owner: A Consumer
  version: v0.1.0
  date: "2026-01-01"
---

# Persona: Ada

## Title
Ada

## Owner
- Project: someproject

## Projection
${projectionBody}

## Action
She ships.

## Shadow
She cannot see the cost.

## Tell
Her jaw tightens.
`;

  it("derives the requirement from the engine manifest", () => {
    expect(requirements).toEqual([
      {
        engine: "gender",
        on: "persona",
        section: "Projection",
        targets: new Set(["position_male.md", "position_female.md"]),
      },
    ]);
  });

  it("passes a persona that links a gender expression in Projection", () => {
    const text = persona("A woman in a boardroom. [Female](position_female.md)");
    expect(validateInstanceFile(text, { requirements })).toEqual([]);
  });

  it("rejects a persona with no gender link (the law is enforced)", () => {
    const text = persona("A woman in a boardroom.");
    const errors = validateInstanceFile(text, { requirements });
    expect(errors.some((e) => e.includes("wiring(gender)") && e.includes("Projection"))).toBe(true);
  });

  it("rejects a gender link in the wrong section", () => {
    const text = persona("A woman in a boardroom.").replace(
      "## Action\nShe ships.",
      "## Action\nShe ships. [Female](position_female.md)",
    );
    const errors = validateInstanceFile(text, { requirements });
    expect(errors.some((e) => e.includes("wiring(gender)"))).toBe(true);
  });

  it("does not impose gender wiring on a non-persona instance", () => {
    const plotLike = persona("x").replace("khai: persona", "khai: persona-but-checked-by-on");
    // `on: persona` only — a different type is untouched by this requirement.
    const reqForPlot = wiringRequirements([
      { ...genderManifest, requires: [{ on: "plot", section: "Cast", link: "expression" }] },
    ]);
    const text = persona("No gender here.");
    // The plot-scoped requirement must not fire on a persona.
    expect(
      validateInstanceFile(text, { requirements: reqForPlot }).some((e) => e.includes("wiring")),
    ).toBe(false);
  });
});
