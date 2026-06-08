// Machine-readable contract for the khai architecture, read at runtime from
// the canon's own type-definition files. The `.md` frontmatter is the single
// source of truth (and is mnemonic-locked by khai-arch's own tests), so this
// export can never drift from the definitions — there is no generated artifact
// to fall out of sync.
//
// Consumers (khai-tests, the configurator website) import `types` instead of
// re-parsing markdown, collapsing N drift points to zero.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import matter from "gray-matter";

const here = dirname(fileURLToPath(import.meta.url));
const archDir = join(here, "architecture");
const templatesDir = join(here, "templates");

/**
 * @typedef {Object} KhaiType
 * @property {string} id        canonical slug, equals the `khai:` value instances declare
 * @property {"house"|"element"|"meta"} class
 * @property {string} mnemonic
 * @property {string[]} chapters  required `## <chapter>` sections, in canonical order
 * @property {string} subtitle
 */

/** @type {Record<string, KhaiType>} */
export const types = Object.fromEntries(
  readdirSync(archDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => matter(readFileSync(join(archDir, f), "utf8")).data)
    .filter((d) => d && typeof d.id === "string" && Array.isArray(d.chapters))
    .map((d) => [
      d.id,
      {
        id: d.id,
        class: d.class,
        mnemonic: d.mnemonic,
        chapters: d.chapters,
        subtitle: d.subtitle,
        voice: typeof d.voice === "string" ? d.voice : null,
      },
    ]),
);

/**
 * @typedef {Object} KhaiTemplate
 * @property {string} type  the khai type id the template instantiates
 * @property {string} file  path relative to the package, e.g. "templates/template_process.md"
 * @property {string} text  the template's full text
 */

/**
 * Authoring templates: one fillable skeleton per type, keyed by type id. Each
 * is a valid content instance (the kit proves this in khai-tests) whose section
 * bodies carry one-line guidance; `create` swaps the guidance and `[brackets]`
 * for real content. Read at runtime from the canon's own templates/ dir, so the
 * skeleton can never drift from the type contract it is built against.
 *
 * @type {Record<string, KhaiTemplate>}
 */
export const templates = Object.fromEntries(
  (existsSync(templatesDir) ? readdirSync(templatesDir) : [])
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const text = readFileSync(join(templatesDir, f), "utf8");
      return { khai: matter(text).data.khai, file: `templates/${f}`, text };
    })
    // Skip a template whose frontmatter lacks `khai`; keying on `undefined` would
    // collapse all such files onto one entry. (Parse once, too, not twice.)
    .filter((t) => typeof t.khai === "string" && t.khai)
    .map((t) => [t.khai, { type: t.khai, file: t.file, text: t.text }]),
);

/**
 * The playbook spine, owned by the canon. model.md declares the ordered groups
 * (each an ordered list of type ids) in a `groups` yaml block; this reads it so
 * consumers render the playbook instead of re-declaring its order or grouping.
 * Parsed via gray-matter by wrapping the block as frontmatter -- no extra yaml
 * dependency.
 * @type {{ id: string, label: string, members: string[] }[]}
 */
const modelText = readFileSync(join(archDir, "model.md"), "utf8");
const groupsBlock = modelText.match(/```ya?ml\n([\s\S]*?)```/);
export const playbook = groupsBlock
  ? (matter(`---\n${groupsBlock[1]}---\n`).data.groups ?? [])
  : [];

/**
 * The canon's own one-line description of the bound playbook. Lives in
 * package.json `khai.tagline`, the same slot khai-methods and khai-skills use,
 * so all three packages share the same shape. Null when absent.
 * @type {string|null}
 */
import pkg from "./package.json" with { type: "json" };
export const playbookTagline = pkg.tagline ?? null;

/** Required `## ` section headers for a type id, in canonical order. */
export function chaptersFor(typeId) {
  return types[typeId]?.chapters ?? null;
}

