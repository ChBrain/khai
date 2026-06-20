---
"@chbrain/khai-methods": patch
---

registry: parse frontmatter with js-yaml 4.2.0 instead of gray-matter

parseMethod now splits frontmatter with a small built-in parser on js-yaml 4.2.0
rather than gray-matter, dropping gray-matter and its js-yaml 3.x (exposed to
the merge-key DoS GHSA-h67p-54hq-rp68). Self-contained; behaviour unchanged.
