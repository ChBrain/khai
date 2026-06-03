# @chbrain/khai-engine-gender

## 0.1.1

### Patch Changes

- 56146ac: refs(gender): Restrictions as a bullet list (author's edit) + drop duplicate frontmatter. The three `### ` Restrictions subchapters collapse into one `## Restrictions` with three bullets (renders as one snap, not three). Authorship lives once in the coda (the LORE-sanctioned home), so the duplicating `authorship` / `content_model` frontmatter keys are removed.
- 8bc8bbe: fix(gender): conform the `## Taxonomy` fields to the position template — a name (linked where the parent has a file), not a sentence. The anchor reports into `Social structure` (no khai file of its own yet); the female/male expressions report into `[Gender]`. Drops the descriptive prose the template ("name it") never sanctioned.

## 0.1.0

### Minor Changes

- 2ccfbc2: Version floor: align every published package at 0.1.0. khai-arch, khai-tests,
  and khai-guard reached 0.1.0 with the LORE + Title -> Taxonomy release; this
  raises the remaining packages (khai-rules, khai-review, khai-engine-gender) to
  the same floor, marking the line's first coherent version. A maintainer's
  deliberate minor, not a feature delta -- declared by the maintainer, which is
  the only one who may call a minor.

## 0.0.11

### Patch Changes

- a2f9442: Remove the gender engine's "guardrails reject drift" tests: they re-proved the
  kit's own rules (dropped chapter, invented Owner key, undeclared extension)
  through gender's content. That proof lives in khai-tests against its own
  fixture; the engine now tests only what is gender-specific (conformance,
  manifest, compose). Test-only; the published artifact is unchanged.
- dc27f9a: Title -> Taxonomy: the gender engine's position content. Each `## Title` (the
  dead H1 echo) becomes `## Taxonomy`, the group above. Male and Female point up
  to their anchor, `[Gender](position_gender.md)` -- the read they are each one
  expression of (the shared-anchor relation the warrant already endorses). Gender
  itself, the engine's anchor, names its group above as social structure (the read
  a room places on a body before it speaks, not an internalized identity, per
  Risman and West & Zimmerman), with no file of its own yet.
- 01e4e73: Introduce the **LORE** reference standard. Every component's `REFERENCES.md`
  now carries four fixed canon chapters, in order, the warrant for the component
  to exist:
  - **L — Line of Work** — what it models, and what it isn't
  - **O — Origin** — the sources it rests on
  - **R — Restrictions** — what it refuses to claim, and to whom it delegates
  - **E — Encoding** — source to constraint, per file

  khai-arch gains `referenceChapters` and `referenceCard(text)` (sibling to
  `engineCard`): it validates the four chapters are present and in order,
  collects any author `### ` subchapters under each (the renderer paginates one
  (sub)chapter per snap), and returns `{ mnemonic, chapters, sections, coda }`.
  gender's `REFERENCES.md` is restructured as the first conformer.

  khai-tests gains the teeth: `validateEnginePackage` runs `referenceCard` over
  every engine's `REFERENCES.md`, so a missing or non-conforming warrant fails the
  suite. The standard is documented as a canon companion in
  `architecture/reference.md`.

- Updated dependencies [95f4264]
- Updated dependencies [34c6d7b]
- Updated dependencies [01e4e73]
- Updated dependencies [2d29311]
- Updated dependencies [67e7925]
- Updated dependencies [7ebebf0]
- Updated dependencies [1996d77]
  - @chbrain/khai-arch@0.1.0

## 0.0.10

### Patch Changes

- 31edc88: Tighten the WIRES card's Require and Setup chapters and stop explaining the wiring
  twice. Require now states the contract (the two altitudes that must hold, and
  why); Setup gives the procedure (the steps), without re-justifying it. The wiring
  is explained once and enacted once, so the two chapters have distinct jobs.
  Also drop a stray em-dash from the package description, for the house voice.

## 0.0.9

### Patch Changes

