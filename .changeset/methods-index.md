---
"@chbrain/khai-methods": patch
---

Generate `docs/METHODS.md` from the method frontmatter. A new
`lib/methods-index.mjs` renders the registry into a list-based index (by type,
by origin) and drift-checks the committed doc against a fresh build, exposed
through a `./methods-index` export and `npm run build:methods` / `verify:methods`.
The index is computed, not hand-kept, so it can never drift from the methods.
