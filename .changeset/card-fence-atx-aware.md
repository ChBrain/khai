---
"@chbrain/khai-arch": patch
---

The card extractors (referenceCard / playCard / planCard / orderCard) now split
chapters fence-aware and closed-ATX-aware, matching parseDoc. They re-scanned
raw text with `main.split(/\n(?=## )/)` and a leading-only name strip, so a
`## ` or `### ` shown inside a fenced code block in a chapter body (e.g. a YAML
example) became a phantom chapter that failed the exact-chapters contract on a
valid document, and a closed-ATX chapter heading (`## Origin ##`) produced the
name "Origin ##" and mismatched the canon. A shared fence-aware parseChapters
helper (reusing the existing fencedLines) now drives all four, and chapter and
subchapter names drop a trailing closed-ATX run.
