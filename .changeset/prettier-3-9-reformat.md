---
"@chbrain/khai-guard": patch
"@chbrain/khai-rules": patch
---

Reformat source to prettier 3.9.x output (the dev-tooling group bumps prettier
to ^3.9.4). Prettier 3.9 changed the formatting of empty `for`-update clauses
and Markdown list-item continuation indent, so `packages/khai-guard/index.mjs`
and `packages/khai-rules/CHANGELOG.md` are re-emitted to match. Formatting only;
no behavior change.
