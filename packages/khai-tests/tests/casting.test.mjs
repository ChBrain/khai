import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
// Namespace import: castingCoverageErrors does not exist on main until the
// source lands, and a missing *named* import is a load-time crash even for a
// skipped suite. Reached through the namespace, the body only dereferences it
// when active.
import * as validate from "../src/validate.mjs";

// Dormant until the casting-coverage source lands on main: probe the source for
// the function under test (mirrors the build/verify-consistency convention in
// conformance.test.mjs). Until then these skip and the suite stays green.
const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const DORMANT = !readFileSync(join(srcDir, "validate.mjs"), "utf8").includes(
  "export function castingCoverageErrors",
);

describe.skipIf(DORMANT)("casting coverage: a plot must cast its company", () => {
  let dir;

  beforeEach(() => {
    dir = join(tmpdir(), `khai-casting-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(dir, "plays", "danton"), { recursive: true });
    // A play whose Company declares three elements: two personas and a place.
    writeFileSync(
      join(dir, "plays", "danton", "play_danton.md"),
      `---
khai: play
title: "Danton"
---
# Play: Danton

## Company
- [Danton](../../persona_danton.md) and [Robespierre](../../persona_robespierre.md).
- The place: [the Convention](./place_convention.md).
`,
    );
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  const writePlot = (name, action) =>
    writeFileSync(
      join(dir, "plays", "danton", name),
      `---
khai: plot
---
## Taxonomy
[Danton](./play_danton.md): a plot.

## Action
${action}
`,
    );

  const errorsOf = (results) => results.flatMap((r) => r.errors);
  const warningsOf = (results) => results.flatMap((r) => r.warnings ?? []);

  it("flags a plot that names its company in plain prose (uncast)", () => {
    // Only the structural Taxonomy link to the play; the company is plain text.
    writePlot("plot_uncast.md", "Danton argues with Robespierre in the Convention.");
    const errs = errorsOf(validate.castingCoverageErrors(dir));
    expect(errs.some((e) => /casts nothing/.test(e))).toBe(true);
  });

  it("passes a plot that casts at least one Company element", () => {
    writePlot(
      "plot_cast.md",
      "[Danton](../../persona_danton.md) faces [Robespierre](../../persona_robespierre.md).",
    );
    // No uncast error. (the Convention is declared but never cast, which warns,
    // not errors — asserted separately below.)
    expect(errorsOf(validate.castingCoverageErrors(dir))).toEqual([]);
  });

  it("ignores the structural Taxonomy link to the play (it is not a cast)", () => {
    // A plot linking only its own play_*.md must still count as uncast: the play
    // is never a member of its own Company, so the intersection is empty.
    writePlot("plot_only_taxonomy.md", "The scene turns, with nothing named.");
    const errs = errorsOf(validate.castingCoverageErrors(dir));
    expect(errs.some((e) => /casts nothing/.test(e))).toBe(true);
  });

  it("warns (does not error) on a Company element no plot casts", () => {
    // Danton and Robespierre are cast; the Convention is declared but unused.
    writePlot(
      "plot_cast.md",
      "[Danton](../../persona_danton.md) and [Robespierre](../../persona_robespierre.md) clash.",
    );
    const results = validate.castingCoverageErrors(dir);
    expect(errorsOf(results)).toEqual([]);
    expect(warningsOf(results).some((w) => /place_convention\.md/.test(w))).toBe(true);
  });
});
