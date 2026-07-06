---
---

Tests for the Italy & France regional-language registrations (`sc`/`fur`/`lld`/
`br`/`co`). No package change — the block lands dormant
(`describe.skipIf(IT_FR_DORMANT)`, probing `src/detector.mjs` for `sc: "src"`)
and activates once the source PR merges. Empty changeset: tests-only.