/**
 * The two section prefix a "TO ___" type carries ahead of its chapters, so the
 * full H2 list spells the mnemonic: the "T" (Taxonomy, the group above) and the
 * "O" (Owner, the origin). A type whose mnemonic does not begin with "TO "
 * (instructions=HACKS, play=ENACTS, engines=WIRE) carries neither -- its
 * chapters spell the whole word -- so its prefix is empty. This is the single
 * source of the prefix vocabulary; the kit pulls it rather than restating it.
 * @param {string} typeId
 * @returns {string[]}
 */
export function toPrefix(typeId) {
  return types[typeId]?.mnemonic?.startsWith("TO ") ? ["Taxonomy", "Owner"] : [];
}

/**
 * Per-type extra frontmatter keys beyond the base {khai, license, stamp}, each
 * mapped to its allowed enum. Persona alone carries `type:` -- its real-world
 * exposure class (Real carries legal/reputational exposure; Archetype is drawn
 * from life but anonymised; Fictional is invented). The canon owns the values;
 * the kit pulls this and enforces it (frontmatterExtras stays the single source).
 * @param {string} typeId
 * @returns {Record<string, string[]>}
 */
const FRONTMATTER_EXTRAS = {
  persona: { type: { values: ["real", "archetype", "fictional"], required: true } },
  play: { description: { required: false } },
  plan: { status: { values: ["draft", "active", "closed"], required: true } },
};
export function frontmatterExtras(typeId) {
  const extra = FRONTMATTER_EXTRAS[typeId] ?? {};
  return { voice: { required: false }, ...extra };
}

/**
 * WIRES: the chapters of an engine card. An engine instance fills the `engines`
 * type (WIRE: Wire, Issue, Require, Enforce) and adds one chapter -- Setup, the
 * instance-specific wiring. Derived from the type so the instance contract can
 * never drift from the definition: WIRES = engines.chapters + Setup.
 * @type {string[]}
 */
export const wiresChapters = [...(chaptersFor("engines") ?? []), "Setup"];

/**
 * LORE: the reference standard. Every component (an engine, and later every
 * culture) ships a REFERENCES.md whose top-level chapters are exactly these, in
 * order -- the warrant for the component to exist. Their first letters spell
 * LORE. Unlike a type's chapters, this set is fixed canon shared by ALL
 * components, not derived from a type spec. An author may split a heavy chapter
 * into `### ` subchapters; the renderer paginates one (sub)chapter per snap.
 * @type {string[]}
 */
export const referenceChapters = ["Line of Work", "Origin", "Restrictions", "Encoding"];

/**
 * ENACTS: the play standard. Every play document (e.g. play_woyzeck.md) must
 * conform to the ENACTS mnemonic, in order.
 * @type {string[]}
 */
export const playChapters = ["Estate", "Name", "Arc", "Company", "Triggers", "Stakes"];

/**
 * TO DO IT: the management plan standard chapters (excluding Taxonomy/Owner prefix).
 * @type {string[]}
 */
export const planChapters = ["Direction", "Orders", "Implementation", "Targets"];

/**
 * DO IT: the management order standard.
 * @type {string[]}
 */
export const orderChapters = ["Direction", "Orders", "Implementation", "Targets"];

/**
 * Normalize an engine manifest into a flat list of typed members arranged on a
 * composition tree. Each member is { file, type, parent } where `parent` is the
 * file of the member it hangs beneath (null at the root). Two manifest shapes
 * desugar to the same model, so the canon reads one thing:
 *
 *   - explicit:  manifest.members = [{ file, type, parent? }, ...]
 *   - shorthand: manifest.{type, anchor, expressions} -- the anchor is the root,
 *     every expression hangs beneath it, all of the engine's single type.
 *
 * khai-arch owns this shape (it owns the WIRE type); the kit and engine loaders
 * consume the normalized members instead of re-deriving the tree, so the
 * "deeper carries shallower upward" rule lives in exactly one place. Throws on a
 * member with no file, a duplicate file, an unknown type, a dangling parent, no
 * root, more than one root, or a cycle.
 *
 * @param {object} manifest  the package.json `khai` block
 * @returns {{ file: string, type: string, parent: string|null }[]}
 */
