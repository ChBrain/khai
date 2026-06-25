---
"@chbrain/khai-language": patch
---

Register the West African creoles that gate: `pov` Guinea-Bissau Kriol (clean),
`kri` Krio / Sierra Leone (clean), and `pcm` Nigerian Pidgin (tight-cluster, within
English's margin) — all verified multi-sample. This makes them detector-known, so a
nation can use its creole as a base `language:` and gate locally instead of needing
the `khai.languages` exempt path. Cape Verdean Kriolu (`kea`) stays exempt — it
false-fails to its Upper-Guinea sibling `pov`. Documented in LANGUAGES.md.
