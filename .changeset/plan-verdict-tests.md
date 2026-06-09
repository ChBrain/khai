---
"@chbrain/khai-tests": patch
---

tests: cover the closed-plan verdict vocabulary. Assert a `status: closed` plan
accepts `[x]`/`[F]`/`[?]` and rejects `[W]`/`[-]` as unresolved verdicts, while a
draft or active plan is not held to it. Update the plan/order fixtures to spell
the canon set (`[?]` flagged in place of the retired `[W]` waived).
