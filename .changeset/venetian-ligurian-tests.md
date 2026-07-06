---
---

Tests for the Venetian (`vec`) and Ligurian (`lij`) registrations. No package
change — the block lands dormant (`describe.skipIf(VEC_LIJ_DORMANT)`, probing
`src/detector.mjs` for `vec: "vec"`) and activates once the source PR merges.
Empty changeset: tests-only.
