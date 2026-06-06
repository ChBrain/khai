// khai-stage: stamp a khai production house from the codified blueprint.
//
// The invariant house is computed here, never improvised: every house gets the
// same wiring, gates, and protection, with <source> the only hole filled. The
// khai-impresario skill judges the source and calls this; this never judges. It
// is the "computed" half of raising a house, peer to what the impresario guides.

import { readdirSync, readFileSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const BLUEPRINT = join(here, "blueprint");

/** A source slug: lowercase ASCII, hyphen-joined. The one input a house turns on. */
export const slug = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** A display title from a source, e.g. "buechner" -> "Buechner". */
const title = (s) =>
  slug(s)
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

// Blueprint path -> house path. Dotfiles are stored without the dot so they are
// inert in this repo (no stray hook fires, no nested workflow runs); the stamp
// restores them. A .tmpl suffix marks a file the toolchain must not pick up here
// (a test that would otherwise run); the stamp drops it.
function housePath(rel, { managerSlug, playwrightSlug } = {}) {
  let p = rel.replace(/\.tmpl$/, "").replace(/\\/g, "/");
  if (p === "npmrc" || p === "gitignore" || p === "nvmrc") return "." + p;
  if (p.startsWith("github/") || p.startsWith("husky/") || p.startsWith("changeset/"))
    return "." + p;
  if (managerSlug && p === "management/persona_theatre_manager.md") {
    return `management/persona_${managerSlug}.md`;
  }
  if (playwrightSlug && p === "management/persona_playwright.md") {
    return `management/persona_${playwrightSlug}.md`;
  }
  return p;
}

const walk = (dir, base = dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    return e.isDirectory() ? walk(full, base) : [relative(base, full)];
  });

/**
 * Stamp a house for `source` into `targetDir`. Pure: reads the blueprint, fills
 * the source, writes the files, returns what it wrote plus the two handoffs it
 * cannot do itself (branch protection needs the check names to exist; the
 * registry listing is a separate step). It never reaches the network.
 *
 * @param {{ source: string, targetDir: string, manager?: string }} opts
 */
export function stageHouse({ source, targetDir, manager, playwright } = {}) {
  const s = slug(source);
  if (!s)
    throw new Error("khai-stage: a source is required, e.g. stageHouse({ source: 'buechner' })");
  if (!targetDir) throw new Error("khai-stage: a targetDir is required");

  const m = manager ? slug(manager) : "manager";
  const mTitle = manager ? title(manager) : "Manager";

  const p = playwright ? slug(playwright) : s;
  const pTitle = playwright ? title(playwright) : title(source);

  const tokens = {
    "{{SOURCE_TITLE}}": title(source),
    "{{SOURCE}}": s,
    "{{YEAR}}": String(new Date().getUTCFullYear()),
    "{{MANAGER_PERSONA}}": m,
    "{{MANAGER_TITLE}}": mTitle,
    "{{PLAYWRIGHT_PERSONA}}": p,
    "{{PLAYWRIGHT_TITLE}}": pTitle,
  };
  const fill = (text) => Object.entries(tokens).reduce((t, [k, v]) => t.split(k).join(v), text);

  const written = [];
  for (const rel of walk(BLUEPRINT)) {
    const out = join(targetDir, housePath(rel, { managerSlug: m, playwrightSlug: p }));
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, fill(readFileSync(join(BLUEPRINT, rel), "utf8")));
    written.push(housePath(rel, { managerSlug: m, playwrightSlug: p }).split("\\").join("/"));
  }

  return {
    repo: `khai-plays-${s}`,
    written: written.sort(),
    handoffs: [
      `npm ci  (needs GITHUB_TOKEN for the @chbrain registry), then push; the first CI runs green on the empty house`,
      `branch protection: require PRs and the checks (test, khai-guard, branch-scope, consistency) on main, forbid force-push. Apply in Settings > Branches or via gh api, once the first CI run has created the check names.`,
      `RELEASE_TOKEN secret: a PAT with Contents: write and Pull requests: write, so the release workflow can push the version branch + tags and open the Version PR. Without it the house publishes nothing.`,
      `register the house in khai-plays under its Estate identity (README.md), so it appears on the bill`,
    ],
  };
}

export default { stageHouse, slug };
