---
"@chbrain/khai-tour": patch
---

Implement the publication path of `tour()` with the native markdown renderer. For
a `kind: publication` venue, `tour()` aggregates the collections, combines them
(honouring the venue's `optimization`: `expanded` emits one artifact per
collection, otherwise a single combined artifact in the caller's order), injects
the generated-by metadata, and writes the artifact (zipping it when the venue's
`packaging` is `zip`). Adds the pure `renderPublication` assembler. The pdf/html
renderers still throw a clear "not implemented yet". See docs/TOUR.md.
