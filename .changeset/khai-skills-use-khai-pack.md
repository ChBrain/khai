---
"@chbrain/khai-skills": patch
---

Refactor khai-skills onto `@chbrain/khai-pack`: drop the package's private zip
writer and use the shared serve engine to assemble the bundle in the cultures
layout (overhead at the root, content in the `references/` subfolder), zip it,
and hash it. Output is byte-identical to before; the duplication of the zip
writer is gone and packaging now lives in one place for every repo.
