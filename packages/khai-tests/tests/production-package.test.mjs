// The production layer: a package that ships ONE khai play, published on its own
// so a house can be drawn on a play at a time. Routed on the canon's own class
// vocabulary (khai.class "house") the way the spine engine is routed on "meta",
// and carrying almost none of the engine validator's body -- a production wires
// into no chapter, composes nothing, and exports no compose().
//
// Two things are exercised here and nowhere else: the manifest contract, and the
// publish invariant. The invariant is the one worth stating plainly, because it
// looks redundant and is not: a culture sitting beside its siblings in a working
// tree resolves "../france/position_language_fr_fr.md" perfectly, so the ordinary
// broken-link check passes and the published tarball is broken. Only a rule about
// what leaves the package can see that.
//
// The workspace case for installedEngineManifests is covered too, because it was
// the defect the layer's proof turned up: package-specifier links walked up
// through node_modules and installed engines did not, so a package validated on
// its own directory inside a hoisted workspace had its package links resolve and
// every wiring link read as broken, while the same package validated from the
// workspace root had exactly the reverse. Neither root gave a true reading.

import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync, symlinkSync } from "node:fs";

// See instructions.test.mjs for the full reasoning: on Windows a "dir" symlink
// needs SeCreateSymbolicLinkPrivilege and Node throws EPERM without it, while a
// "junction" needs none and reads the same. On POSIX there is no junction.
//
// #1479 fixed the other file and missed this one, and the miss is worth naming
// because the sweep that found the other two EXCLUDED this line by content: the
// filter was `grep -v node_modules`, meant to skip the directory, and this call
// links INTO node_modules so it says the word. The only site that needed fixing
// was the only one the filter could not see.
const LINK_TYPE = process.platform === "win32" ? "junction" : "dir";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { validateProductionPackage, PRODUCTION_CLASS } from "../index.mjs";

// Source-presence guard, per the repo convention (the source must be on main for
// these to mean anything).
const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "validate.mjs");
const DORMANT = !readFileSync(SRC, "utf8").includes("validateProductionPackage");

const PLAY = `---
khai: play
title: "Bavaria"
description: "Bavaria staged as a culture: a free state that never read itself as a province."
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-08-25"
---

# Play: Bavaria

## Estate

[the house](https://example.invalid/house): the production that answers for the run.

## Name

Bavaria, a free state in the south.

## Arc

A duchy raised to a kingdom, which keeps the pride after the crown goes.

## Company

**Positions**

- The culture: [Bavarian Culture](position_culture.md).

**Personas**

- The holder: [Sepp](persona_sepp.md).

## Triggers

- [The Kingdom](plot_kingdom.md) opens it.

## Stakes

Whether a difference survives being absorbed.
`;

const POSITION = `---
khai: position
title: "Bavarian Culture"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-08-25"
---

# Position: Bavarian Culture

## Taxonomy

Parent group: positions

## Owner

- Project: khai-cultures

## Has

Belonging to a state that never read itself as a province, with its own crown behind it.

## Orders

It orders its holder to answer for the difference rather than to explain it away.

## Loses

It loses the ease of being unremarkable, and the shelter that comes with that.

## Drives

It drives its holder to keep the difference visible in small daily choices.
`;

const PLOT = `---
khai: plot
title: "The Kingdom"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-08-25"
---

# Plot: The Kingdom

## Taxonomy

Parent group: plots

## Owner

- Project: khai-cultures

## Cue

A duchy is offered a crown it did not ask for.

## Action

[Sepp](persona_sepp.md) takes the crown and holds [Bavarian Culture](position_culture.md) under it.

## Stage

A hall where the offer is read aloud.

## Tension

The crown is a gift from a power that can take it back.
`;

const PERSONA = `---
khai: persona
title: "Sepp"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-08-25"
type: fictional
provenance: sourced
---

# Persona: Sepp

## Taxonomy

The holder of [Bavarian Culture](position_culture.md).

## Owner

- Project: khai-cultures

## Projection

He presents the difference as settled fact, unhurried, in the dialect and without apology.

## Action

He answers a question about the crown by naming the year, and lets the room do the arithmetic.

## Shadow

He does not see that the settledness is rehearsed, and that he checks the room for it.

## Tell

His hand goes flat on the table a beat before he names the year.
`;

/** The persona with one extra link in its Projection, the chapter the canon
 * invites links in. Each case points that single reference wherever it needs it,
 * so the fixture changes in exactly one place. */
