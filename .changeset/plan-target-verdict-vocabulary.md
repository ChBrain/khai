---
"@chbrain/khai-arch": patch
"@chbrain/khai-skills": patch
"@chbrain/khai-tests": patch
---

The plan-target verdict vocabulary is now canon. khai-arch exports
`planVerdicts` (`[x]` done, `[F]` failed, `[?]` flagged) as the single source,
and the plan template, the architecture note, and the khai-playwright skill all
spell that same set (replacing the former `[W]` waived with `[?]` flagged). The
conformance kit no longer restates the rule: it pulls `planVerdicts` from the
canon and gates a `closed` plan's targets against it, so `[ ]` stays pending and
any mark outside the canon set (`[-]`, `[W]`, ...) is an unresolved-verdict
finding. A draft or active plan is in progress and is not held to it; orders
keep their existing completion check.
