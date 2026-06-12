---
"@chbrain/khai-stage": patch
---

The generated house test now surfaces advisory validation warnings (e.g. a
Company element no plot casts) to the CI log instead of dropping them. Warnings
still never fail the build; they are printed so the drift is visible in CI
rather than only to a human reading the rendered play.
