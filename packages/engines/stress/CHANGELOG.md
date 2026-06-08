# @chbrain/khai-engine-stress

## 0.1.2

### Patch Changes

- 5c73888: The engine's frontmatter stripper now tolerates CRLF line endings, so content
  authored on Windows (`---\r\n...\r\n---\r\n`) no longer leaks its YAML into the
  composed LLM context. Matched only `\n` before.
- Updated dependencies [ae0c95e]
- Updated dependencies [9965037]
- Updated dependencies [11425ea]
  - @chbrain/khai-arch@0.1.8

## 0.1.1

### Patch Changes

- ffdd342: engine: lift stress process engine from Cultures
