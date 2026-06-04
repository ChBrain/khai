# @chbrain/khai-skills

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
