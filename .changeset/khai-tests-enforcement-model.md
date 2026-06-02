---
"@chbrain/khai-tests": patch
---

Document the enforcement model in the README: the kit as a "linter for worlds"
(engines are plugins, the dependency graph is the law set), the audit/warn/fail
level axis (ESLint / `npm audit` vocabulary, engine default + world override),
and the two lanes - a structural linter lane (checks the declaration) and an
NLP-review lane (checks the embodiment, caps at warn). Doc only; clearly marks
what the kit does today (linter lane, single implicit `fail` level) vs the
target it describes.
