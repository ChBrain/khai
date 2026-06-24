---
"@chbrain/khai-language": patch
---

Register the South/Central Asia + Middle East batch (9 languages) and generalize
the dense-script length measure. New franc routes, all verified multi-sample:
`mr` Marathi, `kn` Kannada, `ml` Malayalam (South Asia); `he` Hebrew, `ps` Pashto
(Middle East); `ky` Kyrgyz, `tg` Tajik, `tk` Turkmen (Central Asia); and `az`
Azerbaijani at the tight-cluster grade — overturning its old exempt verdict (real
Azeri never falls 0.1 behind; it rides the Oghuz Turkic cluster within margin).

The Dravidian/Brahmic scripts are agglutinative, so a full sentence is well under
15 whitespace words and was being skipped. The `minSpanChars` fallback (from the
CJK batch) is broadened to cover Devanagari, Bengali, Gurmukhi, Gujarati, Oriya,
Tamil, Telugu, Kannada, Malayalam and Sinhala (`CONTINUOUS_SCRIPT_RE` →
`DENSE_SCRIPT_RE`), so these gate properly — and it retroactively strengthens the
already-shipped Tamil/Telugu. Odia, Assamese and Kurdish (Kurmanji) stay exempt
(franc has no model for them).
