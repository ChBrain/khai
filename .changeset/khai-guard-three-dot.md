---
"@chbrain/khai-guard": patch
---

CI mode now diffs the three-dot range (`merge-base(base, head)..head`)
instead of two-dot, so the gate sees only what the branch itself changed.
Two-dot misfired on any branch that had fallen behind its base: files the
base advanced past were counted as if this PR touched them. Local
(pre-push) mode already computed the merge-base, so it is unaffected.
