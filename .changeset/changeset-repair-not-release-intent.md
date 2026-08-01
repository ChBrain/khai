---
"@chbrain/khai-guard": patch
---

changeset-check: an edited changeset is a repair, not new release intent. The ships-nothing rules (root and per-package) now read only the changesets a PR adds, so fixing a wrong package name or a typo in an existing changeset no longer reads as a bump the diff must justify with shipped content. A changeset the PR genuinely adds is unchanged, and a caller that passes no diff status keeps the behaviour it had.
