---
"@chbrain/khai-plays": patch
---

Fix conformance in the chain's management cast. The personas Nicias, Pericles,
and Agatharchus declared `type: historical`, which is not in the canon's allowed
set; set them to `type: real` (they are real historical figures). Replace the
em-dashes in `persona_nicias.md`, `persona_pericles.md`, and
`position_choregos.md` with ' - ', which the encoding check requires. All
instance files in the package now conform (`khai-tests --project`).
