---
"@chbrain/khai-tests": patch
---

Add a severity model to wiring enforcement. Each requirement now resolves to a
level: `audit` (note), `warn` (nudge), or `fail` (gate, the only level that
exits non-zero). The engine declares its default per requirement
(`requires[].level`, defaulting to `fail` for back-compat); a world overrides it
per requirement id via `levels`. `validateInstanceFile` returns leveled findings
and `validateProject` buckets them into errors / warnings / audit. The CLI prints
`✖` for failures, `⚠` for warnings, and `·` for audit notes, exiting only on
failures. This is the same kit invoked three ways: audit, self-audit, or CI.
