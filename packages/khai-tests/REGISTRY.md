---
khai: design-of-record
title: "Registry entries: cultures + groups"
status: agreed
license: CC-BY-NC-SA-4.0
---

# Design of record — registry entries (cultures + groups)

The engine-side mirror of one shared design. The **entry contract** section
below is the paragraph that lives identically here, in `khai-cultures`'
`REFERENCE.md`, and in the website's notes — both ends mirror it. The rest
splits the work by where each line lands: **engine** (this repo,
`@chbrain/khai-tests`, generic, benefits every house) versus **downstream**
(the `khai-cultures` repo and the website, recorded here only for the paper
trail — they do not ship from this repo).

> Scope note. Only the engine section is khai-monorepo work. It is governance
> lane (`packages/khai-tests/**`). The downstream sections are the contract the
> cultures repo and the website implement against; they are reproduced so the
> trail shows exactly which side each line lands on.

## Why the model is sound

The discriminated union is the right spine, and two correctness wins fall out
for free — a good sign the model is sound:

- **Non-mappable for free.** `buildRegistry` (`src/registry.mjs`) already reads
  each item's frontmatter; folding in an optional per-item `geo.json` makes
  "not on a map" simply an absent `iso` field. A culture that lists but does not
  place (e.g. Esperanto) omits `iso`, and stays group-referenceable.
- **Referential integrity for free.** A group's `references` are **derived**
  from the group play's `play_` casts, and those casts already run through the
  broken-link gate (`checkLinks`). A group therefore cannot reference a member
  that does not exist — the dead reference is caught at validation, not
  discovered by the website. "Derived, never authored" pays off here.
- **iso-in-registry kills the join.** Putting `iso` on the registry entry means
  the website reads one file, not an N-file join. This win is independent of the
  `entries[]` question below.

## The entry contract (shared — mirror both ends verbatim)

A registry entry is discriminated by **`kind`**:

| Field         | Culture entry           | Group entry                 |
| ------------- | ----------------------- | --------------------------- |
| `kind`        | `"culture"` (explicit)  | `"group"` (explicit)        |
| `id`          | `^[a-z0-9_]+$`          | `^[a-z0-9_]+$`              |
| `title`       | required                | required                    |
| `description` | one-sentence blurb      | one-sentence blurb          |
| `iso`         | **optional** (ISO 3166) | absent                      |
| `references`  | absent                  | **build-derived**, id-keyed |

Rules that hold for both ends:

- **`kind` is explicit on every entry**, both kinds — never inferred.
- **`iso` is optional.** Absent ⇒ non-mappable (the entry lists but does not
  place). Present ⇒ an ISO 3166 code, including ISO 3166-2 subdivisions
  (`DE-BY`); the parent country is derived from the code (`DE-BY` → `DE`).
- **`references` is id-keyed and build-derived**, never authored. It is computed
  from the group play's member casts, so referential integrity is a build
  property, not an authoring discipline.

## Decisions locked

**Sub-choice 1 — do _not_ make `registry.json` itself `entries[]`.** Keep the
engine's registry native and generic: a culture house emits `cultures: [...]`
(entries carrying `kind`/`iso`) **plus** `groups: [...]`. The discriminated
`entries[]` flattening happens **downstream**, in the website's
`build-downloads.mjs`, when it produces `available.json`.

Why the union lands website-side, not in `registry.json`:

- `entries[]` in `registry.json` is a **cross-house registry-format break**.
  Every khai house's registry shares this shape, and `verifyRegistry` /
  `validateCollectionRegistry` read it back; the version-count logic must keep
  counting **cultures only**. That is a deliberate "registry v2" decision on its
  own, not a rider on the groups feature.
- Nothing is lost where it counts. The end-to-end single shape lives in
  `available.json` — the file the website actually reads. The "one read, no
  N-file join" payoff comes entirely from **iso-in-registry**, which holds
  regardless. The two-array → `entries[]` union is a few lines in a build that
  already runs.

If the canonical registry should later become `entries[]` everywhere, that is a
clean, separate engine RFC ("registry v2").

**Sub-choice 2 — group is a lens only, for v1.** This is 100% website-side, zero
engine impact: the package builds no zips, so "no DACH bundle" just means
`build-downloads` assembles none. A real "download the group as one zip" later
is the embedded-closure packaging (namespacing / flatten included) and is the
consumer's problem. Deferred.

## Engine deltas — `@chbrain/khai-tests` (this repo, governance lane)

Generic, framed for every house — not cultures-specific. Source-first, then
dormant tests (the source/test gate forbids both on one branch).

1. **Referencing collection.** Support a collection that references other items
   (e.g. a `groups/` dir). Walk it, **derive `references`** from the member
   plays' casts, tag each emitted entry `kind:"group"`, and **exclude it from
   the version count** — the minor stays equal to the culture count
   (`deriveVersionFrom(version, items.length)` in `src/registry.mjs` must keep
   counting the indexed collection only).
2. **Optional per-item `geo.json`.** Merge an optional `geo.json` from each
   item's subdir into its registry entry, so `iso` lands on cultures and an
   absent file means non-mappable. Framed generically (a per-item sidecar merged
   into the entry), not as a cultures concept.
3. **`kind` discriminator.** Add `kind` (`"culture"` / `"group"`) to emitted
   entries, and teach `verifyRegistry` / `validateCollectionRegistry`
   (`src/validate.mjs`) to accept the richer shape: `kind` required and
   enumerated, `iso` optional (ISO 3166 / 3166-2 when present), `references`
   permitted on `kind:"group"`. The existing `{id,title,description}` blurb laws
   stay intact.

Note on today's code: `buildRegistry` walks exactly one collection
(`resolveCollection(packageJson)`) and emits `{ [collection.key]: items }` with
items `{id,title,description}`. Items 1–3 are the unavoidable engine work; they
are generic because the registry shape is shared canon across all houses.

## Downstream deltas — `khai-cultures` repo (out of this repo)

- `geo.json` → **iso-only** (allow ISO 3166-2 like `DE-BY`); drop
  `region`/`state`. Germany's `DE` stays.
- `package.json` `khai` config: declare the **groups referencing collection**.
- `REFERENCE.md` rewrite: groups-are-plays; **ownership + resolvable casting**
  (retire strict isolation); geo iso-only; generalize the plot-casting rows.
- `tests/house.test.mjs`: **remove** the isolation test and the persona-only
  plot law; add **kind-based** conformance (group minimums: no `pitch_`, ≥1
  member cast).
- _(later)_ `groups/` content, e.g. `groups/dach/`.

## Downstream deltas — website (out of this repo)

- `build-downloads.mjs`: read the native registry, **union to `entries[]`** and
  enrich with `asset`/`size` → `available.json` (`schemaVersion: 2`, `release`,
  `downloadBase`).
- `culture-tree.ts`: **parent-from-iso** (`DE-BY` → `DE`); consume
  `kind:"culture"`.
- Two atlases: **ISO 3166 names** + **UN M49 region → CVI**.
- **Group lens + collection** component: read `kind:"group"`, resolve
  `references` → `iso` for the highlight.
- Page reads the **v2 manifest**; group-as-zip deferred.

## Net

Only sub-choice 1 touched the engine, and the decision removes that touch:
native two arrays out of khai, `entries[]` union produced website-side. With
"native two arrays out, `entries[]` union in `build-downloads`" agreed, nothing
in the strawman blocks the engine work. The parent-from-iso tweak folds into the
website's `culture-tree`; the engine ships items 1–3 above, source first.
