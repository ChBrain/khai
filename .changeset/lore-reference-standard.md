---
"@chbrain/khai-arch": minor
"@chbrain/khai-engine-gender": patch
---

Introduce the **LORE** reference standard. Every component's `REFERENCES.md`
now carries four fixed canon chapters, in order, the warrant for the component
to exist:

- **L — Line of Work** — what it models, and what it isn't
- **O — Origin** — the sources it rests on
- **R — Restrictions** — what it refuses to claim, and to whom it delegates
- **E — Encoding** — source to constraint, per file

khai-arch gains `referenceChapters` and `referenceCard(text)` (sibling to
`engineCard`): it validates the four chapters are present and in order,
collects any author `### ` subchapters under each (the renderer paginates one
(sub)chapter per snap), and returns `{ mnemonic, chapters, sections, coda }`.
gender's `REFERENCES.md` is restructured as the first conformer.
