---
"@chbrain/khai-tests": patch
---

The management convergence gate reads the blueprint live from @chbrain/khai-stage
instead of a committed snapshot. Removes src/management-core/, the `management
build` command, and the snapshot/blueprint in-sync test; checkManagement now
compares a house directly against the installed khai-stage blueprint. This drops
the snapshot-vs-blueprint coupling that made a blueprint-core change unmergeable
when split across the stage and governance lanes. Adds @chbrain/khai-stage as a
dependency.
