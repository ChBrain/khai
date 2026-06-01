# @chbrain/khai-arch

## 0.0.4

### Patch Changes

- b8549f6: Publish the GROW restructure that 0.0.3 documented but never shipped. The
  `0.0.3` tarball on the registry still carries the pre-GROW files: the old
  overview as `architecture.md` (no frontmatter, no coda) and no `model.md`.
  The source moved to the GROW typed spec (`architecture.md` as the Ground/
  Root/Open/Weave seam, overview relocated to `model.md`) without a version
  bump, so consumers installing `khai-arch` got stale canon. This patch
  republishes the canon so the registry matches source: `architecture.md` is
  the typed seam and `model.md` is the companion.

## 0.0.3

### Patch Changes

- 4a679b6: Add a machine-readable contract export (`types`, `chaptersFor`), read at
  runtime from the canon's own type-definition frontmatter. Conformance tooling
  derives the section contract from this instead of restating it, so the rules
  can never drift from the definitions.

- Add `architecture` as a typed spec (GROW: Ground, Root, Open, Weave) — the
  canon's one deliberately-open type, the extension seam through which builders
  attach engines, content, and extensions without editing the canon. The former
  overview doc moves to `model.md` (the companion). `instructions.md` keeps its
  System chapter pointed at `architecture.md`, so the Agent reads the seam to
  find where extensions attach. Brings the canon to eight typed specs plus one
  companion.
