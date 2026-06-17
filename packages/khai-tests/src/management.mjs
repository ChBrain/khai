// The management convergence gate. Every khai plays house runs on one shared
// management structure (the blueprint); a house may differ from it ONLY in the
// overlay categories (the personas it casts, its own house plans, and orders/).
// This gate holds that line: the shared CORE must match the blueprint verbatim,
// so a house cannot quietly hand-edit a chain-owned position, plan, or the voice
// layer. Cast personas, house plans, and orders/ are not compared.
//
// The core is snapshotted from @chbrain/khai-stage's blueprint into this package
// by `khai-tests management build` (the single writer, run in the monorepo) and
// shipped (files: ["src/"]). A house then checks against the bundled snapshot
// with NO khai-stage dependency. `management build` keeps the snapshot in sync
// with the blueprint; a drift check in CI catches a stale snapshot.
//
// TOURING IS DEFERRED. The Roadie module (position_roadie, persona_roadie,
// plan_go_on_tour, plan_keep_clean) ships with the publishing track and is NOT
// part of the core yet, so a house without it still converges. A house that has
// it (e.g. HCAndersen) keeps it as overlay until the touring core is turned on.

import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// The bundled core snapshot (committed and shipped under src/).
export const CORE_DIR = join(here, "management-core");

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

/** The khai-stage blueprint management dir, as a monorepo-relative path (build only). */
export function defaultBlueprintDir() {
  return join(here, "..", "..", "khai-stage", "blueprint", "management");
}

/**
 * Snapshot the core from a blueprint management dir into CORE_DIR. The single
 * writer of the snapshot; run by `management build` in the monorepo.
 * @returns {string[]} the core files written
 */
export function buildManagementCore(blueprintDir = defaultBlueprintDir()) {
  rmSync(CORE_DIR, { recursive: true, force: true });
  mkdirSync(CORE_DIR, { recursive: true });
  const written = [];
  for (const f of MANAGEMENT_CORE) {
    const src = join(blueprintDir, f);
    if (!existsSync(src))
      throw new Error(`blueprint is missing a core file: ${f} (looked in ${blueprintDir})`);
    writeFileSync(join(CORE_DIR, f), readFileSync(src));
    written.push(f);
  }
  return written;
}

/**
 * Check a house's management against the bundled core snapshot.
 * @param {string} houseDir the house repo root
 * @param {string} [coreDir] override the snapshot dir
 * @returns {string[]} errors (empty = converged)
 */
export function checkManagement(houseDir, coreDir = CORE_DIR) {
  const errors = [];
  const hm = join(houseDir, "management");
  if (!existsSync(hm)) return ["management/: directory not found"];

  for (const f of MANAGEMENT_CORE) {
    const snap = join(coreDir, f);
    if (!existsSync(snap)) continue; // not snapshotted in this revision; nothing to hold to
    const here2 = join(hm, f);
    if (!existsSync(here2)) {
      errors.push(`management/${f}: missing (shared core; sync it from the blueprint)`);
      continue;
    }
    if (readFileSync(here2, "utf8") !== readFileSync(snap, "utf8"))
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
