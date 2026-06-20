---
"@chbrain/khai-language": patch
---

detector: register Italian (it)

Adds `it: "italian"` to `ISO_MAP`, so a culture can declare `language: it` and
have its prose gated by the local detector — languagedetect already recognises
Italian, so no NLP fallback or extra detector is needed (unlike Low German).
English (or other) spans in an Italian house are still flagged.
