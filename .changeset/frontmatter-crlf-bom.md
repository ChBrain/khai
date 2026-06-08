---
"@chbrain/khai-rules": patch
---

checkHasFrontmatter now accepts CRLF line endings and a leading BOM. It matched
only `\n`, so a well-formed `---\r\n...\r\n---\r\n` document (or one with a BOM)
was reported as missing YAML frontmatter — a false positive that contradicted
what gray-matter actually parses. It now strips a leading BOM and tolerates
`\r?\n` around the delimiters.
