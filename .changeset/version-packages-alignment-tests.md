---
---

Tests-first (dormant): rewrite the changeset-check gate unit tests to the new
doctrine — a content add must carry a `minor` changeset. Dormant until the
source PR lands (the assertions probe `index.mjs` for the new-behaviour
sentinel), so this ships no package change: an empty changeset.
