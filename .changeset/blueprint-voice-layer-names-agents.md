---
"@chbrain/khai-stage": patch
---

The blueprint's voice layer said the coding rules live in the tool files. #1463
fixed exactly this in khai's own voice layer and missed the blueprint's, so every
house stamped since would have inherited the defect the parent had already
repaired.

Reworded rather than renamed, matching #1463: the per-tool files carry only that
tool's own quirks and point back at the contract, so none of them is where a
coding rule lives.
