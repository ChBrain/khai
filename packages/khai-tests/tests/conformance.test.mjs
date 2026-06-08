import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, basename } from "node:path";
import { mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import {
  discoverEnginePackages,
  validateEnginePackage,
  validateContentFile,
  validateInstanceFile,
  validateProject,
  validatePlayhouseRegistry,
  buildRegistry,
  verifyRegistry,
  wiringRequirements,
  engineDocChecks,
  findEnginePackageFor,
} from "../index.mjs";
import { renderEngineReadme } from "@chbrain/khai-arch";

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
    // A REFERENCES with no frontmatter, a backticked (unlinked) member, a clause
    // dash, and an em-dash - four docs-standard violations, zero canon errors.
    writeFileSync(
      join(dir, "REFERENCES.md"),
      "# Refs\n\n**Authorship:** someone\n\nMaps `position_x.md` - the anchor — really.\n",
    );
    // A card whose prose carries the LLM dash family (the website renders this).
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        name: "x",
        khai: { engine: "x", card: { wire: "binds at Position - the seam", issue: "two — three" } },
      }),
    );
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it("reports docs-standard violations as warnings, never errors", () => {
    const results = engineDocChecks(dir);
    const warnings = results.flatMap((r) => r.warnings);
    expect(results.every((r) => r.errors.length === 0)).toBe(true);
    expect(warnings.some((w) => /clause dash/.test(w))).toBe(true);
    expect(warnings.some((w) => /en\/em-dash/.test(w))).toBe(true);
    expect(warnings.some((w) => /frontmatter/.test(w))).toBe(true);
    expect(warnings.some((w) => /loose file/.test(w))).toBe(true);
  });

  it("holds the WIRES card prose to the voice (clause dash + em/en)", () => {
    const results = engineDocChecks(dir);
    const cardFindings = results.filter((r) => r.file.startsWith("package.json#card."));
    expect(cardFindings.some((r) => /card\.wire/.test(r.file))).toBe(true); // " - " clause dash
    expect(
      cardFindings.some(
        (r) => r.file.includes("card.issue") && r.warnings.some((w) => /em-dash/.test(w)),
      ),
    ).toBe(true);
    expect(cardFindings.every((r) => r.errors.length === 0)).toBe(true);
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

## Taxonomy
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

// --- section contract: Taxonomy/Owner track the "TO ___" mnemonic ---------
describe("section contract: Taxonomy and Owner track the TO mnemonic", () => {
  // The full section list spells the mnemonic. A "TO ___" type carries Taxonomy
  // (T, the group above) and Owner (O) ahead of its chapters; a type whose
  // mnemonic does not begin with "TO " (instructions=HACKS, play=ENACTS,
  // engines=WIRE) carries neither -- its chapters spell the whole word. The kit
  // derives this from the canon, so it must not demand Taxonomy/Owner of a
  // non-TO type.
  const front = `---
khai: instructions
title: World
license: CC-BY-NC-4.0
stamp:
  owner: A World
  version: v0.1.0
  date: "2026-01-01"
---
`;
  const chapters = `## Human
The human sets intent.

## Agent
The agent executes.

## Collaboration
They iterate together.

## Knowledge
Nothing linked here.

## System
The runtime hosts it.
`;

  it("a non-TO type is valid with no Taxonomy or Owner", () => {
    const text = `${front}\n# Instructions: World\n\n${chapters}`;
    expect(validateContentFile(text, { type: "instructions" })).toEqual([]);
  });

  it("a non-TO type carrying Taxonomy/Owner is rejected as drift", () => {
    const text = `${front}\n# Instructions: World\n\n## Taxonomy\nWorld\n\n## Owner\n- Project: w\n\n${chapters}`;
    const errors = validateContentFile(text, { type: "instructions" });
    expect(errors.some((e) => e.includes("H2 sections must be exactly"))).toBe(true);
  });

  // The Title -> Taxonomy rename has landed end to end, so the migration
  // tolerance that accepted the legacy "Title" spelling of the T slot is gone:
  // a TO type must now spell the slot "Taxonomy", and "Title" is drift.
  it("a TO type using the legacy Title spelling is rejected (tolerance retired)", () => {
    const personaFront = `---
khai: persona
title: Ada
license: CC-BY-NC-4.0
stamp:
  owner: A World
  version: v0.1.0
  date: "2026-01-01"
type: fictional
---
`;
    const persona = (slot) =>
      `${personaFront}\n# Persona: Ada\n\n## ${slot}\nAda\n\n## Owner\n- Project: w\n\n## Projection\nx\n\n## Action\nx\n\n## Shadow\nx\n\n## Tell\nx\n`;
    expect(validateContentFile(persona("Taxonomy"), { type: "persona" })).toEqual([]);
    expect(
      validateContentFile(persona("Title"), { type: "persona" }).some((e) =>
        e.includes("H2 sections must be exactly"),
      ),
    ).toBe(true);
  });
});

// --- wiring: engine declares, kit enforces on a consumer instance ---------
describe("wiring: engine requirements enforced on instances", () => {
  // The gender engine declares: every persona must link a gender expression
  // under Projection. We synthesise that requirement and a consumer persona.
  const genderManifest = {
    engine: "gender",
    type: "position",
    anchor: "position_gender.md",
    expressions: { male: "position_male.md", female: "position_female.md" },
    requires: [{ on: "persona", section: "Projection", link: "expression" }],
  };
  const requirements = wiringRequirements([genderManifest]);

  const persona = (projectionBody) => `---
khai: persona
title: Ada
license: CC-BY-NC-4.0
stamp:
  owner: A Consumer
  version: v0.1.0
  date: "2026-01-01"
type: fictional
---

# Persona: Ada

## Taxonomy
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

  it("derives the requirement from the engine manifest (with id + default level)", () => {
    expect(requirements).toEqual([
      {
        id: "gender:persona:Projection",
        engine: "gender",
        on: "persona",
        section: "Projection",
        level: "fail",
        targets: new Set(["position_male.md", "position_female.md"]),
      },
    ]);
  });

  it("resolves link targets from a members ladder (anchor = root, expression = leaves)", () => {
    // A process ladder declared with explicit members, not the shorthand: the
    // resolver must read the tree, so "anchor" is the single root and
    // "expression" is the leaves only (never the intermediate channel).
    const ladder = {
      engine: "demo",
      type: "process",
      members: [
        { file: "process_root.md", type: "process", parent: null },
        { file: "process_channel.md", type: "process", parent: "process_root.md" },
        { file: "process_channel_leaf.md", type: "process", parent: "process_channel.md" },
      ],
      requires: [
        { on: "instructions", section: "Knowledge", link: "anchor" },
        { on: "persona", section: "Projection", link: "expression" },
      ],
    };
    const bySection = Object.fromEntries(
      wiringRequirements([ladder]).map((r) => [r.section, r.targets]),
    );
    expect(bySection.Knowledge).toEqual(new Set(["process_root.md"]));
    expect(bySection.Projection).toEqual(new Set(["process_channel_leaf.md"]));
  });

  it("passes a persona that links a gender expression in Projection", () => {
    const text = persona("A woman in a boardroom. [Female](position_female.md)");
    expect(validateInstanceFile(text, { requirements })).toEqual([]);
  });

  it("rejects a persona with no gender link (default level: fail)", () => {
    const text = persona("A woman in a boardroom.");
    const findings = validateInstanceFile(text, { requirements });
    const f = findings.find((x) => x.message.includes("wiring(gender)"));
    expect(f).toBeDefined();
    expect(f.message).toContain("Projection");
    expect(f.level).toBe("fail");
  });

  it("rejects a gender link in the wrong section", () => {
    const text = persona("A woman in a boardroom.").replace(
      "## Action\nShe ships.",
      "## Action\nShe ships. [Female](position_female.md)",
    );
    const findings = validateInstanceFile(text, { requirements });
    expect(findings.some((f) => f.message.includes("wiring(gender)"))).toBe(true);
  });

  it("does not impose gender wiring on a non-persona instance", () => {
    // `on: persona` only — a different type is untouched by this requirement.
    const reqForPlot = wiringRequirements([
      { ...genderManifest, requires: [{ on: "plot", section: "Cast", link: "expression" }] },
    ]);
    const text = persona("No gender here.");
    expect(
      validateInstanceFile(text, { requirements: reqForPlot }).some((f) =>
        f.message.includes("wiring"),
      ),
    ).toBe(false);
  });

  it("exempts the wiring link from the local broken-link check", () => {
    const text = persona("A woman. [Female](position_female.md)");
    expect(validateInstanceFile(text, { baseDir: root, requirements })).toEqual([]);
  });

  it("the engine's declared level rides through, and a world override wins", () => {
    const text = persona("A woman in a boardroom."); // missing the link -> the requirement fires
    // engine declares warn: the missing link is advisory, not a failure
    const warnReqs = wiringRequirements([
      {
        ...genderManifest,
        requires: [{ on: "persona", section: "Projection", link: "expression", level: "warn" }],
      },
    ]);
    expect(validateInstanceFile(text, { requirements: warnReqs })[0].level).toBe("warn");
    // world overrides that same requirement to audit (by id)
    const overridden = validateInstanceFile(text, {
      requirements: warnReqs,
      levels: { "gender:persona:Projection": "audit" },
    });
    expect(overridden[0].level).toBe("audit");
  });

  it("an engine's instructions-altitude requirement rides at its declared level", () => {
    // An engine declares how it is enabled: a link to its anchor under the
    // world's Knowledge section. Declared `audit`, so a missing link only notes.
    const reqs = wiringRequirements([
      {
        engine: "demo",
        type: "position",
        anchor: "anchor.md",
        requires: [{ on: "instructions", section: "Knowledge", link: "anchor", level: "audit" }],
      },
    ]);
    // A structurally valid instructions instance (full canon H2 set) that simply
    // never links the engine anchor, so only the wiring requirement fires.
    const instructions = `---
khai: instructions
title: World
license: CC-BY-NC-4.0
stamp:
  owner: A World
  version: v0.1.0
  date: "2026-01-01"
---

# Instructions: World

## Human
The human sets intent.

## Agent
The agent executes.

## Collaboration
They iterate together.

## Knowledge
Nothing linked here.

## System
The runtime hosts it.
`;
    const findings = validateInstanceFile(instructions, { requirements: reqs });
    expect(findings.length).toBeGreaterThan(0); // the missing anchor link fired
    expect(findings.every((f) => f.level === "audit")).toBe(true); // never a failure
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
title: ${name}
license: CC-BY-NC-4.0
stamp:
  owner: Demo
  version: v0.1.0
  date: "2026-01-01"
type: fictional
---

# Persona: ${name}

## Taxonomy
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
    const failing = results.map((r) => basename(r.file));
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

// --- reference (LORE): every engine must ship a conforming REFERENCES.md ----
// The canon owns the shape (khai-arch referenceCard); validateEnginePackage
// surfaces it, so an engine whose warrant breaks the LORE chapter set fails.
describe("reference: validateEnginePackage enforces the LORE standard", () => {
  const dir = join(tmpdir(), `khai-lore-${process.pid}`);

  beforeAll(() => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        name: "@chbrain/khai-engine-noref",
        khai: {
          engine: "noref",
          type: "position",
          anchor: "position_noref.md",
          expressions: {},
          card: {
            wire: "binds at Position",
            issue: "one ready read a persona may hold",
            require: "declared once, carried per instance",
            enforce: "structure is checked, coherence is judged",
            setup: "declare the law, then carry the read",
          },
        },
      }),
    );
    // Present, but not the LORE chapter set -- the old free-form headings.
    writeFileSync(
      join(dir, "REFERENCES.md"),
      "---\nupdated: x\n---\n\n# Refs\n\n## Domain\n\nfoo\n\n## Sources\n\nbar\n",
    );
  });

  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it("flags a REFERENCES.md whose chapters are not LORE", async () => {
    const errors = flatten(await validateEnginePackage(dir));
    expect(errors.some((e) => e.includes("reference (LORE)"))).toBe(true);
  });
});

// --- README: generated, never hand-edited; the kit regenerates and diffs ----
describe("engine README: validateEnginePackage enforces the generated README", () => {
  const dir = join(tmpdir(), `khai-readme-${process.pid}`);
  const pkg = {
    name: "@chbrain/khai-engine-demo",
    description: "a demo engine",
    license: "CC-BY-NC-4.0",
    khai: {
      engine: "demo",
      tagline: "Demo as position: it shows the shape.",
      type: "position",
      anchor: "position_demo.md",
      expressions: {},
      card: {
        wire: "binds at Position",
        issue: "one ready read",
        require: "declared once, carried per instance",
        enforce: "structure checked, meaning reviewed",
        setup: "declare it, then carry it",
      },
    },
  };

  beforeAll(() => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "package.json"), JSON.stringify(pkg));
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  const readmeErrors = async () =>
    (await validateEnginePackage(dir))
      .filter((r) => r.file === "README.md")
      .flatMap((r) => r.errors);

  it("flags a missing README", async () => {
    rmSync(join(dir, "README.md"), { force: true });
    expect((await readmeErrors()).some((e) => /missing/.test(e))).toBe(true);
  });

  it("flags a README that drifted from the manifest", async () => {
    writeFileSync(join(dir, "README.md"), "# Demo\n\nhand-edited, wrong.\n");
    expect((await readmeErrors()).some((e) => /drifted/.test(e))).toBe(true);
  });

  it("passes a README rendered from the manifest (no README error)", async () => {
    writeFileSync(join(dir, "README.md"), renderEngineReadme(pkg));
    expect(await readmeErrors()).toEqual([]);
  });
});

// --- play contract: ENACTS chapter structure validated ---------------------
describe("play contract: ENACTS chapter structure validated", () => {
  const front = `---
khai: play
title: Woyzeck
license: CC-BY-NC-SA-4.0
stamp:
  owner: Buechner
  version: v0.0.1
  date: "2026-06-06"
---
`;
  const validPlay = `${front}\n# Play: Woyzeck\n\n## Estate\nbuechner\n\n## Name\nWoyzeck\n\n## Arc\narc\n\n## Company\ncompany\n\n## Triggers\ntriggers\n\n## Stakes\nstakes\n`;

  it("passes a play file with correct ENACTS chapters", () => {
    expect(validateContentFile(validPlay, { type: "play" })).toEqual([]);
  });

  it("requires declared and H1 match for non-english play", () => {
    const germanPlayWithoutDeclared = `---
khai: play
title: "Correspondence"
license: CC-BY-NC-SA-4.0
stamp:
  owner: Buechner
  version: v0.0.1
  date: "2026-06-06"
---

# Play: Briefwechsel

## Estate
buechner

## Name
Briefwechsel

## Arc
arc

## Company
company

## Triggers
triggers

## Stakes
stakes
`;
    expect(
      validateContentFile(germanPlayWithoutDeclared, { type: "play", resolvedLanguage: "german" }),
    ).toContain("frontmatter missing `declared` for non-english play");

    const germanPlayWithDeclared = germanPlayWithoutDeclared.replace(
      'title: "Correspondence"',
      'title: "Correspondence"\ndeclared: "Briefwechsel"',
    );
    expect(
      validateContentFile(germanPlayWithDeclared, { type: "play", resolvedLanguage: "german" }),
    ).toEqual([]);

    const germanPlayWithMismatchedDeclared = germanPlayWithoutDeclared.replace(
      'title: "Correspondence"',
      'title: "Correspondence"\ndeclared: "Mismatched"',
    );
    expect(
      validateContentFile(germanPlayWithMismatchedDeclared, {
        type: "play",
        resolvedLanguage: "german",
      }).some((e) => e.includes('must match the H1 name "Briefwechsel"')),
    ).toBe(true);
  });

  it("rejects a play file with missing chapters", () => {
    const brokenPlay = validPlay.replace("## Stakes\nstakes\n", "");
    const errors = validateContentFile(brokenPlay, { type: "play" });
    expect(errors.some((e) => e.includes("play (ENACTS):"))).toBe(true);
  });

  it("rejects a play file with foreign chapters", () => {
    const brokenPlay = `${validPlay}\n## Synopsis\nSynopsis content\n`;
    const errors = validateContentFile(brokenPlay, { type: "play" });
    expect(errors.some((e) => e.includes("play (ENACTS):"))).toBe(true);
  });
});

// --- plan contract: TO DO IT chapter structure and pending checklist validated
describe("plan contract: TO DO IT chapter structure and pending checklist validated", () => {
  const front = `---
khai: plan
title: "Stage Dantons Tod"
license: CC-BY-NC-SA-4.0
stamp:
  owner: Choregos (Nicias and Pericles)
  version: v1.0.0
  date: "2026-06-06"
status: active
---
`;
  const validPlan = `${front}\n# Plan: Stage Dantons Tod\n\n## Taxonomy\nstaging\n\n## Owner\n- Project: buechner\n\n## Direction\nvision\n\n## Orders\ncommands\n\n## Implementation\nguidelines\n\n## Targets\n- [x] Target 1\n- [F] Target 2\n- [W] Target 3\n`;

  it("passes a completed plan with all targets checked off", () => {
    expect(validateContentFile(validPlan, { type: "plan" })).toEqual([]);
  });

  it("rejects a plan with pending targets", () => {
    const pendingPlan = `${validPlan}- [ ] Target 4\n`;
    const errors = validateContentFile(pendingPlan, { type: "plan" });
    expect(errors.some((e) => e.includes("plan has 1 pending target"))).toBe(true);
  });

  it("rejects a plan with missing chapters", () => {
    const brokenPlan = validPlan.replace(
      "## Targets\n- [x] Target 1\n- [F] Target 2\n- [W] Target 3\n",
      "",
    );
    const errors = validateContentFile(brokenPlan, { type: "plan" });
    expect(errors.some((e) => e.includes("plan (TO DO IT):"))).toBe(true);
  });

  it("rejects a plan with invalid status", () => {
    const brokenPlan = validPlan.replace("status: active", "status: invalid");
    const errors = validateContentFile(brokenPlan, { type: "plan" });
    expect(errors.some((e) => e.includes('frontmatter "status" must be one of'))).toBe(true);
  });
});

// --- order contract: DO IT chapter structure and pending checklist validated
describe("order contract: DO IT chapter structure and pending checklist validated", () => {
  const front = `---
khai: order
title: "Stage Dantons Tod"
license: CC-BY-NC-SA-4.0
stamp:
  owner: Choregos (Nicias and Pericles)
  version: v1.0.0
  date: "2026-06-06"
---
`;
  const validOrder = `${front}\n# Order: Stage Dantons Tod\n\n## Direction\nvision\n\n## Orders\ncommands\n\n## Implementation\nguidelines\n\n## Targets\n- [x] Target 1\n- [F] Target 2\n- [W] Target 3\n`;

  it("passes a completed order with all targets checked off", () => {
    expect(validateContentFile(validOrder, { type: "order" })).toEqual([]);
  });

  it("rejects an order with pending targets", () => {
    const pendingOrder = `${validOrder}- [ ] Target 4\n`;
    const errors = validateContentFile(pendingOrder, { type: "order" });
    expect(errors.some((e) => e.includes("order has 1 pending target"))).toBe(true);
  });

  it("rejects an order with missing chapters", () => {
    const brokenOrder = validOrder.replace(
      "## Targets\n- [x] Target 1\n- [F] Target 2\n- [W] Target 3\n",
      "",
    );
    const errors = validateContentFile(brokenOrder, { type: "order" });
    expect(errors.some((e) => e.includes("order (DO IT):"))).toBe(true);
  });
});

// --- playhouse registry: E2E validation gates ----------------------------
describe("conformance: playhouse registry gates", () => {
  let dir;

  beforeEach(() => {
    dir = join(
      tmpdir(),
      `khai-playhouse-${process.pid}-${Math.random().toString(36).substring(2)}`,
    );
    mkdirSync(dir, { recursive: true });
    mkdirSync(join(dir, "plays"), { recursive: true });
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("fails when registry.json is missing", () => {
    const res = validatePlayhouseRegistry(dir);
    expect(res.length).toBe(1);
    expect(res[0].errors[0]).toContain("missing registry.json");
  });

  it("fails on malformed JSON registry", () => {
    writeFileSync(join(dir, "registry.json"), "{ invalid JSON }");
    const res = validatePlayhouseRegistry(dir);
    expect(res.length).toBe(1);
    expect(res[0].errors[0]).toContain("failed to parse registry.json");
  });

  it("fails on invalid schema types", () => {
    writeFileSync(
      join(dir, "registry.json"),
      JSON.stringify({ name: 123, version: "0.1.0", plays: {} }),
    );
    const res = validatePlayhouseRegistry(dir);
    expect(res.length).toBe(1);
    expect(
      res[0].errors.some((e) => e.includes("registry.json must have a non-empty string 'name'")),
    ).toBe(true);
    expect(res[0].errors.some((e) => e.includes("registry.json must have a 'plays' array"))).toBe(
      true,
    );
  });

  it("validates bidirectional sync and blurb constraints", () => {
    // Write registry with play 'a' that has a description too short
    // and play 'b' that is missing on disk, while disk has subdir 'c' not in registry.
    writeFileSync(
      join(dir, "registry.json"),
      JSON.stringify({
        name: "test-house",
        version: "1.0.0",
        plays: [
          { id: "a", title: "Play A", description: "Too short." },
          { id: "b", title: "Play B", description: "This is a valid blurb description." },
        ],
      }),
    );

    mkdirSync(join(dir, "plays", "a"), { recursive: true });
    mkdirSync(join(dir, "plays", "c"), { recursive: true });

    const res = validatePlayhouseRegistry(dir);
    expect(res.length).toBe(1);
    const errs = res[0].errors;

    // a description too short (10 characters minimum: "Too short." is 10 characters? Wait, "Too short." has length 10.
    // Let's make it shorter: "Short." which is 6 characters.
  });

  it("validates all blurb gate rule details", () => {
    mkdirSync(join(dir, "plays", "valid_play"), { recursive: true });

    const testDescription = (desc) => {
      writeFileSync(
        join(dir, "registry.json"),
        JSON.stringify({
          name: "test-house",
          version: "1.0.0",
          plays: [{ id: "valid_play", title: "Valid Play", description: desc }],
        }),
      );
      const res = validatePlayhouseRegistry(dir);
      return res.length > 0 ? res[0].errors : [];
    };

    // Valid blurb: length between 10 and 120, one sentence ending in period
    expect(testDescription("This is a valid blurb description.")).toEqual([]);

    // Valid with code formatting
    expect(testDescription("This is a `valid` description with `code.js` in it.")).toEqual([]);

    // Too short
    expect(testDescription("Short.")).toContain(
      'play "valid_play" description must be between 10 and 120 characters (got 6)',
    );

    // Too long (>120 chars)
    expect(
      testDescription(
        "This is a very long description that is designed to exceed the limit of one hundred and twenty characters which is the maximum allowed length.".repeat(
          2,
        ),
      ),
    ).toBeDefined();

    // Multiple sentences
    expect(testDescription("This is one sentence. This is two.")).toContain(
      'play "valid_play" description must consist of exactly one sentence (ending in a period ".")',
    );

    // Trailing ellipses
    expect(testDescription("This has trailing ellipses...")).toContain(
      'play "valid_play" description must consist of exactly one sentence ending in a period',
    );

    // HTML tags
    expect(testDescription("This contains <p>HTML</p> tags.")).toContain(
      'play "valid_play" description must not contain HTML tags',
    );

    // Markdown bold/italics/links
    expect(testDescription("This contains **bold** formatting.")).toContain(
      'play "valid_play" description must not contain markdown formatting (other than inline code formatting if needed)',
    );
    expect(testDescription("This contains [link](url) formatting.")).toContain(
      'play "valid_play" description must not contain markdown formatting (other than inline code formatting if needed)',
    );
  });

  it("checks title alignment", () => {
    mkdirSync(join(dir, "plays", "aligned"), { recursive: true });
    writeFileSync(
      join(dir, "registry.json"),
      JSON.stringify({
        name: "test-house",
        version: "1.0.0",
        plays: [{ id: "aligned", title: "Aligned Play", description: "Valid blurb description." }],
      }),
    );

    // Write play file with misaligned title
    writeFileSync(
      join(dir, "plays", "aligned", "play_aligned.md"),
      `---
khai: play
title: "Misaligned Play Name"
license: MIT
stamp:
  owner: test
  version: 1.0.0
  date: 2026-06-07
---
# Play: Misaligned Play Name
`,
    );

    const res = validatePlayhouseRegistry(dir);
    expect(res.length).toBe(1);
    expect(
      res[0].errors.some((e) =>
        e.includes(
          'title in playbook frontmatter ("Misaligned Play Name") does not match title in registry.json ("Aligned Play")',
        ),
      ),
    ).toBe(true);

    // Now align it
    writeFileSync(
      join(dir, "plays", "aligned", "play_aligned.md"),
      `---
khai: play
title: "Aligned Play"
license: MIT
stamp:
  owner: test
  version: 1.0.0
  date: 2026-06-07
---
# Play: Aligned Play
`,
    );
    expect(validatePlayhouseRegistry(dir)).toEqual([]);
  });
});

describe("conformance: registry utility functions", () => {
  let dir;

  beforeEach(() => {
    dir = join(
      tmpdir(),
      `khai-registry-util-${process.pid}-${Math.random().toString(36).substring(2)}`,
    );
    mkdirSync(dir, { recursive: true });
    mkdirSync(join(dir, "plays"), { recursive: true });
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("builds and verifies a registry.json correctly from plays directory", () => {
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "my-house", version: "2.3.4" }),
    );

    mkdirSync(join(dir, "plays", "play_a"), { recursive: true });
    writeFileSync(
      join(dir, "plays", "play_a", "play_play_a.md"),
      `---
khai: play
title: "Play A Title"
license: MIT
stamp:
  owner: test
  version: 1.0.0
  date: 2026-06-07
---
# Play A

## Arc

This is a single sentence description.
`,
    );

    buildRegistry(dir);

    const registry = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
    expect(registry.name).toBe("my-house");
    expect(registry.version).toBe("2.3.4");
    expect(registry.plays.length).toBe(1);
    expect(registry.plays[0].id).toBe("play_a");
    expect(registry.plays[0].title).toBe("Play A Title");
    expect(registry.plays[0].description).toBe("This is a single sentence description.");

    // Verify also works on build output
    const verifyRes = verifyRegistry(dir);
    expect(verifyRes.ok).toBe(true);
  });
});

// --- build/verify consistency (PR #264) -----------------------------------
// These assert the build->verify alignment fixes. They are dormant until the
// source change lands on main: we probe the source text for sentinels that
// only exist after the fix, mirroring the cli.test.mjs convention.
const consistencySrcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const DORMANT_CONSISTENCY = !(
  readFileSync(join(consistencySrcDir, "validate.mjs"), "utf8").includes(
    "doc.data.title || play.id",
  ) &&
  readFileSync(join(consistencySrcDir, "registry.mjs"), "utf8").includes(
    "does not yet pass verification",
  )
);

describe.skipIf(DORMANT_CONSISTENCY)("conformance: registry build/verify consistency", () => {
  let dir;

  beforeEach(() => {
    dir = join(
      tmpdir(),
      `khai-registry-consistency-${process.pid}-${Math.random().toString(36).substring(2)}`,
    );
    mkdirSync(dir, { recursive: true });
    mkdirSync(join(dir, "plays"), { recursive: true });
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "house", version: "1.0.0" }));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("build -> verify is idempotent when frontmatter omits title", () => {
    // No `title` in frontmatter: buildRegistry falls back to the dir id, and
    // verify must apply the same fallback rather than comparing against
    // undefined (which is what regressed before the fix).
    mkdirSync(join(dir, "plays", "intro"), { recursive: true });
    writeFileSync(
      join(dir, "plays", "intro", "play_intro.md"),
      `---
khai: play
---
# Intro

## Arc

This is a single sentence description of the play.
`,
    );

    buildRegistry(dir);

    const registry = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
    expect(registry.plays[0].title).toBe("intro");
    expect(verifyRegistry(dir).ok).toBe(true);
  });

  it("title alignment finds a playbook not named play_<id>.md", () => {
    // The playbook lives at plays/welcome/play_intro.md, not play_welcome.md.
    // The old verify hard-coded play_<id>.md and silently skipped the check;
    // with shared discovery it must catch the title mismatch.
    mkdirSync(join(dir, "plays", "welcome"), { recursive: true });
    writeFileSync(
      join(dir, "plays", "welcome", "play_intro.md"),
      `---
khai: play
title: "Real Title"
---
# Welcome
`,
    );
    writeFileSync(
      join(dir, "registry.json"),
      JSON.stringify({
        name: "house",
        version: "1.0.0",
        plays: [{ id: "welcome", title: "Wrong Title", description: "Valid blurb description." }],
      }),
    );

    const res = validatePlayhouseRegistry(dir);
    expect(res.length).toBe(1);
    expect(
      res[0].errors.some((e) =>
        e.includes('does not match title in registry.json ("Wrong Title")'),
      ),
    ).toBe(true);
  });

  it("buildRegistry warns (without throwing) when a blurb fails the verify gate", () => {
    // No `## Arc` section -> empty description -> fails the length gate. Build
    // must still succeed and surface the would-be verify failure as a warning.
    mkdirSync(join(dir, "plays", "bare"), { recursive: true });
    writeFileSync(
      join(dir, "plays", "bare", "play_bare.md"),
      `---
khai: play
title: "Bare Play"
---
# Bare Play
`,
    );

    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(" "));
    try {
      expect(() => buildRegistry(dir)).not.toThrow();
    } finally {
      console.warn = originalWarn;
    }

    // registry.json is still written
    expect(existsSync(join(dir, "registry.json"))).toBe(true);
    expect(warnings.some((w) => w.includes("does not yet pass verification"))).toBe(true);
  });

  it("early-return validation results carry the errors/warnings/audit shape", () => {
    // Missing registry.json: the early return must match the shape the other
    // validateProject results use, so consumers reading .warnings/.audit are safe.
    const res = validatePlayhouseRegistry(dir);
    expect(res.length).toBe(1);
    expect(Array.isArray(res[0].errors)).toBe(true);
    expect(Array.isArray(res[0].warnings)).toBe(true);
    expect(Array.isArray(res[0].audit)).toBe(true);
  });
});

// A malformed package.json must not crash the validator (PR #279). Dormant until
// the readJsonOr guard lands on main -- probe src/validate.mjs for it, per the
// cli.test.mjs convention.
const JSON_DORMANT = !readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "src", "validate.mjs"),
  "utf8",
).includes("function readJsonOr");

