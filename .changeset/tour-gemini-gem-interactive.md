---
"@chbrain/khai-tour": patch
---

Reclassify the Gemini Gem as an interactive venue (instructions + uploaded
knowledge), not a publication artifact, and enforce its hard 10-file knowledge
limit. `gemini_gem` is now `kind: interactive, source: upload` with
`constraints.maxFiles: 10`; `buildInteractiveBundle` throws when more than the
allowed knowledge files are produced, pointing at consolidation (one file per
category) as the fix. Instructions do not count toward the limit.
