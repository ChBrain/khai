---
"@chbrain/khai-language": patch
---

detector: extend registration beyond Europe to the full reliably-detected set

Builds on the European set: adds every remaining language languagedetect returns
as the top hit on its own prose, taking ISO_MAP to 37. New: Welsh and Latin
(completing Europe), the distinct-script Arabic, Farsi, Urdu, Hindi and Bengali,
the distinct Cyrillic Kazakh and Mongolian, and Swahili, Somali, Hausa, Hawaiian,
Indonesian and Cebuano.

Still excluded (false-fail a per-paragraph gate; NLP/franc path instead): the
Cyrillic Slavic cluster (ru/uk/sr/mk/bg), Czech, the Turkic-Latin pair
(azeri/uzbek), Turkish, Nepali (ties Hindi), Tagalog/Vietnamese, and the
unmodelled (Greek, Catalan, Basque, Low German). A data-driven test gates one
verified native sample per registered language.
