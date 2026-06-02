#!/usr/bin/env node
// The freshness gate (part of the required consistency check). Every audit this
// PR touches must have actually run against the CURRENT content. It fails when:
//   - meta.json is missing: the audit never ran (a seed-only PR), or
//   - a target's tree sha differs from the stamp: the content changed since the
//     audit ran (stale), so the findings no longer reflect what is being merged.
// Either way the fix is the same: comment /audit <id> to re-run.
//
//   node .github/scripts/audit-freshness.mjs <audit/<id>/audit.json> [more...]

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";

const manifests = process.argv.slice(2);
const treeSha = (path) => {
  try {
    return execFileSync("git", ["rev-parse", `HEAD:${path}`], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
};

let failed = false;
for (const m of manifests) {
  const cfg = JSON.parse(readFileSync(m, "utf8"));
  const metaPath = join(dirname(m), "meta.json");
  if (!existsSync(metaPath)) {
    console.error(`✖ ${cfg.id}: the audit has not run; comment /audit ${cfg.id}`);
    failed = true;
    continue;
  }
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  for (const t of cfg.review?.targets ?? []) {
    const now = treeSha(t);
    const stamped = meta.targets?.[t] ?? null;
    if (now !== stamped) {
      console.error(
        `✖ ${cfg.id}: "${t}" changed since the audit ran (stamped ${stamped}, now ${now}); comment /audit ${cfg.id}`,
      );
      failed = true;
    }
  }
}

if (failed) {
  console.error("\naudit freshness: re-run the audit against the current content.");
  process.exit(1);
}
console.log(`audit freshness: ${manifests.length} audit(s) ran against the current content.`);
