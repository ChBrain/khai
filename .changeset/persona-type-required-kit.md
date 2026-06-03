---
"@chbrain/khai-rules": patch
"@chbrain/khai-tests": patch
---

Frontmatter: support a `required` flag on per-type extra keys. `checkFrontmatter`
now accepts `{ values, required }` (a bare array stays shorthand for an optional
key) and flags a missing required key. The fixture personas declare `type:` ahead
of the canon flipping persona's `type:` to required (next, in the arch lane).