export function engineMembers(manifest) {
  if (!manifest || typeof manifest !== "object")
    throw new Error("engineMembers: an engine manifest is required");
  const id = manifest.engine ?? "engine";

  let members;
  if (Array.isArray(manifest.members)) {
    members = manifest.members.map((m) => ({
      file: m?.file,
      type: m?.type,
      parent: m?.parent ?? null,
    }));
  } else {
    const { type, anchor, expressions = {} } = manifest;
    if (typeof anchor !== "string" || !anchor.trim())
      throw new Error(`engineMembers(${id}): manifest needs "members" or an "anchor"`);
    members = [
      { file: anchor, type, parent: null },
      ...Object.values(expressions).map((file) => ({ file, type, parent: anchor })),
    ];
  }

  const byFile = new Map();
  for (const m of members) {
    if (typeof m.file !== "string" || !m.file.trim())
      throw new Error(`engineMembers(${id}): every member needs a "file"`);
    if (byFile.has(m.file))
      throw new Error(`engineMembers(${id}): duplicate member file "${m.file}"`);
    if (typeof m.type !== "string" || !types[m.type])
      throw new Error(`engineMembers(${id}): member "${m.file}" has unknown type "${m.type}"`);
    byFile.set(m.file, m);
  }

  const roots = members.filter((m) => m.parent === null);
  if (roots.length !== 1)
    throw new Error(
      `engineMembers(${id}): exactly one root (parent: null) is required, found ${roots.length}`,
    );
  for (const m of members)
    if (m.parent !== null && !byFile.has(m.parent))
      throw new Error(
        `engineMembers(${id}): member "${m.file}" names parent "${m.parent}", which is not a member`,
      );
  // every member must reach the root within N hops (catches cycles)
  for (const m of members) {
    let cur = m;
    for (let hops = 0; cur.parent !== null; hops++) {
      cur = byFile.get(cur.parent);
      if (hops > members.length)
        throw new Error(`engineMembers(${id}): cycle detected reaching the root from "${m.file}"`);
    }
  }
  return members;
}

/**
 * The composition chains of an engine: for every leaf member (one no other
 * member hangs beneath), the ordered list of files from the root down to that
 * leaf. This is the canon's "carry upward" rule made concrete -- composing a
 * leaf emits its whole chain, root first, so the deeper member carries the
 * shallower ones upward. gender's depth-1 tree yields [anchor, expression]; a
 * process ladder yields [root, channel, width].
 *
 * @param {object} manifest
 * @returns {Record<string, string[]>}  leaf file -> [root, ..., leaf]
 */
export function compositionOrder(manifest) {
  const members = engineMembers(manifest);
  const byFile = new Map(members.map((m) => [m.file, m]));
  const parents = new Set(members.map((m) => m.parent).filter((p) => p !== null));
  const chainOf = (file) => {
    const chain = [];
    for (let cur = byFile.get(file); cur; cur = cur.parent ? byFile.get(cur.parent) : null)
      chain.unshift(cur.file);
    return chain;
  };
  return Object.fromEntries(
    members.filter((m) => !parents.has(m.file)).map((m) => [m.file, chainOf(m.file)]),
  );
}

/**
 * Build a render-ready WIRES card from an engine's `khai` manifest block (the
 * `khai` field of its package.json). The card prose is authored under
 * `manifest.card`, keyed by the lowercased WIRES chapter names (wire, issue,
 * require, enforce, setup). Returns the normalized card; throws if the engine
 * slug or any chapter is missing/empty, or an unknown card key appears.
 *
 * khai-arch owns this shape (it owns the WIRE type); consumers render the
 * returned card and khai-tests enforces it on every installed engine.
 *
 * @param {{ engine?: string, type?: string, anchor?: string, card?: Record<string,string> }} manifest
 * @returns {{ id: string, type: string|null, anchor: string|null, mnemonic: "WIRES", chapters: string[], sections: Record<string,string> }}
 */
