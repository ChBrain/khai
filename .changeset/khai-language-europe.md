---
"@chbrain/khai-language": patch
---

detector: register the reliably-detected European languages

Adds the European languages languagedetect identifies as the top hit on real
prose to `ISO_MAP`, so each can be declared (`language: <code>`) and gated
locally like the original four: nl, it, es, pt, sv, no, fi, is, pl, hu, ro, hr,
sk, sl, sq, lt, lv, et (joining en, de, fr, da). Cyrillic (ru/uk/sr/mk/bg), the
czech<->slovak pair on the czech side, turkish, and languages languagedetect
does not model (greek, catalan, ...) are intentionally left off local detection
— they would false-fail a per-paragraph gate and stay on the NLP/franc path
(LANGUAGES.md). A per-language acceptance test covers the set.
