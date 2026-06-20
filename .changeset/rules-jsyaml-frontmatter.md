---
"@chbrain/khai-rules": patch
---

parse: replace gray-matter with a js-yaml 4.2.0 frontmatter parser

`parseDoc` now splits frontmatter with a small built-in `parseFrontmatter` built
on js-yaml 4.2.0 (also exported) instead of gray-matter. This drops gray-matter —
and its bundled js-yaml 3.x, exposed to the merge-key quadratic-DoS
GHSA-h67p-54hq-rp68 — from khai-rules. Behaviour is unchanged (the full
conformance suite stays green). One of the workspace-wide changes removing
gray-matter; the Dependabot alert clears once every consumer (each converted
independently) has landed.
