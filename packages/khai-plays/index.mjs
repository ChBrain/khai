// khai-plays: the play registry. khai holds the bill, not the productions.
//
// Each entry is a house, a khai-plays-<source> collection that lives in its own
// external repo. The website reads these and renders one card per house, with
// its productions underneath. khai is the source of truth for which houses
// exist; the productions stay where they are made. Registering a house is adding
// its entry file under registry/; this package reads and validates them. Pure
// node, no canon dependency: a card is metadata, not khai content.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const REGISTRY = join(here, "registry");

const isSlug = (s) => typeof s === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);

/**
 * Validate one registry entry (a house card). `id` pins it to its filename when
 * loaded from disk. Returns a list of error strings; empty means valid.
 */
export function validateEntry(entry, { id } = {}) {
  if (!entry || typeof entry !== "object") return ["entry is not an object"];
  const e = [];
  if (!isSlug(entry.id)) e.push(`id must be a slug, got ${JSON.stringify(entry.id)}`);
  if (id && entry.id !== id) e.push(`id "${entry.id}" must match the filename "${id}"`);
  if (typeof entry.title !== "string" || !entry.title.trim()) e.push("title is required");
  if (typeof entry.repo !== "string" || !/^https?:\/\//.test(entry.repo))
    e.push("repo must be an http(s) URL to where the house lives");
  if (typeof entry.blurb !== "string" || !entry.blurb.trim()) e.push("blurb is required");
  if (entry.plays !== undefined && !Array.isArray(entry.plays)) e.push("plays must be an array");
  for (const p of entry.plays ?? []) {
    if (!isSlug(p?.id)) e.push(`a play id must be a slug, got ${JSON.stringify(p?.id)}`);
    if (typeof p?.title !== "string" || !p.title.trim()) e.push(`play "${p?.id}" needs a title`);
  }
  return e;
}

/**
 * Load the registry: every `registry/<id>.json`, validated and sorted by id.
 * An empty or absent registry is valid and returns []. Throws on a bad entry,
 * so a malformed card fails the build rather than rendering a broken bill.
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

/** The registered houses, the bill the website reads. */
export const houses = loadRegistry();

export default { houses, loadRegistry, validateEntry };
