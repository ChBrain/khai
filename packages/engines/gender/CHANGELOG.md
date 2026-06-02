# @chbrain/khai-engine-gender

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
