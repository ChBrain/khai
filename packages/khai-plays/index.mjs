// khai-plays: the house registry. khai holds the bill, not the productions.
//
// One registry for every house that depends on khai, and a `kind` on the card
// telling the three apart. Every house holds plays -- an item is anchored
// `play_<id>.md` and casts personas, pieces, places and a pitch, in all three
// kinds -- so the kinds differ in where the source comes from and what the plays
// are for, never in what the item is:
//
//   stage  plays staged from another's source (Buechner, Dickens, L2)
//   work   plays staged from khai's own canon (Phoenix, which stages the
//          combustion engine with each phenomenon speaking for itself)
//   canon  plays other productions draw on as material (Misfits, Cultures)
//
// The kind cannot be computed here. A card is all khai holds about a house --
// the house is another repository, so its package.json (and the `khai.collection`
// it declares) is out of reach at build time. The card carries the kind or the
// bill cannot tell a Dickens staging from a catalogue of cultural positions.
//
// khai is the source of truth for which houses exist (the bill); the contents
// live in the houses. Pure node, no canon dependency: a card is metadata, not
// khai content.

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

/**
 * The closed set of house kinds, in bill order. A card declares exactly one.
 * Closed on purpose: a new kind is an architectural decision, so it lands here
 * with a section in the rendered bill rather than appearing by typo.
 */
export const KINDS = ["stage", "work", "canon", "chain"];

/**
 * What each kind holds, for the card validator's message and the bill's prose.
 *
 * Every house holds plays -- a house item is anchored `play_<id>.md` and casts
 * personas, pieces, places and a pitch, in all three kinds. That is the
 * invariant, and it is why a house is a repository rather than a package. The
 * kinds do not differ in what the item IS; they differ in where its source comes
 * from and what the plays are for.
 *
 * `chain` is the one exception, and it holds no plays: the writing archive and
 * the website are chain infrastructure, one repository each for every house.
 * They sit on the bill because the jobs that read the bill as the list of what
 * khai runs (the adoption record, the release-token check) must see them too,
 * and a consumer that pulls a house's package skips a card whose package it has
 * not installed, which is how the website already reads the bill.
 */
export const KIND_BLURB = {
  stage: "plays staged from another's source",
  work: "plays staged from khai's own canon",
  canon: "plays other productions draw on as material",
  chain: "infrastructure every house shares, on the bill by exception",
};

const isSlug = (s) => typeof s === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);
const isPackage = (s) =>
  typeof s === "string" && /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(s);

/**
 * Validate one registry card (a house). `id` pins it to its filename when loaded
 * from disk. Returns error strings; empty means valid. The card names the house
 * (its repo), what it publishes (the package the website pulls), and its `kind`.
 * All three are required: the repo is the house, the package is what it holds,
 * and the kind is what sort of house it is -- none of which khai can derive,
 * because the house is another repository.
 */
export function validateEntry(entry, { id } = {}) {
  if (!entry || typeof entry !== "object") return ["card is not an object"];
  const e = [];
  if (!isSlug(entry.id)) e.push(`id must be a slug, got ${JSON.stringify(entry.id)}`);
  if (id && entry.id !== id) e.push(`id "${entry.id}" must match the filename "${id}"`);
  if (typeof entry.title !== "string" || !entry.title.trim()) e.push("title is required");
  if (!isPackage(entry.package))
    e.push(`package must be an npm name, got ${JSON.stringify(entry.package)}`);
  if (typeof entry.blurb !== "string" || !entry.blurb.trim()) {
    e.push("blurb is required");
  } else if (
    /\b(und|der|die|das|ist|für|mit|von|im|zu|dem|den|des|ein|eine|einer|eines|auf|aus|bei|nach|um|vor|gegen|ohne|durch|wie|so|ja|nein)\b/i.test(
      entry.blurb,
    )
  ) {
    e.push(`blurb must be in English, got ${JSON.stringify(entry.blurb)}`);
  }
  if (typeof entry.repo !== "string" || !/^https?:\/\//.test(entry.repo))
    e.push("repo is required and must be an http(s) URL (the house)");
  if (!KINDS.includes(entry.kind))
    e.push(
      `kind is required and must be one of ${KINDS.join(", ")}, got ${JSON.stringify(entry.kind)}`,
    );
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
    let entry;
    try {
      entry = JSON.parse(readFileSync(join(dir, file), "utf8"));
    } catch (e) {
      // Name the file so the block message points at the card to fix (a raw
      // SyntaxError would not).
      throw new Error(`khai-plays: ${file}: invalid JSON (${e.message})`);
    }
    const errors = validateEntry(entry, { id });
    if (errors.length) throw new Error(`khai-plays: ${file}: ${errors.join("; ")}`);
    houses.push(entry);
  }
  return houses.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * One line of calibration: how many houses, and how they split by kind. Computed
 * from the cards rather than typed, so it is right on every render -- a count in
 * hand-kept prose is wrong the first time a house is registered.
 */
function tally(houses) {
  const by = KINDS.map((k) => [k, houses.filter((h) => h.kind === k).length]).filter(
    ([, n]) => n > 0,
  );
  const parts = by.map(([k, n]) => `${n} ${k}`).join(", ");
  return `${houses.length} ${houses.length === 1 ? "house" : "houses"}: ${parts}.`;
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
    "The house registry: the bill. khai holds the index of the houses, not what",
    "they hold. One registry covers every house that depends on khai, and each",
    "card declares its `kind` -- the three share an architecture and hold",
    "different things:",
    "",
    ...KINDS.map((k) => `- **${k}** -- ${KIND_BLURB[k]}.`),
    "",
    "Each card names the house (its repository) and the package it publishes.",
    "khai knows the house by its card; the website knows it from khai and pulls",
    "the package for the rest.",
    "",
    ...(houses.length ? [tally(houses), ""] : []),
    "Generated from the registry, never hand-edited. Run",
    '`npx @chbrain/khai-plays register <source> --kind <kind> --blurb "..."` to add',
    "a card (its shape is in `registry/README.md`); it rewrites this file.",
    "",
  ];

  // A section per kind, in KINDS order, and only for kinds the bill actually
  // holds -- an empty heading would read as a missing house rather than as a
  // kind nobody has registered yet.
  const body = [];
  if (houses.length === 0) {
    body.push("## Houses", "", "None registered yet.", "");
  } else {
    for (const kind of KINDS) {
      const of = houses.filter((h) => h.kind === kind);
      if (!of.length) continue;
      const what = KIND_BLURB[kind];
      body.push(
        `## ${kind[0].toUpperCase()}${kind.slice(1)}`,
        "",
        `${what[0].toUpperCase()}${what.slice(1)}.`,
        "",
      );
      for (const h of of) {
        body.push(`- **[${h.title}](${h.repo})** (\`${h.package}\`): ${h.blurb}`);
      }
      body.push("");
    }
  }

  const tail = [
    "## Reading the bill",
    "",
    "`loadRegistry()` and `houses` return the validated cards, sorted by id, each",
    "carrying its `kind`. The website renders them, links each house, and pulls",
    "its package to read what the house holds.",
    "",
  ];
  return [...head, ...body, ...tail].join("\n");
}

export const houses = (() => {
  try {
    return loadRegistry();
  } catch {
    return [];
  }
})();

export default { houses, loadRegistry, validateEntry, renderReadme, slug, KINDS, KIND_BLURB };
