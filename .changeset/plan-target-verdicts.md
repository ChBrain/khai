---
"@chbrain/khai-arch": patch
---

Teach the plan Targets vocabulary. A target carries a verdict, and "resolved"
means a verdict was reached, not that it succeeded: `[ ]` is open (no verdict
yet, the live edge; a closed plan has none), `[x]` done, `[F]` failed, `[W]`
waived. A closed plan may carry failed targets. `template_plan.md` now documents
the four markers with a worked mix, and the `plan` spec's Targets line reads
"each carrying a verdict (done, failed, or waived); resolved when none is left
open" instead of "must be completed". The gate is unchanged (only `[ ]` blocks).
