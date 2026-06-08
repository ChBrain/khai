---
"@chbrain/khai-arch": patch
---

Publish every architecture type: flip the remaining `status: draft` specs
(architecture, engines, instructions, order, persona, piece, place, play, plot,
position, process) to `status: published`, so none of the canon types is left
in draft.

Also fix the `plan` coda, which was scoped to a management plan only ("before
it can be merged to main"). A plan may be a production directive or an in-world
plan, so the completion rule must be scope-agnostic: "A plan is completed when
all its directives are resolved: no pending `[ ]` targets remain."
