---
"@chbrain/khai-tests": patch
---

`buildRegistry` now derives the version from the play count (the minor IS the
count) and reconciles it into both `package.json` and `registry.json`, making
the build the single writer of the minor. A manual edit or a stray minor
changeset that drifted the version is healed on the next build (e.g. `0.77.x`
with 76 plays becomes `0.76.0`); the major is preserved (the numbering guard
still flags a non-zero major) and the patch is preserved unless the count moves
the minor, which starts a fresh `.0`. New helpers `deriveVersionFrom`,
`deriveHouseVersion`, and `countPlays` are exported. The numbering guard remains
as the verification that the committed registry matches the play count on disk.