- 278b423: Make gender's two wiring altitudes machine-readable, each at its level. The
  manifest now declares the law (the world's Instructions Knowledge chapter must
  link the anchor) alongside the per-persona read under Projection, both at `fail`
  (the structural floor the card's Enforce chapter describes). The engine now
  declares how it is enabled, not just how each persona carries it.
- 77f514f: Add a voice-clean `khai.tagline` to the manifest as the canonical one-liner for
  the engine, and switch the README to the canon-generated shape (regenerated from
  the manifest, not hand-edited).

## 0.0.8

### Patch Changes

- Updated dependencies [e4d7aef]
- Updated dependencies [cebda9f]
  - @chbrain/khai-arch@0.0.10

## 0.0.7

### Patch Changes

- 295d0c3: Gender: make the WIRES card the single source of teaching and end the blended
  reality between `package.json` and the README.
  - Remove the legacy free-text `khai.wiring` and `khai.requirement` fields; they
    duplicated `card.setup` and `card.require`. The card is now the one place the
    engine teaches, and the canon renders it.
  - Reduce `README.md` to a thin pointer at the manifest/card instead of a
    hand-maintained second copy (also drops the stale version footer).
  - Correct the persona wiring doctrine: drop "exactly one expression / two and
    the room contradicts itself." The read the room receives lives under
    Projection; a persona may also hold a different, even contradicting, read
    under Shadow - the gap between shown and hidden is the character, not an error.
  - Reframe `card.enforce` along the checked-structure vs judged-coherence line:
    the kit verifies the floor (law declared, a read under Projection); whether a
    Projection and a Shadow read cohere is semantic, taught and reviewed, never
    failed by the suite.

  Structure (`anchor`, `expressions`, `requires`) and `compose()` are unchanged.

- c91e9f0: Voice-clean the WIRES card prose. The `" - "` clause dashes in `card.wire`,
  `require`, `enforce`, and `setup` become `, ; : ( )`, matching the house voice.
  The card is what the website renders, so this was the last unclean surface in
  the engine: the `.md` files were already clean, but card prose lives in
  `package.json` and is not reached by the `.md` doc-checks.
- 4c3d9f1: REFERENCES: meet the engine docs standard. Metadata moves into YAML frontmatter
  (authorship / content_model / updated) instead of a bold-line header; the member
  files are linked in "Structural Mapping by File" (real links, not backticks, so
  the Obsidian graph connects and the theory to application edges exist); and the
  " - " is gone from the H1. gender now passes the full docs standard: frontmatter,
  natural link text, no clause dash, no footer, no loose file.
- Updated dependencies [9f0dc51]
- Updated dependencies [abf5cdb]
  - @chbrain/khai-arch@0.0.9

## 0.0.6

### Patch Changes

- 1fd1552: Engines: introduce the WIRES card. khai-arch gains `engineCard(manifest)` and
  `wiresChapters` - the engine-instance contract (Wire, Issue, Require, Enforce +
  Setup), derived from the engines type so it can never drift from the definition.
  The gender engine authors its `khai.card` (the five WIRES chapters), so a
  consumer can render the engine as a card under the playbook's "enriched by"
  group. khai-arch owns the schema; @chbrain/khai-tests will enforce it.
- Updated dependencies [1fd1552]
  - @chbrain/khai-arch@0.0.8

## 0.0.5

### Patch Changes

- Updated dependencies [f34d674]
  - @chbrain/khai-arch@0.0.7

## 0.0.4

### Patch Changes

- Updated dependencies [e3fc4d4]
  - @chbrain/khai-arch@0.0.6

## 0.0.3

### Patch Changes

- Updated dependencies [dbb3892]
  - @chbrain/khai-arch@0.0.5

## 0.0.2

### Patch Changes

- Updated dependencies [b8549f6]
  - @chbrain/khai-arch@0.0.4

## 0.0.1

### Patch Changes

- Initial release: the gender domain as a khai engine package — the
  `position` anchor plus the male and female expressions, with a declarative
  `khai` manifest and a `compose()` entry point. Depends on
  `@chbrain/khai-arch`.
