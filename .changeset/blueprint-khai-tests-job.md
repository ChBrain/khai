---
"@chbrain/khai-stage": patch
---

Rename the blueprint's CI conformance job from `test` to `khai-tests`, the tool
it runs, matching the `khai-guard` job's naming. A house raised from this
blueprint must require the `khai-tests` check in its branch protection (not
`test`).
