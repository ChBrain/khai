---
"@chbrain/khai-engine-gender": patch
---

The engine's frontmatter stripper now tolerates CRLF line endings, so content
authored on Windows (`---\r\n...\r\n---\r\n`) no longer leaks its YAML into the
composed LLM context. Matched only `\n` before.
