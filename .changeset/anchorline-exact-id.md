---
"@chbrain/khai-review": patch
---

anchorLine now matches a finding's id cell exactly instead of as a bare
substring, so a finding whose id is a prefix of another (e.g. "a:b:c" vs
"a:b:cd") no longer anchors its inline comment to the wrong row. The id-cell
escaping is now a single shared escapeCell helper used by both renderLog and
anchorLine, so the rendered row and the anchor needle can never drift.
