# @chbrain/khai-skills

## 0.0.14

### Patch Changes

- 7d7056d: khai-playwright: teach the plan element and its Targets verdict vocabulary. A
  plan is an in-world blueprint (a mechanism with order), and its Targets carry a
  verdict on each step: `[ ]` open (the live edge), `[x]` done, `[F]` failed, `[W]`
  waived. "Resolved" is a verdict, not a success. Keep an in-world plan
  `status: active` and let the line between `[ ]` and the rest mark the moment the
  scene captures, between decision and execution; `[F]`/`[W]` are where a scheme's
  failures become drama. A plan steers the scene structurally, never dictating the
  lines.
- Updated dependencies [4c0b468]
  - @chbrain/khai-arch@0.1.10

## 0.0.13

### Patch Changes

- 964dc17: The drift check no longer reads an unreadable upstream validator version as
  "still current". A reachable PyPI whose payload lacks `info.version` now yields
  an empty string (distinct from offline, which is undefined), and checkDrift
  surfaces that as an advisory notice instead of skipping it via a falsy guard.
  Offline (both signals unreachable) still skips silently.
- 3fd4d72: composeSkill now errors on a bundled reference nested more than one level deep
  (e.g. references/sub/x.md). The cultures layout (and the agentskills "references
  one level from SKILL.md" rule) only represents SKILL.md plus one flat content
  subfolder; previously such a file was silently flattened by culturesLayout, with
  only an advisory warning on deep links inside SKILL.md, never on the actual
  bundled files. It is now a blocking conformance error.
- Updated dependencies [ae0c95e]
- Updated dependencies [9965037]
- Updated dependencies [11425ea]
  - @chbrain/khai-arch@0.1.8

## 0.0.12

### Patch Changes

- cde3f3f: Update playwright skill instructions in SKILL.md to specify drawing plan in Stage and Tension.
- Updated dependencies [4178749]
  - @chbrain/khai-arch@0.1.7

## 0.0.11

### Patch Changes

- c556f55: Add plan to the ENACTS playwright skill, injecting the plan template from canon and supporting the plan\_ element.
- Updated dependencies [7cd2eda]
  - @chbrain/khai-arch@0.1.6

## 0.0.10

### Patch Changes

- d19a342: Update impresario skill guide to instruct on generating and authoring a unique Manager persona for each house.

## 0.0.9

### Patch Changes

- 1b65a9a: Update impresario and playwright skill guides to include voice-authoring instructions for setting house voice in README.md and play voice in the play file.
- Updated dependencies [d4c3079]
  - @chbrain/khai-arch@0.1.4

## 0.0.8

### Patch Changes

- 72bbc7d: Thin khai-impresario to orchestrate khai-stage and khai-plays. The skill now
  stays fat where it judges (the source, its rights, the card) and collapses to a
  pointer where the house is computed: run khai-stage to stamp the invariant house,
  finish the handoffs, then list the house on the khai-plays bill. The wiring is no
  longer described file by file in prose; it is stamped, so it cannot drift between
  houses or between models.
- f527b57: Point khai-impresario step 4 at the `khai-plays register` command instead of a
  hand-written card. The repo is the house and the package is its programme; both
  default from the slug, so the impresario passes only the blurb it judged. This
  follows khai-plays gaining a `register` CLI and requiring `repo`: the skill stays
  fat where it judges (the source) and a thin pointer where the bill is computed.
- 6cba198: Add the khai-impresario skill: the source-agnostic guide for raising a khai
  production house. In khai-impresario mode you stand up a khai-plays-<source>
  collection repository, wired to the four pillars, gated, protected on both faces,
  seeded with a fixture for a green first run, and listed in the khai-plays
  registry. It mints the house's Estate identity (the owner every play logs in its
  Estate) and hands back an empty venue; the plays are written separately, in
  khai-playwright mode.
- Updated dependencies [c5cb182]
- Updated dependencies [7dc7952]
- Updated dependencies [6bffe4e]
  - @chbrain/khai-arch@0.1.3

## 0.0.7

### Patch Changes

- 62718ee: Rename the play-authoring skill from creating-a-play to khai-playwright (the
  SKILL.md name and its source directory). The published bundle is now
  khai-playwright.zip; invoke the skill as khai-playwright.

## 0.0.6

### Patch Changes

- 58934d6: Add em-dash and en-dash to the khai-skills style denylist in `lib/guard.mjs`. The check runs via `validateNeutrality` on every text file in a skill bundle at pre-commit and CI, so a dash in any README or SKILL.md now blocks the commit rather than slipping through to a consumer surface.
- 61ab1b2: Remove em-dashes from the creating-a-play and retro-4ls skill READMEs (Problem/Solution/What you get sections), rewriting the parentheticals with parentheses and a colon. Brings the skill prose in line with the house no-em-dash writing rule so consumer surfaces rendering it verbatim stay brand-clean.

## 0.0.5

### Patch Changes

- 345af83: Add README.md to creating-a-play and retro-4ls with Problem / Solution / What you get structure.
- d4ff1d2: Add a `khai.tagline` to package.json, a house-voice one-line description of the skills kit, so a consumer surface prints it verbatim instead of authoring its own copy.
- Updated dependencies [9d0674d]
- Updated dependencies [d2307ba]
  - @chbrain/khai-arch@0.1.2

## 0.0.4

### Patch Changes

- 5d1fd1b: Add retro-4ls skill: 4 L's Retrospective facilitator (Liked, Learned, Lacked, Longed for). Attributed to Gorman and Gottesdiener (2012).
- Updated dependencies [c9eff7b]
  - @chbrain/khai-pack@0.0.3

## 0.0.3

### Patch Changes

- d5b585c: Refactor khai-skills onto `@chbrain/khai-pack`: drop the package's private zip
  writer and use the shared serve engine to assemble the bundle in the cultures
  layout (overhead at the root, content in the `references/` subfolder), zip it,
  and hash it. Output is byte-identical to before; the duplication of the zip
  writer is gone and packaging now lives in one place for every repo.
- Updated dependencies [0d822cd]
  - @chbrain/khai-pack@0.0.2

## 0.0.2

### Patch Changes

- c3744d0: Add `@chbrain/khai-skills`: portable, vendor-neutral Agent Skills built from the
  khai-arch canon so cheaper or non-code-aware models can do khai work to the
  agentskills.io open standard. Composes each skill by pulling templates from
  canon at build time (`build:skills`), emits a deterministic per-skill zip, and
  guards it in pure Node across two tiers (Tier 1 standard conformance; Tier 2 khai
  policy: vendor neutrality + canon provenance). Pins the official PyPI
  `skills-ref` validator version plus the spec content hash, with a lazy upstream
  drift check that surfaces a move order on the next touch of any skill. First
  skill: `creating-a-play` (the `play` house type, ENACTS).
