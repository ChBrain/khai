---
---

Tests for the Galician (`gl`) and Aranese/Occitan (`oc`) franc-tier registrations.
No package change — the test lands dormant (`describe.skipIf(SPAIN_DORMANT)`,
probing `src/detector.mjs` for `gl: "glg"`) and activates once the source PR
merges. Empty changeset: tests-only, nothing to release.
