---
"@chbrain/khai-rules": patch
---

Permit an optional `title` frontmatter key on content instances. This is the
permit-only step: `title` is now an allowed key (no longer rejected as unknown),
ahead of the engine files declaring it and a later change making it required.