describe.skipIf(JSON_DORMANT)("conformance: malformed package.json is non-fatal", () => {
  let dir;

  beforeEach(() => {
    dir = join(tmpdir(), `khai-badpkg-${process.pid}-${Math.random().toString(36).substring(2)}`);
    mkdirSync(join(dir, "child"), { recursive: true });
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("findEnginePackageFor walks past a malformed package.json instead of throwing", () => {
    // Valid engine manifest at the root; a malformed one in the child we start from.
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "e", khai: { engine: "e" } }));
    writeFileSync(join(dir, "child", "package.json"), "{ not: valid json ]");
    writeFileSync(join(dir, "child", "persona_x.md"), "---\nkhai: persona\n---\n");

    let found;
    expect(() => {
      found = findEnginePackageFor(join(dir, "child", "persona_x.md"));
    }).not.toThrow();
    expect(found).toBe(dir);
  });

  it("validateEnginePackage reports a malformed package.json as a finding, not a crash", async () => {
    writeFileSync(join(dir, "package.json"), "{ not: valid json ]");
    let results;
    expect(async () => {
      results = await validateEnginePackage(dir);
    }).not.toThrow();
    results = await validateEnginePackage(dir);
    expect(results[0].errors.some((e) => /cannot read or parse package\.json/.test(e))).toBe(true);
  });
});