export function engineCard(manifest) {
  if (!manifest || typeof manifest !== "object")
    throw new Error("engineCard: an engine manifest (package.json `khai` block) is required");
  const id = manifest.engine;
  if (typeof id !== "string" || !id.trim())
    throw new Error("engineCard: manifest.engine (the engine slug) is required");
  const card = manifest.card;
  if (!card || typeof card !== "object")
    throw new Error(`engineCard(${id}): manifest.card is required -- the WIRES chapters as prose`);

  const allowed = new Set(wiresChapters.map((c) => c.toLowerCase()));
  for (const k of Object.keys(card))
    if (!allowed.has(k)) throw new Error(`engineCard(${id}): unknown card key "${k}"`);

  const sections = {};
  for (const chapter of wiresChapters) {
    const prose = card[chapter.toLowerCase()];
    if (typeof prose !== "string" || !prose.trim())
      throw new Error(`engineCard(${id}): card.${chapter.toLowerCase()} must be non-empty prose`);
    sections[chapter] = prose.trim();
  }

  // type/anchor default to the explicit fields (legacy shorthand); when an
  // engine declares `members` instead, derive them from the root member so the
  // rendered card still names the engine's seam and kind.
  let type = manifest.type ?? null;
  let anchor = manifest.anchor ?? null;
  if ((type === null || anchor === null) && Array.isArray(manifest.members)) {
    const root = engineMembers(manifest).find((m) => m.parent === null);
    type = type ?? root.type;
    anchor = anchor ?? root.file;
  }

  return {
    id,
    type,
    anchor,
    mnemonic: "WIRES",
    chapters: wiresChapters,
    sections,
  };
}

// A `---` thematic rule is legal inside a chapter body, and a fenced code block
// can contain `---` (a YAML example) or `## ` (an example heading). The coda --
// an optional trailing note after a final `---` rule -- is therefore found by
// scanning UNFENCED lines only: it begins at the first unfenced `---` rule that
// has no chapter header (`## `) anywhere after it. Everything before stays in
// `main`, so an intra-chapter rule never truncates the document (which would
// drop later chapters and throw a misleading "chapters must be exactly" error).
function fencedLines(lines) {
  const fenced = new Array(lines.length).fill(false);
  let marker = null;
  for (let i = 0; i < lines.length; i++) {
    if (marker === null) {
      const open = /^\s*(`{3,}|~{3,})/.exec(lines[i]);
      if (open) {
        marker = open[1];
        fenced[i] = true;
      }
    } else {
      fenced[i] = true;
      const close = /^\s*(`{3,}|~{3,})\s*$/.exec(lines[i]);
      if (close && close[1][0] === marker[0] && close[1].length >= marker.length) marker = null;
    }
  }
  return fenced;
}

function splitCoda(body) {
  const lines = body.split("\n");
  const fenced = fencedLines(lines);
  const isHeader = (i) => !fenced[i] && /^##\s/.test(lines[i]);
  for (let i = 0; i < lines.length; i++) {
    if (fenced[i] || lines[i] !== "---") continue;
    // A trailing rule: no chapter header follows, so the rest is the coda.
    let trailing = true;
    for (let j = i + 1; j < lines.length; j++) {
      if (isHeader(j)) {
        trailing = false;
        break;
      }
    }
    if (trailing) {
      return {
        main: lines.slice(0, i).join("\n"),
        coda:
          lines
            .slice(i + 1)
            .join("\n")
            .trim() || null,
      };
    }
  }
  return { main: body, coda: null };
}

// Strip a closed-ATX trailing run (`## Origin ##` -> "Origin") from a header
// whose leading hashes are already removed: a run of `#` at end of line that is
// preceded by whitespace. A `#` not preceded by a space (e.g. "C#") is kept.
// Mirrors parseDoc in @chbrain/khai-rules so chapter names resolve identically.
function stripClosingHashes(text) {
  let t = text.trim();
  if (t.endsWith("#")) {
    let j = t.length;
    while (j > 0 && t[j - 1] === "#") j--;
    if (j > 0 && /\s/.test(t[j - 1])) t = t.slice(0, j).trimEnd();
  }
  return t;
}

