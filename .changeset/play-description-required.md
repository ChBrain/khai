---
"@chbrain/khai-arch": patch
---

canon: make the play `description` a required frontmatter key, and add it to
`template_play.md`. The registry is the English-facing index (the website
overview reads it); requiring the frontmatter `description` means the English
logline can never silently fall back to the declared-language `## Arc`. Every
existing play across the houses already carries the field. Pairs with khai-tests
reading `description` from frontmatter (Arc only as a fallback).
