---
"@chbrain/khai-rules": patch
"@chbrain/khai-tests": patch
---

Require a `title` in content frontmatter, and enforce that it echoes the H1
name (`# Type: <Name>`). `khai-rules` gains a `checkTitle` atom; `khai-tests`
wires it into `validateContentFile`, so every validated instance -- engine
content, consumer instances, and content surfaces generate downstream -- must
carry a `title` that matches its H1. One pattern, recoverable from the markdown
alone when the YAML is stripped.

`checkH1` also now enforces that an instance carries **exactly one** H1 (`#`):
by design a khai file has a single first-level header, so a second `#` is drift.

Note: this is a stricter gate. Downstream content without a matching `title`, or
with a second H1, will now fail validation; bump accordingly if releasing to
external consumers.
