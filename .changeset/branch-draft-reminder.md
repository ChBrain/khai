---
"@chbrain/khai-guard": patch
---

`khai-guard branch` now prints a draft reminder after creating the branch: "not
finished? Open the PR as a draft, and mark it ready only when the change is
whole." The guard cannot enforce draft state (it lives on GitHub, not in the
diff), but the branch command is a touchpoint every change passes through, so
asking for the lane returns the lane and the discipline that goes with opening
the PR. A reminder, not a gate.
