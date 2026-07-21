---
"@chbrain/khai-tests": patch
---

Wall (order 1, warrant-shape): gate Origin-row well-formedness. `parseOriginTable` silently skipped a table row that is not exactly three cells, so a mistyped warrant row (a missing pipe, a merged column) was dropped from the science index without a trace, losing its citation. `collectScience` and `collectCollectionScience` now throw on a malformed Origin row (a `| ... |` line that is neither the separator nor the header yet does not hold exactly three cells), naming the engine and the offending line, mirroring the existing zero-rows throw. Scoped to science-bearing engines by construction: the callers already skip an engine with no `khai.type` before parsing its Origin, so the meta spine's deliberately two-column warrant is never flagged. Verified green: the real repo collects 114 science engines with no throw. Set at patch as the free level; a new gate may warrant a minor at the maintainer's `bump:minor` label.
