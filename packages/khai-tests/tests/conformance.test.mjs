import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import {
  discoverEnginePackages,
  validateEnginePackage,
  validateContentFile,
  validateInstanceFile,
  validateProject,
  wiringRequirements,
  engineDocChecks,
} from "../index.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const pkgs = discoverEnginePackages(root);

const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
const flattenWarnings = (results) =>
  results.flatMap((r) => (r.warnings ?? []).map((w) => `${r.file}: ${w}`));

// --- suite mode: every engine package must conform to the canon ----------
describe("conformance: engine packages", () => {
  it("discovers at least one engine package", () => {
    expect(pkgs.length).toBeGreaterThan(0);
  });

  for (const dir of pkgs) {
    it(`${relative(root, dir)} conforms`, async () => {
      // Trusted: our own workspace packages, so run the compose() smoke test too.
      const results = await validateEnginePackage(dir, { executeCompose: true });
      expect(flatten(results)).toEqual([]);
      // Our own engines hold to the docs standard with zero advisory warnings
      // too (downstream consumers get these as warnings, not failures).
      expect(flattenWarnings(results)).toEqual([]);
    });
  }
});

// --- engine docs standard: the advisory lane surfaces, and bites on drift -
describe("engineDocChecks: advisory docs-standard lane", () => {
  const dir = join(tmpdir(), `khai-docs-${process.pid}`);
  beforeAll(() => {
    mkdirSync(dir, { recursive: true });
    // A REFERENCES with no frontmatter, a backticked (unlinked) member, and a
    // clause dash - three docs-standard violations, zero canon errors.
    writeFileSync(
      join(dir, "REFERENCES.md"),
      "# Refs\n\n**Authorship:** someone\n\nMaps `position_x.md` - the anchor.\n",
    );
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it("reports docs-standard violations as warnings, never errors", () => {
    const results = engineDocChecks(dir);
    const warnings = results.flatMap((r) => r.warnings);
    expect(results.every((r) => r.errors.length === 0)).toBe(true);
    expect(warnings.some((w) => /clause dash/.test(w))).toBe(true);
    expect(warnings.some((w) => /frontmatter/.test(w))).toBe(true);
    expect(warnings.some((w) => /loose file/.test(w))).toBe(true);
  });
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

  it("exempts the wiring link from the local broken-link check", () => {
    // The gender file lives in node_modules, not next to the persona, so the
    // wiring link must not be reported as a broken local link. baseDir points
    // at a real dir with no such file; only the exemption keeps it green.
    const text = persona("A woman. [Female](position_female.md)");
    const errors = validateInstanceFile(text, { baseDir: root, requirements });
    expect(errors).toEqual([]);
  });
});

// --- project mode: discover + validate a consuming repo on disk -----------
describe("project: validateProject discovers and enforces", () => {
  // Build a throwaway consumer project in a temp dir: gender "installed" via a
  // node_modules manifest, two persona instances (one wired, one not).
  const fixtureRoot = join(tmpdir(), `khai-proj-${process.pid}`);
  const contentDir = join(fixtureRoot, "content");
  const engineDir = join(fixtureRoot, "node_modules", "@chbrain", "khai-engine-gender");

  const personaFile = (name, projection) => `---
khai: persona
license: CC-BY-NC-4.0
stamp:
  owner: Demo
  version: v0.1.0
  date: "2026-01-01"
---

# Persona: ${name}

## Title
${name}

## Owner
- Project: demo

## Projection
${projection}

## Action
They move.

## Shadow
They cannot see the cost.

## Tell
A held breath.
`;

  beforeAll(() => {
    mkdirSync(contentDir, { recursive: true });
    mkdirSync(engineDir, { recursive: true });
    // Minimal installed-engine manifest carrying the gender requirement.
    writeFileSync(
      join(engineDir, "package.json"),
      JSON.stringify({
        name: "@chbrain/khai-engine-gender",
        khai: {
          engine: "gender",
          type: "position",
          anchor: "position_gender.md",
          expressions: { male: "position_male.md", female: "position_female.md" },
          requires: [{ on: "persona", section: "Projection", link: "expression" }],
        },
      }),
    );
    writeFileSync(
      join(contentDir, "ada.md"),
      personaFile("Ada", "A woman. [Female](position_female.md)"),
    );
    writeFileSync(join(contentDir, "sam.md"), personaFile("Sam", "Someone, ungendered."));
  });

  afterAll(() => rmSync(fixtureRoot, { recursive: true, force: true }));

  it("flags only the persona missing its gender wiring", () => {
    const results = validateProject({ root: fixtureRoot });
    const failing = results.map((r) => r.file.split("/").pop());
    expect(failing).toEqual(["sam.md"]);
    expect(results[0].errors.some((e) => e.includes("wiring(gender)"))).toBe(true);
  });
});

// --- WIRES card: every engine must declare a valid card -------------------
// The canon owns the card shape (khai-arch engineCard); validateEnginePackage
// surfaces it, so an engine whose manifest carries no card fails the kit.
describe("engine card: validateEnginePackage enforces a valid WIRES card", () => {
  const cardlessDir = join(tmpdir(), `khai-cardless-${process.pid}`);

  beforeAll(() => {
    mkdirSync(cardlessDir, { recursive: true });
    writeFileSync(
      join(cardlessDir, "package.json"),
      JSON.stringify({
        name: "@chbrain/khai-engine-nocard",
        khai: {
          engine: "nocard",
          type: "position",
          anchor: "position_nocard.md",
          expressions: {},
        },
      }),
    );
  });

  afterAll(() => rmSync(cardlessDir, { recursive: true, force: true }));

  it("flags an engine whose manifest carries no card", async () => {
    const errors = flatten(await validateEnginePackage(cardlessDir));
    expect(errors.some((e) => e.includes("WIRES card"))).toBe(true);
  });
});
