---
"@chbrain/khai-stage": patch
---

Ship `conduct.md`, the shared case law for working in a khai house (moved from
`@chbrain/khai-arch`, which never released it), so a house is born pointing at
it.

khai-stage's `blueprint/` stamps every new house's CLAUDE.md, GEMINI.md and
`management/`, so a house's contract files are computed here, not in khai-arch.
The blueprint is the natural home for the case law those files point at: a
house that reads its own CLAUDE.md already reads a pointer to conduct.md, and
that pointer only stays correct if the doctrine ships beside the thing that
stamps it.

It sits at the package root, deliberately outside `blueprint/`: `stageHouse`
only walks `blueprint/`, so a root-level file is never copied into a raised
house as a second, divergent file. One copy per world, read from the installed
package at `node_modules/@chbrain/khai-stage/conduct.md`, the same shape law 6
inside the document itself argues for.

`blueprint/CLAUDE.md` and `blueprint/GEMINI.md` each gain a short pointer
blockquote at that path, so every house khai-stage raises from here on is born
pointing at the case law.
