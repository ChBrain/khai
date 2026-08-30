---
"@chbrain/khai-tests": minor
---

An Origin row whose Source names no scholar is now an error rather than a
silent drop. The uppercase-initial rule cannot tell a deliberate non-author
idiom from a mistyped one, so the six legitimate cases are declared in
`scholarPolicy.nonAuthorSources` and anything else fails the collector.
