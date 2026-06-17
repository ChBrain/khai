// The management convergence gate. Every khai plays house runs on one shared
// management structure (the blueprint); a house may differ from it ONLY in the
// overlay categories (the personas it casts, its own house plans, and orders/).
// This gate holds that line: the shared CORE must match the blueprint verbatim,
// so a house cannot quietly hand-edit a chain-owned position, plan, or the voice
// layer. Cast personas, house plans, and orders/ are not compared.
//
// The blueprint is read live from the installed @chbrain/khai-stage
// (blueprint/management/), the single source every house is stamped from. There
// is no committed snapshot: the gate compares a house directly against the
// blueprint, so a blueprint change needs no second artifact kept in sync.
//
// TOURING IS DEFERRED. The Roadie module (position_roadie, persona_roadie,
// plan_go_on_tour, plan_keep_clean) ships with the publishing track and is NOT
// part of the core yet, so a house without it still converges. A house that has
// it (e.g. HCAndersen) keeps it as overlay until the touring core is turned on.

import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

// The shared management core a converged house must carry, verbatim. Overlay
// (cast personas, house plans, orders/ contents) is not listed and not compared.
export const MANAGEMENT_CORE = [
  "management_instructions.md",
  "discussion_instructions.md",
  "position_choregos.md",
  "position_playwright.md",
  "position_theatre_manager.md",
  "position_director.md",
  "persona_nicias.md",
  "persona_pericles.md",
  "plan_stage_the_score.md",
];

// The homes every house carries (the dirs, not their contents, which are overlay).
export const MANAGEMENT_HOMES = ["discussions", "orders"];

/** The blueprint management dir, resolved from the installed @chbrain/khai-stage. */
export function blueprintManagementDir() {
  const require = createRequire(import.meta.url);
  return join(
    dirname(require.resolve("@chbrain/khai-stage/package.json")),
    "blueprint",
    "management",
  );
}

/**
 * Check a house's management against the live blueprint core.
 * @param {string} houseDir the house repo root
 * @param {string} [blueprintDir] override the blueprint management dir
 * @returns {string[]} errors (empty = converged)
 */
export function checkManagement(houseDir, blueprintDir = blueprintManagementDir()) {
  const errors = [];
  const hm = join(houseDir, "management");
  if (!existsSync(hm)) return ["management/: directory not found"];

  for (const f of MANAGEMENT_CORE) {
    const bp = join(blueprintDir, f);
    if (!existsSync(bp)) continue; // not in this blueprint revision; nothing to hold to
    const here = join(hm, f);
    if (!existsSync(here)) {
      errors.push(`management/${f}: missing (shared core; sync it from the blueprint)`);
      continue;
    }
    if (readFileSync(here, "utf8") !== readFileSync(bp, "utf8"))
      errors.push(
        `management/${f}: drifted from the blueprint core (only cast personas, house plans, and orders/ may differ from the blueprint)`,
      );
  }

  for (const d of MANAGEMENT_HOMES) {
    const home = join(hm, d);
    if (!existsSync(home) || !statSync(home).isDirectory())
      errors.push(`management/${d}/: missing home directory`);
  }

  return errors;
}
