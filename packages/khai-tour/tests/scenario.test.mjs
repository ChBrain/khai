import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// Dormant until the scenario station lands: source and tests are separate
// PRs (the house rule), so this suite skips entirely while ../lib/scenario.mjs
// does not exist on the branch, and wakes on its own once it does.
const DORMANT = !existsSync(new URL("../lib/scenario.mjs", import.meta.url));
let buildScenarioBundle, packScenario, resolveScenarioName, loadHouseCollections, discoverEngines;
if (!DORMANT) {
  ({
    buildScenarioBundle,
    packScenario,
    resolveScenarioName,
    loadHouseCollections,
    discoverEngines,
  } = await import("../lib/scenario.mjs"));
}

// A small, entirely synthetic fixture (never khai-cultures content): a
// two-collection mock house with a deliberate name collision, a one-engine
// mock installed-package ladder, and a mock scenario folder that borrows from
// both and is widened by the engine.

let houseDir;
let engineRoot; // a sandboxed node_modules root carrying one fake engine
let emptyRoot; // a root with no node_modules/@chbrain at all -- deterministic "no engines"
let scenarioDir; // the happy-path scenario
let outputDir;

const HOME_URL = "https://github.com/fixture/khai-house/blob/main";

function write(dir, relPath, content) {
  const full = join(dir, relPath);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, content);
}

beforeAll(() => {
  houseDir = mkdtempSync(join(tmpdir(), "khai-scn-house-"));
  engineRoot = mkdtempSync(join(tmpdir(), "khai-scn-engineroot-"));
  emptyRoot = mkdtempSync(join(tmpdir(), "khai-scn-emptyroot-"));
  scenarioDir = mkdtempSync(join(tmpdir(), "khai-scn-scenario-"));
  outputDir = mkdtempSync(join(tmpdir(), "khai-scn-out-"));

  // --- mock house: two mini collections under one "cultures" array ---
  write(
    houseDir,
    "registry.json",
    JSON.stringify({
      name: "@fixture/house",
      cultures: [
        { kind: "culture", id: "alpha" },
        { kind: "culture", id: "beta" },
      ],
    }),
  );
  write(
    houseDir,
    "cultures/alpha/persona_a.md",
    `---\nkhai: persona\ntitle: "A"\n---\n\n# Persona: A\n\nSpeaks of [Alpha Only](position_alpha_only.md) and [Alpha Extra](position_alpha_extra.md).\nKnows the far tongue too: [Leaf](process_leaf.md).\nAlso aware of [Beta Only](../beta/position_beta_only.md).\n`,
  );
  write(
    houseDir,
    "cultures/alpha/position_alpha_only.md",
    "# Position: Alpha Only\n\nHeld only in alpha.\n",
  );
  write(
    houseDir,
    "cultures/alpha/position_alpha_extra.md",
    "# Position: Alpha Extra\n\nNot pulled into the Company; only linked from within alpha.\n",
  );
  write(
    houseDir,
    "cultures/alpha/position_shared.md",
    "# Position: Shared (alpha)\n\nThe alpha version.\n",
  );
  write(
    houseDir,
    "cultures/beta/position_shared.md",
    "# Position: Shared (beta)\n\nThe beta version.\n",
  );
  write(
    houseDir,
    "cultures/beta/position_beta_only.md",
    "# Position: Beta Only\n\nHeld only in beta.\n",
  );
  write(houseDir, "LICENSE", "Fixture house licence text.\n");

  // --- mock installed engine: a tiny 3-deep ladder plus one un-widened sibling ---
  const enginePkgDir = join(engineRoot, "node_modules/@chbrain/khai-engine-testlang");
  write(
    engineRoot,
    "node_modules/@chbrain/khai-engine-testlang/package.json",
    JSON.stringify({
      name: "@chbrain/khai-engine-testlang",
      version: "0.0.1",
      khai: {
        engine: "testlang",
        members: [
          { file: "process_root.md", type: "process", parent: null },
          { file: "process_channel.md", type: "process", parent: "process_root.md" },
          { file: "process_leaf.md", type: "process", parent: "process_channel.md" },
          { file: "process_sibling.md", type: "process", parent: "process_root.md" },
        ],
      },
      repository: {
        type: "git",
        url: "git+https://github.com/example/khai-fixture.git",
        directory: "packages/engines/testlang",
      },
    }),
  );
  write(
    engineRoot,
    "node_modules/@chbrain/khai-engine-testlang/process_root.md",
    "# Process: Root\n\nThe root of the ladder. Links [Channel](process_channel.md).\n",
  );
  write(
    engineRoot,
    "node_modules/@chbrain/khai-engine-testlang/process_channel.md",
    "# Process: Channel\n\nLinks [Leaf](process_leaf.md) and back to [Root](process_root.md). Also aware of a sibling it does not itself need: [Sibling](process_sibling.md).\n",
  );
  write(
    engineRoot,
    "node_modules/@chbrain/khai-engine-testlang/process_leaf.md",
    "# Process: Leaf\n\nThe leaf a persona directly links.\n",
  );
  write(
    engineRoot,
    "node_modules/@chbrain/khai-engine-testlang/process_sibling.md",
    "# Process: Sibling\n\nA sibling channel, never widened into this particular bundle.\n",
  );
  void enginePkgDir;

  // --- mock scenario folder (built content + Company/Triggers referencing the house + engine) ---
  write(
    scenarioDir,
    "play_test.md",
    `# Play: Test Scenario

## Estate

[fixture house](https://example.com/house): a synthetic house used only to test khai-tour's scenario station.

## Name

Test Scenario: a minimal scenario exercising resolve, widen, rewrite, gate, and pack.

## Arc

One persona borrowed from the house, one position borrowed from the house, one piece built for the scenario, and one engine ladder widened in through a language link.

## Company

**Personas**

- [Persona A](persona_a.md): borrowed from alpha.

**Positions**

- [Alpha Only](position_alpha_only.md): borrowed from alpha.

**Pieces**

- [Test Piece](piece_test.md): built for this scenario.

## Triggers

**[Plot 1: Opening](plot_01_test.md)**

The single plot for this test.

## Stakes

Whether the bundle assembles correctly.
`,
  );
  write(
    scenarioDir,
    "piece_test.md",
    '---\nkhai: piece\ntitle: "Test Piece"\n---\n\n# Piece: Test Piece\n\nThe piece at stake, linking back to [Persona A](persona_a.md).\n',
  );
  write(
    scenarioDir,
    "plot_01_test.md",
    "# Plot 1: Opening\n\nThe plot body. Links [Persona A](persona_a.md) again.\n",
  );
  write(
    scenarioDir,
    "README.md",
    "# Test Scenario\n\nA scenario used only to test khai-tour's scenario station.\n",
  );
  write(
    scenarioDir,
    "REFERENCES.md",
    "# References\n\nBorrowed from alpha; widened via the testlang engine ladder.\n",
  );
  write(scenarioDir, "LICENSE", "Fixture scenario licence text.\n");
});

