---
"@chbrain/khai-language": patch
---

detector: register the full reliably-detected language set

Expands `ISO_MAP` to every language languagedetect returns as the top hit on its
own prose — 37 in all. Beyond the original four: the European set (nl it es pt sv
no fi is pl hu ro hr sk sl sq lt lv et) plus Welsh and Latin, the distinct-script
languages Arabic, Farsi, Urdu, Hindi and Bengali, the distinct Cyrillic Kazakh
and Mongolian, and Swahili, Somali, Hausa, Hawaiian, Indonesian and Cebuano.

Left off local detection on purpose (they false-fail a per-paragraph gate, and
take the NLP/franc path instead): the Cyrillic Slavic cluster (ru/uk/sr/mk/bg),
Czech (reads as Slovak), the Turkic-Latin pair (azeri/uzbek -> turkish), Turkish
itself (inconsistent), Nepali (ties Hindi), Tagalog/Vietnamese (-> cebuano), and
languages languagedetect does not model (Greek, Catalan, Basque, Low German, ...).
LANGUAGES.md records the split; a data-driven test gates one verified native
sample per registered language.
