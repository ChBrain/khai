---
"@chbrain/khai-tests": patch
---

validate: the plan target verdict vocabulary now holds for every plan, in a play
or anywhere, whatever its status, not only a `closed` one. A resolved (non-open)
target must carry a valid verdict; `[ ]` open is allowed until the plan is
`closed` (a plan is closed only when every target carries a valid marker, no open
`[ ]` left). Orders are held the same way (no status, so they must complete).
