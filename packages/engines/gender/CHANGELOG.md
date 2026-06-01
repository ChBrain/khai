# @chbrain/khai-engine-gender

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
