# @chbrain/khai-arch

## 0.0.3

### Patch Changes

- 4a679b6: Add a machine-readable contract export (`types`, `chaptersFor`), read at
  runtime from the canon's own type-definition frontmatter. Conformance tooling
  derives the section contract from this instead of restating it, so the rules
  can never drift from the definitions.

- Add `architecture` as a typed spec (GROW: Ground, Root, Open, Weave) — the
  canon's one deliberately-open type, the extension seam through which builders
  attach engines, content, and extensions without editing the canon. The former
  overview doc moves to `model.md` (the companion), and `instructions.md` now
  points its System chapter at `model.md` for the structural commitments. Brings
  the canon to eight typed specs plus one companion.
