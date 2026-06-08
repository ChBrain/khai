---
"@chbrain/khai-guard": patch
---

`khai-guard branch` now validates the full computed branch name before running
`git checkout -b`. The lane and unit segments are derived from file paths (the
unit via a path capture), so a path segment like `--orphan` (a legal directory
name) could reach git as an option rather than a branch name -- argv injection.
Every segment must now be a plain kebab token, and the checkout is terminated
with `--`. The topic was already validated; this closes the path-derived gap.
