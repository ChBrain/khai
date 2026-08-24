// khai-stage: stamp a khai house from the codified blueprint.
//
// The invariant house is computed here, never improvised: every house gets the
// same wiring, gates, and protection, with <source> and <kind> the only holes
// filled. The khai-impresario skill judges the source and calls this; this never
// judges. It is the "computed" half of raising a house, peer to what the
// impresario guides.
//
// Three kinds, the same three the bill carries (khai-plays `registry/`):
//
//   stage  a source staged as plays. Named khai-plays-<source>, indexes the
//          default `plays` collection, and so declares no collection at all.
//   work   khai's own canon given a voice as a finished piece. khai-<source>.
//   canon  reusable material a production draws on. khai-<source>.
//
// What varies by kind is the house's *identity and structure*: its package name,
// repository, the collection directory it indexes, and the `khai.collection` it
// declares. What does not vary is the voice -- the blueprint's management
// personas still speak of plays, because that prose is judged rather than
// computed, and judging is the impresario skill's half of the job. A work or
// canon house stamped here is structurally correct and wants its management
// prose read by the skill that raised it.

import { readdirSync, readFileSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import prettier from "prettier";

const here = dirname(fileURLToPath(import.meta.url));
const BLUEPRINT = join(here, "blueprint");

/**
 * The kinds a house can be, matching the bill's closed set. `stage` is the
 * default because it is what every house raised before this option was one.
 */
export const KINDS = ["stage", "work", "canon"];

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
function housePath(
  rel,
  { managerSlug, playwrightSlug, roadieSlug, directorSlug, collection } = {},
) {
  let p = rel.replace(/\.tmpl$/, "").replace(/\\/g, "/");
  // The blueprint carries the collection dir as `plays/`; a work or canon house
  // indexes its own, so the one directory is renamed on the way out.
  if (collection && collection !== "plays" && p.startsWith("plays/")) {
    p = `${collection}/${p.slice("plays/".length)}`;
  }
  if (p === "npmrc" || p === "gitignore" || p === "nvmrc") return "." + p;
  if (p.startsWith("github/") || p.startsWith("husky/") || p.startsWith("changeset/"))
    return "." + p;
  if (managerSlug && p === "management/persona_theatre_manager.md") {
    return `management/persona_${managerSlug}.md`;
  }
  if (playwrightSlug && p === "management/persona_playwright.md") {
    return `management/persona_${playwrightSlug}.md`;
  }
  if (roadieSlug && p === "management/persona_roadie.md") {
    return `management/persona_${roadieSlug}.md`;
  }
  if (directorSlug && p === "management/persona_director.md") {
    return `management/persona_${directorSlug}.md`;
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
 * @param {{ source: string, targetDir: string, manager?: string, playwright?: string, roadie?: string, director?: string, repertoire?: string|string[] }} opts
 */
export async function stageHouse({
  source,
  targetDir,
  kind = "stage",
  collection,
  anchor,
  manager,
  playwright,
  roadie,
  director,
  repertoire,
} = {}) {
  const s = slug(source);
  if (!s)
    throw new Error("khai-stage: a source is required, e.g. stageHouse({ source: 'buechner' })");
  if (!targetDir) throw new Error("khai-stage: a targetDir is required");
  if (!KINDS.includes(kind))
    throw new Error(
      `khai-stage: kind must be one of ${KINDS.join(", ")}, got ${JSON.stringify(kind)}`,
    );

  // A stage house indexes the default `plays` collection, so it declares none --
  // that is what makes the historical no-config houses resolve (see the kit's
  // collection module). A work or canon house indexes a collection named for
  // itself unless the caller names another: Phoenix is a `work` whose beasts do
  // not share its slug.
  const col = kind === "stage" ? "plays" : slug(collection) || s;
  const base = kind === "stage" ? `khai-plays-${s}` : `khai-${s}`;
  const engineName = kind === "stage" ? `plays-${s}` : s;

  // Every non-stage house khai has raised anchors its items as plays: a culture
  // is a theatre of that culture, a misfit is a trap staged as a system, a beast
  // speaks for its phenomenon. So the anchor does not follow the collection name
  // (which would give `culture_`); it is `play_`, and the house declares the
  // object form to say so rather than letting the kit derive it.
  const anchorPrefix = anchor || "play_";

  // What the house says it is. The three differ in what they hold, so they
  // differ here; only a stage house credits an outside source, which is the
  // licensing lane's distinction, not a stylistic one.
  const T = title(source);
  const description =
    kind === "stage"
      ? `khai plays: the ${T} production house. Plays staged with khai; the source is credited where it is in the public domain.`
      : kind === "work"
        ? `khai ${col}: ${T}, khai's own canon given a voice. Staged with khai.`
        : `khai ${col}: the ${T} collection. Reusable material a production draws on, staged with khai.`;
  const wire =
    kind === "stage"
      ? `The ${T} production house: a collection of khai plays.`
      : kind === "work"
        ? `${T}: khai's own canon given a voice, indexed as ${col}.`
        : `The ${T} collection: reusable ${col} a production draws on.`;

  const m = manager ? slug(manager) : "manager";
  const mTitle = manager ? title(manager) : "Manager";

  const p = playwright ? slug(playwright) : s;
  const pTitle = playwright ? title(playwright) : title(source);

  const r = roadie ? slug(roadie) : "roadie";
  const rTitle = roadie ? title(roadie) : "Roadie";

  const d = director ? slug(director) : "director";
  const dTitle = director ? title(director) : "Director";

  // The repertoire: packages the house should depend on from the start (e.g. a
  // cultures house feeding this stage). Comma-separated string or array, both
  // accepted; each lands in package.json dependencies at "*" so the operator's
  // first npm install pins the resolved version. Omitted, the house is exactly
  // what it was before this option existed.
  const repertoireRaw =
    repertoire == null
      ? []
      : Array.isArray(repertoire)
        ? repertoire
        : String(repertoire).split(",");
  const repertoirePackages = repertoireRaw.map((pkgName) => pkgName.trim()).filter(Boolean);

  const tokens = {
    "{{SOURCE_TITLE}}": title(source),
    "{{SOURCE}}": s,
    "{{BASE}}": base,
    "{{COLLECTION}}": col,
    "{{ENGINE}}": engineName,
    "{{HOUSE_DESCRIPTION}}": description,
    "{{HOUSE_WIRE}}": wire,
    "{{YEAR}}": String(new Date().getUTCFullYear()),
    "{{MANAGER_PERSONA}}": m,
    "{{MANAGER_TITLE}}": mTitle,
    "{{PLAYWRIGHT_PERSONA}}": p,
    "{{PLAYWRIGHT_TITLE}}": pTitle,
    "{{ROADIE_PERSONA}}": r,
    "{{ROADIE_TITLE}}": rTitle,
    "{{DIRECTOR_PERSONA}}": d,
    "{{DIRECTOR_TITLE}}": dTitle,
  };
  const fill = (text) => Object.entries(tokens).reduce((t, [k, v]) => t.split(k).join(v), text);

  const slugs = {
    managerSlug: m,
    playwrightSlug: p,
    roadieSlug: r,
    directorSlug: d,
    collection: col,
  };
  const written = [];
  for (const rel of walk(BLUEPRINT)) {
    const out = join(targetDir, housePath(rel, slugs));
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, fill(readFileSync(join(BLUEPRINT, rel), "utf8")));
    written.push(housePath(rel, slugs).split("\\").join("/"));
  }

  // Emit the house registry so the house is green on raise (no manual
  // `khai-tests registry build` step). An empty house lists no items, keyed by
  // the collection it indexes rather than always `plays`; name and version come
  // from the house's own package.json, the same source the kit's registry
  // builder reads, so the two never drift.
  const pkg = JSON.parse(readFileSync(join(targetDir, "package.json"), "utf8"));
  const registry = {
    $schema: "http://json-schema.org/draft-07/schema#",
    name: pkg.name,
    version: pkg.version,
    [col]: [],
  };
  writeFileSync(join(targetDir, "registry.json"), JSON.stringify(registry, null, 2) + "\n");
  written.push("registry.json");

  // Two edits to the stamped manifest, written once. Both are no-ops for a
  // default stage house with no repertoire, so package.json stays exactly what
  // the blueprint stamped.
  let manifestDirty = false;

  // A stage house declares no collection: `plays` is the default every no-config
  // house already resolves to, and writing it would make the historical houses
  // and the newly stamped ones disagree on paper while meaning the same thing.
  // A work or canon house declares the object form, because its anchor does not
  // follow its collection name.
  if (kind !== "stage") {
    pkg.khai.collection = { dir: col, key: col, anchor: anchorPrefix };
    manifestDirty = true;
  }

  // The repertoire, if named: each package lands in dependencies at "*", the
  // range that pins to whatever resolves on the operator's first npm install.
  if (repertoirePackages.length) {
    pkg.dependencies = pkg.dependencies || {};
    for (const name of repertoirePackages) pkg.dependencies[name] = "*";
    manifestDirty = true;
  }

  if (manifestDirty) {
    writeFileSync(join(targetDir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
  }

  // Format the stamped markdown so the house is clean by construction. Filling
  // the source into an aligned markdown table changes its cell widths (a short
  // source like "l2" narrows a column padded for the {{SOURCE_TITLE}} token),
  // and the house CI runs `format:check`; without this the first run is red
  // before a play is written. We format only markdown, the one surface
  // substitution can dirty, using the house's own .prettierrc so the generator
  // and the gate never disagree. Nothing is exempted, so the warrant stays
  // gated for the operator's later edits.
  const prettierOpts = JSON.parse(readFileSync(join(targetDir, ".prettierrc"), "utf8"));
  for (const rel of written) {
    if (!rel.endsWith(".md")) continue;
    const abs = join(targetDir, rel);
    const src = readFileSync(abs, "utf8");
    const out = await prettier.format(src, { ...prettierOpts, parser: "markdown" });
    if (out !== src) writeFileSync(abs, out);
  }

  return {
    repo: base,
    kind,
    collection: col,
    written: written.sort(),
    handoffs: [
      `npm ci  (needs GITHUB_TOKEN for the @chbrain registry), then push; the first CI runs green on the empty house`,
      ...(repertoirePackages.length
        ? [
            `npm install pins the repertoire (${repertoirePackages.join(", ")}) staged into dependencies at "*"`,
          ]
        : []),
      `branch protection: require PRs and the checks (test, khai-guard, branch-scope) on main, forbid force-push. Do NOT require the audit "consistency" status: its workflow is path-filtered to audit/**, so it never reports on a non-audit PR and would wedge every such PR ("Expected - waiting"). Apply in Settings > Branches or via gh api, once the first CI run has created the check names.`,
      `RELEASE_TOKEN secret: a PAT with Contents: write and Pull requests: write, so the release workflow can push the version branch + tags and open the Version PR. Without it the house publishes nothing.`,
      `register the house in khai-plays under its Estate identity (README.md), so it appears on the bill: npx @chbrain/khai-plays register ${s} --kind ${kind} --blurb "..."`,
      ...(kind === "stage"
        ? []
        : [
            `the blueprint's management prose speaks of plays; a ${kind} house holds ${col}, so the impresario reads that voice over before the first commit -- khai-stage computes the house, it does not judge it`,
          ]),
    ],
  };
}

export default { stageHouse, slug };
