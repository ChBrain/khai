---
---

Tests for the Asturian (`ast`) franc-tier registration. No package change — the
block lands dormant (`describe.skipIf(ASTURIAN_DORMANT)`, probing
`src/detector.mjs` for `ast: "ast"`) and activates once the source PR merges.
Empty changeset: tests-only, nothing to release.
