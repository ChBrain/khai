---
"@chbrain/khai-arch": patch
---

The `templates` export now skips a template file whose frontmatter lacks a
`khai` key instead of keying it on `undefined` (which would collapse every such
file onto a single entry), and parses each file once instead of twice. Behavior
is unchanged for canon templates, which all declare `khai`.
