---
---

Add bin-level integration tests for `khai-guard doctor`: healthy fully-wired
repo, overlapping buckets on the tracked tree (exit 2), malformed config (exit
2), missing CI/hook warnings (still exit 0), and a stale META-2 gate warning.
Test-only — no published artifacts change, so this carries an empty changeset.
