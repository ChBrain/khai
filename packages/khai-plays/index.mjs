// khai-plays: the play registry. khai holds the bill, not the productions.
//
// Each card registers a house: a khai-plays-<source> collection published as a
// package. khai is the source of truth for which houses exist (the bill); the
// plays live in the houses. khai knows the house by its card; the website knows
// it from khai and pulls the card's package to read that house's plays. Pure
// node, no canon dependency: a card is metadata, not khai content.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const REGISTRY = join(here, "registry");

/** A source slug: lowercase ASCII, hyphen-joined. The card's id and filename. */
export const slug = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const isSlug = (s) => typeof s === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);
const isPackage = (s) =>
  typeof s === "string" && /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(s);

/**
 * Validate one registry card (a house). `id` pins it to its filename when loaded
 * from disk. Returns error strings; empty means valid. A house registers a
 * package (the website pulls it for the plays); repo is an optional human link.
 */
export function validateEntry(entry, { id } = {}) {
  if (!entry || typeof entry !== "object") return ["card is not an object"];
  const e = [];
  if (!isSlug(entry.id)) e.push(`id must be a slug, got ${JSON.stringify(entry.id)}`);
  if (id && entry.id !== id) e.push(`id "${entry.id}" must match the filename "${id}"`);
  if (typeof entry.title !== "string" || !entry.title.trim()) e.push("title is required");
  if (!isPackage(entry.package))
    e.push(`package must be an npm name, got ${JSON.stringify(entry.package)}`);
  if (typeof entry.blurb !== "string" || !entry.blurb.trim()) e.push("blurb is required");
  if (entry.repo !== undefined && !/^https?:\/\//.test(String(entry.repo)))
    e.push("repo, if present, must be an http(s) URL");
  return e;
}

/**
 * Load the registry: every `registry/<id>.json`, validated and sorted by id. An
 * empty or absent registry is valid and returns []. Throws on a bad card, so a
 * malformed entry fails the build rather than rendering a broken bill.
 */
export function loadRegistry(dir = REGISTRY) {
  if (!existsSync(dir)) return [];
  const houses = [];
  for (const file of readdirSync(dir)
    .filter((n) => n.endsWith(".json"))
    .sort()) {
    const id = file.replace(/\.json$/, "");
    const entry = JSON.parse(readFileSync(join(dir, file), "utf8"));
    const errors = validateEntry(entry, { id });
    if (errors.length) throw new Error(`khai-plays: ${file}: ${errors.join("; ")}`);
    houses.push(entry);
  }
  return houses.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Render the registry as the generated README, the human view of the same bill.
 * Pure: cards in, markdown out. The website reads the data (loadRegistry); this
 * is for a person browsing the repo. Generated, never hand-edited.
 */
export function renderReadme(houses) {
  const head = [
    "# khai-plays",
    "",
    "The play registry: the bill. khai holds the index of the houses, not the",
    "productions. Each card registers a house (a `khai-plays-<source>` collection)",
    "and the package the website pulls to read that house's plays. khai knows the",
    "house by its card; the website knows it from khai and pulls the package for the",
    "rest.",
    "",
    "Generated from the registry, never hand-edited. Run",
    '`npx @chbrain/khai-plays register <source> --blurb "..."` to add a card (its',
    "shape is in `registry/README.md`); it rewrites this file.",
    "",
    "## Houses",
    "",
  ];
  const body =
    houses.length === 0
      ? ["None registered yet."]
      : houses.map((h) => {
          const link = h.repo ? ` ([source](${h.repo}))` : "";
          return `- **${h.title}** (\`${h.package}\`): ${h.blurb}${link}`;
        });
  const tail = [
    "",
    "## Reading the bill",
    "",
    "`loadRegistry()` and `houses` return the validated cards, sorted by id. The",
    "website renders them and pulls each card's package to read that house's plays.",
    "",
  ];
  return [...head, ...body, ...tail].join("\n");
}

/** The registered houses, the bill the website reads. */
export const houses = loadRegistry();

export default { houses, loadRegistry, validateEntry, renderReadme, slug };
