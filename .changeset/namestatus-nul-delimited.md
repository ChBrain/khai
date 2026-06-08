---
"@chbrain/khai-guard": patch
---

The branch-scope / source-test-mix gate now reads the diff with
`git diff --name-status -z` (NUL-delimited) instead of the default tab/newline
format. Git C-quotes and tab-splits paths that contain non-ASCII bytes, quotes,
or tabs, so such a path matched no lane or bucket and silently passed a gate it
should have failed. parseNameStatus parses the NUL stream verbatim (and still
accepts the legacy line form), closing that false-pass.
