import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { castErrors } from "../src/validate.mjs";

// A needed position without a persona is a failure: every position_*.md in a
// management cast must have at least one persona_*.md whose Taxonomy links to it.
describe("castErrors", () => {
  it("flags an orphan position, passes a covered one", () => {
    const dir = mkdtempSync(join(tmpdir(), "khai-cast-"));
    try {
      writeFileSync(join(dir, "position_choregos.md"), "## Taxonomy\nThe producer.\n");
      writeFileSync(join(dir, "position_roadie.md"), "## Taxonomy\nThe crew.\n");
      writeFileSync(
        join(dir, "persona_nicias.md"),
        "## Taxonomy\n[The Choregos](position_choregos.md)\n",
      );
      const files = ["position_choregos.md", "position_roadie.md", "persona_nicias.md"].map((f) =>
        join(dir, f),
      );
      const errs = castErrors(files);
      expect(errs).toHaveLength(1);
      expect(errs[0].file).toBe(join(dir, "position_roadie.md"));
      expect(errs[0].errors[0]).toContain("position_roadie.md");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("passes when every position has a persona; one position may hold many", () => {
    const dir = mkdtempSync(join(tmpdir(), "khai-cast-"));
    try {
      writeFileSync(join(dir, "position_choregos.md"), "the producer");
      writeFileSync(join(dir, "persona_nicias.md"), "[The Choregos](position_choregos.md)");
      writeFileSync(join(dir, "persona_pericles.md"), "[The Choregos](position_choregos.md)");
      const files = ["position_choregos.md", "persona_nicias.md", "persona_pericles.md"].map((f) =>
        join(dir, f),
      );
      expect(castErrors(files)).toHaveLength(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
