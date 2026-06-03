---
"@chbrain/khai-guard": patch
---

advise: skip shared paths (e.g. `.changeset/**`) instead of listing them as
unowned. The enforcer (`checkBranchScope`) already waves shared metadata through
on every lane; `advise` now matches it, so it no longer tells contributors to
"extend branchScope" for files that are shared by design.
