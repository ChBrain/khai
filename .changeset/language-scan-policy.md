---
"@chbrain/khai-language": patch
---

The "which markdown is language-checked" policy is now single-sourced. The skip
list (CHANGELOG, README, REFERENCES — infra, not content) lived in two places
with different rules: findProjectMarkdownFiles excluded only CHANGELOG, while
validateProjectLanguages separately skipped README/REFERENCES by basename. Both
now flow through one NON_CONTENT_MD set in the discovery walk, so the two can't
diverge. Behavior is unchanged (those files were skipped before and still are).