// Split `main` into ordered chapters and their `### ` subchapters. Fence-aware:
// a `## `/`### ` inside a fenced code block (e.g. a YAML example in a chapter
// body) is content, not a header, so it never makes a phantom chapter that would
// fail the exact-chapters contract on a valid document. Closed-ATX-aware via
// stripClosingHashes, so names match what parseDoc indexes.
function parseChapters(main) {
  const lines = main.split("\n");
  const fenced = fencedLines(lines);
  const at = (i, re) => !fenced[i] && re.test(lines[i]);

  const starts = [];
  for (let i = 0; i < lines.length; i++) if (at(i, /^## /)) starts.push(i);

  const seen = [];
  const sections = {};
  for (let c = 0; c < starts.length; c++) {
    const start = starts[c];
    const end = c + 1 < starts.length ? starts[c + 1] : lines.length;
    const name = stripClosingHashes(lines[start].replace(/^##\s+/, ""));
    seen.push(name);

    const subStarts = [];
    for (let i = start + 1; i < end; i++) if (at(i, /^###\s/)) subStarts.push(i);
    const introEnd = subStarts.length ? subStarts[0] : end;
    const body = lines
      .slice(start + 1, introEnd)
      .join("\n")
      .trim();

    const subchapters = subStarts.map((ss, s) => {
      const se = s + 1 < subStarts.length ? subStarts[s + 1] : end;
      return {
        name: stripClosingHashes(lines[ss].replace(/^###\s+/, "")),
        body: lines
          .slice(ss + 1, se)
          .join("\n")
          .trim(),
      };
    });
    sections[name] = { body, subchapters };
  }
  return { seen, sections };
}

/**
 * Project a component's REFERENCES.md into a render-ready warrant: the four LORE
 * chapters in order, each with its prose and any author `### ` subchapters, plus
 * an optional trailing `---` coda. Mirrors engineCard -- the canon owns the
 * shape, consumers render it, and khai-tests enforces it on every engine.
 *
 * Throws if a chapter is missing, out of order, foreign, or empty -- the same
 * teeth that make every engine carry a valid WIRES card.
 *
 * @param {string} text  the REFERENCES.md file text (YAML frontmatter allowed)
 * @returns {{ mnemonic: "LORE", chapters: string[], sections: Record<string, { body: string, subchapters: { name: string, body: string }[] }>, coda: string|null }}
 */
export function referenceCard(text) {
  if (typeof text !== "string" || !text.trim())
    throw new Error("referenceCard: REFERENCES.md text is required");
  const body = matter(text).content.trim();

  // An optional trailing coda after a final `---` rule (as a spec's coda is).
  const { main, coda } = splitCoda(body);

  // Chapters and their `### ` subchapters; the H1/preamble before the first
  // `## ` is dropped. Fence-aware and closed-ATX-aware (see parseChapters).
  const { seen, sections } = parseChapters(main);

  // The canon contract: exactly the LORE chapters, in order, nothing foreign.
  if (seen.length !== referenceChapters.length || seen.some((n, i) => n !== referenceChapters[i]))
    throw new Error(
      `referenceCard: REFERENCES.md chapters must be exactly [${referenceChapters.join(", ")}] ` +
        `in order (LORE); got [${seen.join(", ")}]`,
    );
  // Every chapter must carry content -- body prose or at least one subchapter.
  for (const name of referenceChapters)
    if (!sections[name].body && sections[name].subchapters.length === 0)
      throw new Error(`referenceCard: chapter "${name}" is empty`);

  return { mnemonic: "LORE", chapters: referenceChapters, sections, coda };
}

/**
 * Project a play document into a render-ready card: the six ENACTS chapters in
 * order, each with its prose and any author `### ` subchapters, plus an optional
 * trailing `---` coda.
 *
 * Throws if a chapter is missing, out of order, foreign, or empty.
 *
 * @param {string} text  the play file text (YAML frontmatter allowed)
 * @returns {{ mnemonic: "ENACTS", chapters: string[], sections: Record<string, { body: string, subchapters: { name: string, body: string }[] }>, coda: string|null }}
 */
export function playCard(text) {
  if (typeof text !== "string" || !text.trim()) throw new Error("playCard: play text is required");
  const body = matter(text).content.trim();

  // An optional trailing coda after a final `---` rule (as a play's builder note is).
  const { main, coda } = splitCoda(body);

  // Chapters and their `### ` subchapters; the H1/preamble before the first
  // `## ` is dropped. Fence-aware and closed-ATX-aware (see parseChapters).
  const { seen, sections } = parseChapters(main);

  // The ENACTS contract: exactly the ENACTS chapters, in order, nothing foreign.
  if (seen.length !== playChapters.length || seen.some((n, i) => n !== playChapters[i]))
    throw new Error(
      `playCard: play chapters must be exactly [${playChapters.join(", ")}] ` +
        `in order (ENACTS); got [${seen.join(", ")}]`,
    );
  // Every chapter must carry content -- body prose or at least one subchapter.
  for (const name of playChapters)
    if (!sections[name].body && sections[name].subchapters.length === 0)
      throw new Error(`playCard: chapter "${name}" is empty`);

  return { mnemonic: "ENACTS", chapters: playChapters, sections, coda };
}

/**
 * Project a management plan document into a render-ready card: the six TO DO IT
 * chapters in order, each with its prose and any author `### ` subchapters, plus
 * an optional trailing `---` coda.
 *
 * Throws if a chapter is missing, out of order, foreign, or empty.
 *
 * @param {string} text  the plan file text (YAML frontmatter allowed)
 * @returns {{ mnemonic: "TO DO IT", chapters: string[], sections: Record<string, { body: string, subchapters: { name: string, body: string }[] }>, coda: string|null }}
 */
export function planCard(text) {
  if (typeof text !== "string" || !text.trim()) throw new Error("planCard: plan text is required");
  const body = matter(text).content.trim();

  // An optional trailing coda after a final `---` rule.
  const { main, coda } = splitCoda(body);

  // Chapters and their `### ` subchapters; the H1/preamble before the first
  // `## ` is dropped. Fence-aware and closed-ATX-aware (see parseChapters).
  const { seen, sections } = parseChapters(main);

  const expectedChapters = ["Taxonomy", "Owner", ...planChapters];

  // The TO DO IT contract: exactly the TO DO IT chapters, in order, nothing foreign.
  if (seen.length !== expectedChapters.length || seen.some((n, i) => n !== expectedChapters[i]))
    throw new Error(
      `planCard: plan chapters must be exactly [${expectedChapters.join(", ")}] ` +
        `in order (TO DO IT); got [${seen.join(", ")}]`,
    );
  // Every chapter must carry content.
  for (const name of expectedChapters)
    if (!sections[name].body && sections[name].subchapters.length === 0)
      throw new Error(`planCard: chapter "${name}" is empty`);

  return { mnemonic: "TO DO IT", chapters: expectedChapters, sections, coda };
}

/**
 * Project a management order document into a render-ready card: the four DO IT
 * chapters in order, each with its prose and any author `### ` subchapters, plus
 * an optional trailing `---` coda.
 *
 * Throws if a chapter is missing, out of order, foreign, or empty.
 *
 * @param {string} text  the order file text (YAML frontmatter allowed)
 * @returns {{ mnemonic: "DO IT", chapters: string[], sections: Record<string, { body: string, subchapters: { name: string, body: string }[] }>, coda: string|null }}
 */
export function orderCard(text) {
  if (typeof text !== "string" || !text.trim())
    throw new Error("orderCard: order text is required");
  const body = matter(text).content.trim();

  // An optional trailing coda after a final `---` rule.
  const { main, coda } = splitCoda(body);

  // Chapters and their `### ` subchapters; the H1/preamble before the first
  // `## ` is dropped. Fence-aware and closed-ATX-aware (see parseChapters).
  const { seen, sections } = parseChapters(main);

  // The DO IT contract: exactly the DO IT chapters, in order, nothing foreign.
  if (seen.length !== orderChapters.length || seen.some((n, i) => n !== orderChapters[i]))
    throw new Error(
      `orderCard: order chapters must be exactly [${orderChapters.join(", ")}] ` +
        `in order (DO IT); got [${seen.join(", ")}]`,
    );
  // Every chapter must carry content.
  for (const name of orderChapters)
    if (!sections[name].body && sections[name].subchapters.length === 0)
      throw new Error(`orderCard: chapter "${name}" is empty`);

  return { mnemonic: "DO IT", chapters: orderChapters, sections, coda };
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
// Linear, not /\s*[–—]\s*/g: that backtracks O(n) per position on long space
// runs (CodeQL polynomial-regex). Replace the dash, then collapse the seam.
const normalizeDashes = (s) => s.replace(/[–—]/g, ", ").replace(/ {2,}/g, " ").replace(/ ,/g, ",");

/**
 * A natural-language label for a member file, for use as link *text* -- never
 * the technical filename. A link's text is read literally by an LLM, so
 * `[gender](position_gender.md)` injects "gender" (meaning) while
 * `[position_gender.md](...)` injects a noisy token. Strip the type prefix and
 * extension, underscores to spaces: position_gender.md -> "gender".
 */
const memberLabel = (file) =>
  file
    .replace(/\.md$/, "")
    .replace(/^(position|process|piece|place|play|plot|persona)_/, "")
    .replace(/_/g, " ");

/**
 * Render an engine's README from its package.json -- the single, generated shape
 * every engine shares. The README is a pointer, never a second copy of the card:
 * it names the engine, its one-line tagline (`khai.tagline`, else the package
 * `description`), its member files (from the
 * composition tree, root marked as the anchor), and where the real sources of
 * truth live (the manifest / WIRES card, and REFERENCES.md). The kit regenerates
 * and diffs this, so a hand-edited or drifted README fails -- the README can
 * never disagree with the manifest. Output is newline-terminated; an em/en-dash
 * in the tagline becomes a comma, so the result follows the house voice
 * ( , ; : () ) instead of the dash family.
 *
 * @param {{ name?: string, description?: string, license?: string, khai: object }} pkg
 * @returns {string} the README markdown
 */
export function renderEngineReadme(pkg) {
  if (!pkg || typeof pkg !== "object" || !pkg.khai)
    throw new Error("renderEngineReadme: a package.json object with a `khai` block is required");
  const manifest = pkg.khai;
  const members = engineMembers(manifest);
  const rootFile = members.find((m) => m.parent === null).file;

  const title =
    typeof manifest.title === "string" && manifest.title.trim()
      ? manifest.title.trim()
      : capitalize(manifest.engine ?? "engine");
  const taglineSource =
    typeof manifest.tagline === "string" && manifest.tagline.trim()
      ? manifest.tagline
      : (pkg.description ?? "");
  const tagline = normalizeDashes(taglineSource.trim());
  const license = pkg.license ?? "UNLICENSED";
  const files = members
    .map(
      (m) =>
        `- [${memberLabel(m.file)}](${m.file}): ${m.type}${m.file === rootFile ? " (anchor)" : ""}`,
    )
    .join("\n");

  return (
    `# ${title}\n\n` +
    (tagline ? `${tagline}\n\n` : "") +
    "This engine is defined by its [manifest](package.json), which the canon renders as the WIRES " +
    "card. The manifest is the single source of truth; this README is generated, not edited by " +
    "hand.\n\n" +
    `## Files\n\n${files}\n\n` +
    "See [sources and attribution](REFERENCES.md).\n\n" +
    `License: ${license}\n`
  );
}

export default {
  types,
  templates,
  chaptersFor,
  toPrefix,
  frontmatterExtras,
  playbook,
  playbookTagline,
  wiresChapters,
  referenceChapters,
  playChapters,
  planChapters,
  orderChapters,
  engineMembers,
  compositionOrder,
  engineCard,
  referenceCard,
  playCard,
  planCard,
  orderCard,
  renderEngineReadme,
};
