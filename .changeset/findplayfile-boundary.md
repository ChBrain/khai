---
"@chbrain/khai-language": patch
---

findPlayFile now stays within the project by comparing paths, not by a raw
`current.startsWith(root)`. The string prefix check treated a sibling directory
that shares root's textual prefix (e.g. validating a file under `<root>2` with
projectPath `<root>`) as in-scope, so it could walk a foreign directory and
resolve a play's language from another project. It now stops as soon as the
walked directory is outside root (`relative(root, current)` escapes with `..`).
