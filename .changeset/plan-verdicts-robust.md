---
"@chbrain/khai-tests": patch
---

validate/tests: derive the closed-plan verdict gate and its test from the canon
`planVerdicts` rather than restating a glyph set. The validator builds the mark
class with each verdict escaped (so `-` is a literal, never a range) and its
fallback tracks the canon. The conformance suite now asserts every canon verdict
is accepted on a closed plan and a non-verdict mark is rejected, so it stays
correct across a vocabulary change.
