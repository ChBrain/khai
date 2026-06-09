---
"@chbrain/khai-stage": patch
---

Drop `consistency` from the branch-protection handoff guidance. The audit
workflow that posts the `consistency` status is path-filtered to `audit/**`, so
it never reports on a non-audit PR; requiring it in branch protection wedges
every non-audit PR in a permanent "Expected — waiting" state. The handoff now
recommends requiring only `test`, `khai-guard`, and `branch-scope`, and says
explicitly not to require `consistency`.
