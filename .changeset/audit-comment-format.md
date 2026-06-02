---
"@chbrain/khai-review": patch
---

Show the original prose in a finding's comment. `reviewCard` now carries the
reviewed text as `current`, and `commentBody` renders a finding as Current ->
Suggestion -> Reasoning, so a reviewer sees the before, the after, and the why at
a glance instead of just the rewrite.
