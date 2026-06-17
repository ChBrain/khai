import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, cpSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  checkManagement,
  blueprintManagementDir,
  MANAGEMENT_CORE,
  MANAGEMENT_HOMES,
} from "../index.mjs";

const BLUEPRINT = blueprintManagementDir();

// Build a temp house whose management/ matches the live blueprint core.
function convergedHouse() {
  const dir = mkdtempSync(join(tmpdir(), "khai-house-"));
  const m = join(dir, "management");
  mkdirSync(m, { recursive: true });
  for (const f of MANAGEMENT_CORE) cpSync(join(BLUEPRINT, f), join(m, f));
  for (const h of MANAGEMENT_HOMES) mkdirSync(join(m, h), { recursive: true });
  return dir;
}

describe("khai-tests: the management convergence gate", () => {
  it("resolves the blueprint and carries the full core", () => {
    expect(existsSync(BLUEPRINT)).toBe(true);
    for (const f of MANAGEMENT_CORE)
      expect(existsSync(join(BLUEPRINT, f)), `blueprint ${f}`).toBe(true);
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
