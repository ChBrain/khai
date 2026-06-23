---
"@chbrain/khai-language": patch
---

Register Haitian Creole (`ht` → `hat`) so the Haiti culture can declare its
soul-language. Kreyòl is French-lexified, but franc tops `hat` cleanly on every
sample (French ~0.65 back, the Seychellois-creole sibling `crs` ~0.8 back, both
well within margin); languagedetect mis-reads it as French, so it routes via
franc at the clean grade. It is the one Caribbean creole that gates: Papiamento
false-fails under multi-sample (Iberian-creole tangle), and the English-lexified
Caribbean creoles (Jamaican, Belizean Kriol, Sranan, etc.) aren't in franc's
model — all documented as exempt in LANGUAGES.md.
