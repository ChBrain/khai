---
"@chbrain/khai-plays": patch
---

Protect the chain management in CI: a test runs the kit (`validateProject`) over
`management/`, so the chain cast conforms and the orphan-position gate holds
(a needed position without a persona is a failure). Same call, same wall as a
house uses, run by `npm test`.
