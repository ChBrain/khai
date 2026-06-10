---
---

Prep the spine tests for the `instructions.md` rename: drop the flavor-model
assertions and guard the rename-dependent ones behind a manifest-computed
dormant flag, so they activate automatically when the source rename lands.
Tests only; no shipped change.