afterAll(() => {
  for (const dir of [houseDir, engineRoot, emptyRoot, scenarioDir, outputDir]) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe.skipIf(DORMANT)("loadHouseCollections", () => {
  it("names one directory per registry entry, generic over the array key", () => {
    const collections = loadHouseCollections(houseDir);
    const byId = Object.fromEntries(collections.map((c) => [c.id, c]));
    expect(byId.alpha.key).toBe("cultures");
    expect(byId.alpha.dir).toBe(join(houseDir, "cultures", "alpha"));
    expect(byId.beta.key).toBe("cultures");
  });

  it("returns [] with no houseDir", () => {
    expect(loadHouseCollections(null)).toEqual([]);
  });
});

describe.skipIf(DORMANT)("discoverEngines", () => {
  it("reads the installed engine's khai manifest via khai-arch's engineMembers", () => {
    const engines = discoverEngines(engineRoot);
    expect(engines).toHaveLength(1);
    expect(engines[0].name).toBe("@chbrain/khai-engine-testlang");
    expect(engines[0].members.map((m) => m.file)).toContain("process_leaf.md");
  });

  it("returns [] when the root has no node_modules/@chbrain at all", () => {
    expect(discoverEngines(emptyRoot)).toEqual([]);
  });
});

describe.skipIf(DORMANT)("resolveScenarioName (verdicts)", () => {
  const houseCollections = () => loadHouseCollections(houseDir);
  const engines = () => discoverEngines(engineRoot);

  it("build: found in the scenario folder", () => {
    const r = resolveScenarioName("piece_test.md", {
      scenarioDir,
      houseCollections: houseCollections(),
      engines: engines(),
    });
    expect(r.verdict).toBe("build");
  });

  it("borrow: found in exactly one house collection", () => {
    const r = resolveScenarioName("position_alpha_only.md", {
      scenarioDir,
      houseCollections: houseCollections(),
      engines: engines(),
    });
    expect(r.verdict).toBe("borrow");
    expect(r.house.id).toBe("alpha");
  });

  it("borrow: found as an installed engine member", () => {
    const r = resolveScenarioName("process_leaf.md", {
      scenarioDir,
      houseCollections: houseCollections(),
      engines: engines(),
    });
    expect(r.verdict).toBe("borrow");
    expect(r.engine.name).toBe("@chbrain/khai-engine-testlang");
  });

  it("fail: found nowhere", () => {
    const r = resolveScenarioName("position_nonexistent.md", {
      scenarioDir,
      houseCollections: houseCollections(),
      engines: engines(),
    });
    expect(r.verdict).toBe("fail");
  });

  it("collision: found in more than one house collection, candidates listed, no guess", () => {
    const r = resolveScenarioName("position_shared.md", {
      scenarioDir,
      houseCollections: houseCollections(),
      engines: engines(),
    });
    expect(r.verdict).toBe("collision");
    expect(r.candidates.sort()).toEqual(["cultures/alpha", "cultures/beta"]);
  });

  it("qualifier resolves a collision to a borrow from the named lender", () => {
    const r = resolveScenarioName("position_shared.md", {
      scenarioDir,
      houseCollections: houseCollections(),
      engines: engines(),
      qualifier: "beta",
    });
    expect(r.verdict).toBe("borrow");
    expect(r.house.id).toBe("beta");
  });

  it("collection-qualified form (key/id) also resolves", () => {
    const r = resolveScenarioName("position_shared.md", {
      scenarioDir,
      houseCollections: houseCollections(),
      engines: engines(),
      qualifier: "cultures/alpha",
    });
    expect(r.verdict).toBe("borrow");
    expect(r.house.id).toBe("alpha");
  });

  it("qualifier naming a lender that does not hold the name is a fail, not a guess", () => {
    const r = resolveScenarioName("position_shared.md", {
      scenarioDir,
      houseCollections: houseCollections(),
      engines: engines(),
      qualifier: "gamma",
    });
    expect(r.verdict).toBe("fail");
  });
});

describe.skipIf(DORMANT)("buildScenarioBundle (happy path)", () => {
  let bundle;
  let byPath;

  beforeAll(() => {
    bundle = buildScenarioBundle({
      scenarioDir,
      houseDir,
      homeUrl: HOME_URL,
      root: engineRoot,
    });
    byPath = Object.fromEntries(bundle.entries.map((e) => [e.path, e]));
  });

  it("composes instructions and carries the root files", () => {
    expect(byPath["instructions.md"].role).toBe("instructions");
    expect(byPath["instructions.md"].content).toContain("## Knowledge");
    expect(byPath["README.md"].role).toBe("readme");
    expect(byPath["REFERENCES.md"].role).toBe("references");
    expect(byPath["LICENSE"].content).toBe("Fixture scenario licence text.\n");
  });

  it("bundles the built, the borrowed, and the widened engine ladder -- flat, no directories", () => {
    const paths = bundle.entries.map((e) => e.path);
    expect(paths.every((p) => !p.includes("/"))).toBe(true);
    expect(paths).toEqual(
      expect.arrayContaining([
        "play_test.md",
        "piece_test.md",
        "plot_01_test.md",
        "persona_a.md",
        "position_alpha_only.md",
        "process_root.md",
        "process_channel.md",
        "process_leaf.md",
      ]),
    );
    // the un-widened sibling never crosses one hop past the Company
    expect(paths).not.toContain("process_sibling.md");
  });

  it("strips frontmatter from every bundled md", () => {
    expect(byPath["persona_a.md"].content).not.toContain("khai: persona");
    expect(byPath["piece_test.md"].content).not.toContain("khai: piece");
    expect(byPath["piece_test.md"].content).toContain("# Piece: Test Piece");
  });

  it("flattens an in-bundle link to its bare basename", () => {
    expect(byPath["persona_a.md"].content).toContain("[Alpha Only](position_alpha_only.md)");
    expect(byPath["persona_a.md"].content).toContain("[Leaf](process_leaf.md)");
  });

  it("points a same-culture out-of-bundle link home", () => {
    expect(byPath["persona_a.md"].content).toContain(
      `[Alpha Extra](${HOME_URL}/cultures/alpha/position_alpha_extra.md)`,
    );
  });

  it("resolves a ../<id>/ cross-culture out-of-bundle link home", () => {
    expect(byPath["persona_a.md"].content).toContain(
      `[Beta Only](${HOME_URL}/cultures/beta/position_beta_only.md)`,
    );
  });

  it("points an un-widened engine sibling home to the engine's own repository", () => {
    expect(byPath["process_channel.md"].content).toContain(
      "[Sibling](https://github.com/example/khai-fixture/blob/main/packages/engines/testlang/process_sibling.md)",
    );
  });
});

describe.skipIf(DORMANT)("buildScenarioBundle (gate)", () => {
  it("rejects a play whose H2 sequence is not exactly Estate/Name/Arc/Company/Triggers/Stakes", () => {
    const dir = mkdtempSync(join(tmpdir(), "khai-scn-badgate-"));
    write(
      dir,
      "play_bad.md",
      "# Play: Bad Gate\n\n## Estate\n\nx\n\n## Name\n\nx\n\n## Company\n\n## Triggers\n\n## Stakes\n\nx\n",
    );
    expect(() => buildScenarioBundle({ scenarioDir: dir, root: emptyRoot })).toThrow("H2 sequence");
    rmSync(dir, { recursive: true, force: true });
  });

  it("rejects a bundled md containing an em-dash or en-dash", () => {
    const dir = mkdtempSync(join(tmpdir(), "khai-scn-dash-"));
    write(
      dir,
      "play_dash.md",
      "# Play: Dash\n\n## Estate\n\nx\n\n## Name\n\nx\n\n## Arc\n\nx\n\n## Company\n\n**Positions**\n\n- [With Dash](position_dash.md): has a dash.\n\n## Triggers\n\n**[Plot 1](plot_01_dash.md)**\n\nx\n\n## Stakes\n\nx\n",
    );
    write(
      dir,
      "position_dash.md",
      "# Position: With Dash\n\nThis prose uses an em dash — which the gate must catch.\n",
    );
    write(dir, "plot_01_dash.md", "# Plot 1\n\nx\n");
    expect(() => buildScenarioBundle({ scenarioDir: dir, root: emptyRoot })).toThrow(
      /em-dash|en-dash/,
    );
    rmSync(dir, { recursive: true, force: true });
  });

  it("rejects an unresolved Company link (fail verdict)", () => {
    const dir = mkdtempSync(join(tmpdir(), "khai-scn-unresolved-"));
    write(
      dir,
      "play_unresolved.md",
      "# Play: Unresolved\n\n## Estate\n\nx\n\n## Name\n\nx\n\n## Arc\n\nx\n\n## Company\n\n**Positions**\n\n- [Nowhere](position_nowhere.md): resolves nowhere.\n\n## Triggers\n\n**[Plot 1](plot_01_unresolved.md)**\n\nx\n\n## Stakes\n\nx\n",
    );
    write(dir, "plot_01_unresolved.md", "# Plot 1\n\nx\n");
    expect(() => buildScenarioBundle({ scenarioDir: dir, root: emptyRoot })).toThrow(
      "not found in the scenario folder",
    );
    rmSync(dir, { recursive: true, force: true });
  });

  it("rejects a Company link that collides across house collections", () => {
    const dir = mkdtempSync(join(tmpdir(), "khai-scn-collide-"));
    write(
      dir,
      "play_collide.md",
      "# Play: Collide\n\n## Estate\n\nx\n\n## Name\n\nx\n\n## Arc\n\nx\n\n## Company\n\n**Positions**\n\n- [Shared](position_shared.md): exists in two cultures on purpose.\n\n## Triggers\n\n**[Plot 1](plot_01_collide.md)**\n\nx\n\n## Stakes\n\nx\n",
    );
    write(dir, "plot_01_collide.md", "# Plot 1\n\nx\n");
    expect(() => buildScenarioBundle({ scenarioDir: dir, houseDir, root: emptyRoot })).toThrow(
      "collision",
    );
    rmSync(dir, { recursive: true, force: true });
  });

  it("requires exactly one play_*.md", () => {
    const dir = mkdtempSync(join(tmpdir(), "khai-scn-noplay-"));
    expect(() => buildScenarioBundle({ scenarioDir: dir, root: emptyRoot })).toThrow(
      "exactly one play_*.md",
    );
    rmSync(dir, { recursive: true, force: true });
  });
});

describe.skipIf(DORMANT)("packScenario", () => {
  it("writes one flat zip (no directory entries) and returns a path/role manifest", () => {
    const result = packScenario({
      scenarioDir,
      outputDir,
      houseDir,
      homeUrl: HOME_URL,
      root: engineRoot,
    });

    expect(existsSync(result.outputPath)).toBe(true);
    const buf = readFileSync(result.outputPath);
    expect(buf.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));

    const names = listZipEntryNames(buf);
    expect(names.length).toBeGreaterThan(0);
    // a flat zip: every entry name is a bare basename, none a directory
    for (const name of names) {
      expect(name.includes("/")).toBe(false);
      expect(name.endsWith("/")).toBe(false);
    }
    expect(names).toContain("instructions.md");
    expect(names).toContain("persona_a.md");

    expect(result.entries.find((e) => e.path === "persona_a.md").role).toBe("member");
  });
});

/** Parse a zip's central directory (own tiny reader, independent of
 * lib/zip.mjs) to prove the archive itself is flat, not just the entry list
 * this package built it from. */
function listZipEntryNames(buf) {
  const EOCD_SIG = 0x06054b50;
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error("listZipEntryNames: no EOCD record found");
  const totalEntries = buf.readUInt16LE(eocdOffset + 10);
  const centralDirOffset = buf.readUInt32LE(eocdOffset + 16);

  const names = [];
  let offset = centralDirOffset;
  for (let i = 0; i < totalEntries; i++) {
    if (buf.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error("listZipEntryNames: bad central directory signature");
    }
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    names.push(buf.toString("utf8", offset + 46, offset + 46 + nameLen));
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return names;
}
