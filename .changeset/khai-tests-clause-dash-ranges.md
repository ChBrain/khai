---
"@chbrain/khai-tests": patch
---

`checkClauseDash` no longer flags a spaced hyphen between two numbers
(`400 - 500`, `2006 - 2012`): the CVI sanctions it for numeric ranges. A
spaced hyphen anywhere else (including number-to-word) is still flagged as a
clause dash.
