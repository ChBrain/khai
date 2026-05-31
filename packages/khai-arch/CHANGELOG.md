# @chbrain/khai-arch

## 0.0.3

### Patch Changes

- 4a679b6: Add a machine-readable contract export (`types`, `chaptersFor`), read at
  runtime from the canon's own type-definition frontmatter. Conformance tooling
  derives the section contract from this instead of restating it, so the rules
  can never drift from the definitions.
