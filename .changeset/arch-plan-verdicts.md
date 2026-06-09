---
"@chbrain/khai-arch": patch
---

Make the plan-target verdict vocabulary canon. Export `planVerdicts`
(`[x]` done, `[F]` failed, `[?]` flagged) as the single source, and spell the
same set in `template_plan.md` and `architecture/plan.md` (the former `[W]`
waived becomes `[?]` flagged). The conformance kit pulls this export instead of
restating the rule.
