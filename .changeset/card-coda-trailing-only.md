---
"@chbrain/khai-arch": patch
---

referenceCard / playCard / planCard / orderCard now peel the optional trailing
`---` coda correctly. They previously split on the first `\n---\n` and treated
everything after it as coda, so a legal `---` thematic rule inside a chapter
body (or a `---` inside a fenced code block, e.g. a YAML example) truncated the
document and dropped every later chapter, throwing a misleading "chapters must
be exactly […]" on a valid document. A shared fence-aware helper now finds the
coda only at a trailing `---` rule that has no chapter heading after it.
