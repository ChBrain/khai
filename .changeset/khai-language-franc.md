---
"@chbrain/khai-language": patch
---

detector: franc routing for the languages languagedetect can't separate

`validateLanguageOfFile` now picks the detector per resolved language: the 37
languagedetect languages as before, and **franc** (ISO 639-3) for ten that
languagedetect collapses but franc gates stably across multiple samples — `nds`
Low German (the driving case), `el` Greek, `ca` Catalan, `eu` Basque, `vi`
Vietnamese, `tl` Tagalog, `ne` Nepali, `ru` Russian, `uk` Ukrainian, `mk`
Macedonian. New `FRANC_MAP` (declared code → 639-3) sits beside `ISO_MAP`; both
detectors return a score-ranked list so the existing top-vs-resolved comparison
is unchanged. Adds the `franc-all` dependency.

Still exempt (multi-sample testing showed them flipping, so no local gate):
Czech (→Croatian), Bulgarian (→Macedonian), Serbian (→Bosnian) and the Turkic
cluster. A data-driven test gates one verified native sample per franc-routed
language, plus a wrong-language flag.
