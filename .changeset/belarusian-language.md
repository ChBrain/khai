---
"@chbrain/khai-language": patch
---

Register Belarusian (`be` → `bel`) so the East Slavic trio (Russian, Ukrainian,
Belarusian) all gate. languagedetect has no Belarusian, so it routes via franc,
where it tops its own prose cleanly across samples (Ukrainian the nearest sibling
~0.3 back). Moldova needs no new code: "Moldovan" is Romanian (ISO merged
`mo`/`mol` into `ron`), and `ro` already gates — documented in LANGUAGES.md.
