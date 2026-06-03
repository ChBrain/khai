# @chbrain/khai-skills

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