const personaLinking = (target) =>
  PERSONA.replace(
    "unhurried, in the dialect and without apology.",
    `unhurried, in the dialect he keeps with [the tongue](${target}) and without apology.`,
  );

// The Playwright wiring guide. Every package that publishes khai typed content
// ships one, and a production publishes a play -- so the fixture carries one for
// the same reason a real culture package will. Dev-steering, in English, inside
// a production of any language: it says how the package is DRAWN ON, never what
// it holds.
const GUIDE = `---
khai: instructions
title: "Bavaria"
license: CC-BY-NC-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.1.0
  date: "2026-08-26"
---

# Instructions: Bavaria

How a Playwright draws on this culture. Authoring guidance, not runtime content.

## Human

- The human decides which Bavarians the scene needs, and whether the play is set
  inside the culture or looking at it from outside.

## Agent

- Cast the personas and positions by package specifier, never by relative path:
  this culture is a package, and a link that resolves only because the file sits
  next door will break in the tarball.

## Collaboration

- Which grip a persona has on a tongue is the language engine's; this package
  says which tongue is in the room, never how well it is held.

## Knowledge

- The Free State reads itself as a state that joined an empire late and kept its
  own crown in the telling.

## System

- Do not edit the culture's files to fit a scene. Author it in the play, or open
  a change against this package.
`;

const manifest = (khai, deps) => ({
  name: "@chbrain/khai-cultures-bavaria",
  version: "0.1.0",
  type: "module",
  license: "SEE LICENSE IN LICENSE and LICENSE-CODE",
  khai,
  ...(deps ? { dependencies: deps } : {}),
});

let tmp;
/** A production package in a fresh temp dir. `khai` and the files are tunable so
 * each case changes exactly one thing. */
function production({
  khai = { class: PRODUCTION_CLASS, production: "bavaria" },
  files = {},
  deps,
} = {}) {
  tmp = mkdtempSync(join(tmpdir(), "khai-production-"));
  const dir = join(tmp, "pkg");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify(manifest(khai, deps), null, 2));
  const all = {
    "play_bavaria.md": PLAY,
    "position_culture.md": POSITION,
    "plot_kingdom.md": PLOT,
    "persona_sepp.md": PERSONA,
    "playwright_instructions.md": GUIDE,
    ...files,
  };
  for (const [name, text] of Object.entries(all))
    if (text !== null) writeFileSync(join(dir, name), text);
  return dir;
}
const errorsOf = (results) => results.flatMap((r) => r.errors ?? []);

afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

describe.skipIf(DORMANT)("production package: the manifest contract", () => {
  it("a well-formed production validates clean", () => {
    expect(errorsOf(validateProductionPackage(production()))).toEqual([]);
  });

  it("the class is the canon's own word for a play, not a new one", () => {
    // Not merely "some string": the value must be the class khai-arch already
    // gives play and plot, so the layer arrives without extending the canon.
    expect(PRODUCTION_CLASS).toBe("house");
    const errs = errorsOf(
      validateProductionPackage(
        production({ khai: { class: "production", production: "bavaria" } }),
      ),
    );
    expect(errs.some((e) => e.includes('khai.class "house"'))).toBe(true);
  });

  it("a production declares its id", () => {
    const errs = errorsOf(
      validateProductionPackage(production({ khai: { class: PRODUCTION_CLASS } })),
    );
    expect(errs.some((e) => e.includes("khai.production is required"))).toBe(true);
  });

  it("a production declares no khai.engine, so it imposes no wiring law", () => {
    // The absence is load-bearing: a house installing 290 cultures to cast one
    // must not inherit 290 sets of requirements.
    const errs = errorsOf(
      validateProductionPackage(
        production({ khai: { class: PRODUCTION_CLASS, production: "bavaria", engine: "bavaria" } }),
      ),
    );
    expect(errs.some((e) => e.includes("declares no khai.engine"))).toBe(true);
  });

  it("the anchor defaults to play_<id>.md and must be present", () => {
    const errs = errorsOf(
      validateProductionPackage(production({ files: { "play_bavaria.md": null } })),
    );
    expect(errs.some((e) => e.includes("missing anchor") && e.includes("play_bavaria.md"))).toBe(
      true,
    );
  });

  it("an explicit anchor is honoured", () => {
    const dir = production({
      khai: { class: PRODUCTION_CLASS, production: "bavaria", anchor: "play_bayern.md" },
      files: { "play_bavaria.md": null, "play_bayern.md": PLAY },
    });
    expect(errorsOf(validateProductionPackage(dir))).toEqual([]);
  });

  it("the anchor must be a play, not another kind wearing the name", () => {
    const errs = errorsOf(
      validateProductionPackage(production({ files: { "play_bavaria.md": POSITION } })),
    );
    expect(errs.some((e) => e.includes("must be a khai play"))).toBe(true);
  });

  it("a production is ONE play", () => {
    const second = PLAY.replace('title: "Bavaria"', 'title: "Swabia"').replace(
      "# Play: Bavaria",
      "# Play: Swabia",
    );
    const errs = errorsOf(
      validateProductionPackage(production({ files: { "play_swabia.md": second } })),
    );
    expect(errs.some((e) => e.includes("a production is one play; this package ships 2"))).toBe(
      true,
    );
  });

  it("a package with no khai manifest is not a production", () => {
    tmp = mkdtempSync(join(tmpdir(), "khai-production-"));
    const dir = join(tmp, "pkg");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "x", version: "1.0.0" }));
    expect(errorsOf(validateProductionPackage(dir))).toEqual([
      "package.json has no `khai` manifest",
    ]);
  });
});

