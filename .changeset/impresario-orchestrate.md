---
"@chbrain/khai-skills": patch
---

Thin khai-impresario to orchestrate khai-stage and khai-plays. The skill now
stays fat where it judges (the source, its rights, the card) and collapses to a
pointer where the house is computed: run khai-stage to stamp the invariant house,
finish the handoffs, then list the house on the khai-plays bill. The wiring is no
longer described file by file in prose; it is stamped, so it cannot drift between
houses or between models.
