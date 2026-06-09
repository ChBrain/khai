---
"@chbrain/khai-arch": patch
---

Tighten the `planVerdicts` doc: the verdict vocabulary applies to every resolved
(non-open) target on any plan, whatever its status, not only a closed one.
Completion is the separate, status-gated rule (a plan is `closed` only when no
open `[ ]` remains; a draft/active plan may keep open targets).
