---
"@chbrain/khai-tests": patch
---

Resync the management core snapshot with the blueprint (it had lost the
`language: english` fields after the blueprint fix), and add the management gate
tests: a snapshot/blueprint in-sync guard (catches a stale snapshot in CI) plus
checkManagement behaviour (converged passes; drift, missing core, and missing
home are flagged; touring stays out of the core).
