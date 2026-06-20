---
"@chbrain/khai-arch": patch
---

read canon frontmatter with js-yaml 4.2.0 instead of gray-matter

index.mjs (types, templates, the playbook block) and the test helper now split
frontmatter with a small built-in parser on js-yaml 4.2.0 rather than
gray-matter, dropping gray-matter and its js-yaml 3.x (exposed to the merge-key
DoS GHSA-h67p-54hq-rp68). js-yaml moves from dev to runtime deps. Self-contained;
behaviour unchanged.
