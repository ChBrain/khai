import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, cpSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  checkManagement,
  defaultBlueprintDir,
  MANAGEMENT_CORE,
  MANAGEMENT_HOMES,
  CORE_DIR,
} from "../index.mjs";

// Build a temp house whose management/ matches the shipped core snapshot.
function convergedHouse() {
  const dir = mkdtempSync(join(tmpdir(), "khai-house-"));
  const m = join(dir, "management");
  mkdirSync(m, { recursive: true });
  for (const f of MANAGEMENT_CORE) cpSync(join(CORE_DIR, f), join(m, f));
  for (const h of MANAGEMENT_HOMES) mkdirSync(join(m, h), { recursive: true });
  return dir;
}

describe("khai-tests: the management convergence gate", () => {
  // The drift guard: the committed snapshot must equal the blueprint it was built
  // from. This is the check that catches a stale snapshot (e.g. the blueprint
  // gained a field but `management build` was not re-run).
  it("the committed snapshot is in sync with the khai-stage blueprint", () => {
    const bp = defaultBlueprintDir();
    const drifted = MANAGEMENT_CORE.filter(
      (f) => readFileSync(join(CORE_DIR, f), "utf8") !== readFileSync(join(bp, f), "utf8"),
    );
    expect(drifted, `run "khai-tests management build" to resync`).toEqual([]);
  });

  it("passes a house whose core matches and that carries the homes", () => {
    const dir = convergedHouse();
    try {
      // an overlay file (a cast persona) is allowed and ignored
      writeFileSync(join(dir, "management", "persona_someone.md"), "overlay, not compared");
      expect(checkManagement(dir)).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("flags a drifted core file", () => {
    const dir = convergedHouse();
    try {
      writeFileSync(join(dir, "management", "position_choregos.md"), "hand-edited core");
      const errors = checkManagement(dir);
      expect(errors.some((e) => e.includes("position_choregos.md") && e.includes("drifted"))).toBe(
        true,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("flags a missing core file and a missing home", () => {
    const dir = convergedHouse();
    try {
      rmSync(join(dir, "management", "plan_stage_the_score.md"));
      rmSync(join(dir, "management", "discussions"), { recursive: true, force: true });
      const errors = checkManagement(dir);
      expect(
        errors.some((e) => e.includes("plan_stage_the_score.md") && e.includes("missing")),
      ).toBe(true);
      expect(errors.some((e) => e.includes("discussions/") && e.includes("home"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("the core list excludes the deferred touring module", () => {
    // Touring (the Roadie module) ships with publishing, not the converged core.
    for (const f of [
      "position_roadie.md",
      "persona_roadie.md",
      "plan_go_on_tour.md",
      "plan_keep_clean.md",
    ])
      expect(MANAGEMENT_CORE).not.toContain(f);
  });
});