describe.skipIf(DORMANT)("production package: the publish invariant", () => {
  it('a "../" link fails even though it resolves in the working tree', () => {
    // The point of the check. Build the neighbour so the ordinary broken-link
    // check is SATISFIED, and the invariant must still fire -- otherwise the
    // tarball ships a link to a file that is not in it.
    const dir = production({
      files: { "persona_sepp.md": personaLinking("../sibling/position_x.md") },
    });
    mkdirSync(join(dirname(dir), "sibling"), { recursive: true });
    writeFileSync(join(dirname(dir), "sibling", "position_x.md"), POSITION);
    const errs = errorsOf(validateProductionPackage(dir));
    expect(errs.some((e) => e.includes("broken link"))).toBe(false);
    expect(errs.some((e) => e.includes("link escapes the package"))).toBe(true);
  });

  it("the invariant covers non-instance markdown too, since it ships as well", () => {
    const errs = errorsOf(
      validateProductionPackage(
        production({ files: { "README.md": "# Bavaria\n\nSee [the house](../README.md).\n" } }),
      ),
    );
    expect(
      errs.some((e) => e.includes("README.md") || e.includes("link escapes the package")),
    ).toBe(true);
  });
});

describe.skipIf(DORMANT)("production package: hard links across a workspace symlink", () => {
  /** A hoisted workspace: the dependency lives beside the package and is linked
   * from a node_modules at the workspace root, never next to the consumer. */
  function workspace({ declare = true } = {}) {
    const dir = production({
      files: { "persona_sepp.md": personaLinking("@chbrain/khai-cultures-tongues/position_de.md") },
      deps: declare ? { "@chbrain/khai-cultures-tongues": "^0.1.0" } : undefined,
    });
    const tongues = join(tmp, "packages", "khai-cultures-tongues");
    mkdirSync(tongues, { recursive: true });
    writeFileSync(
      join(tongues, "package.json"),
      JSON.stringify({ name: "@chbrain/khai-cultures-tongues", version: "0.1.0" }),
    );
    writeFileSync(join(tongues, "position_de.md"), POSITION.replace("Bavarian Culture", "German"));
    // The package sits at <tmp>/pkg, so <tmp> is the workspace root the resolver
    // reaches by walking up exactly once.
    mkdirSync(join(tmp, "node_modules", "@chbrain"), { recursive: true });
    symlinkSync(tongues, join(tmp, "node_modules", "@chbrain", "khai-cultures-tongues"), LINK_TYPE);
    return dir;
  }

  it("resolves through the symlink when the dependency is declared", () => {
    expect(errorsOf(validateProductionPackage(workspace()))).toEqual([]);
  });

  it("fails closed when it is not declared", () => {
    const errs = errorsOf(validateProductionPackage(workspace({ declare: false })));
    expect(errs.some((e) => e.includes("is not a declared, installed dependency"))).toBe(true);
  });

  it("names the member when the package is declared but the file is not in it", () => {
    const dir = workspace();
    const p = join(dir, "persona_sepp.md");
    writeFileSync(p, readFileSync(p, "utf8").replace("position_de.md", "position_nope.md"));
    const errs = errorsOf(validateProductionPackage(dir));
    expect(errs.some((e) => e.includes("does not exist in the installed"))).toBe(true);
  });
});
