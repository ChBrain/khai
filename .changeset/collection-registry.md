---
"@chbrain/khai-tests": patch
---

Generalize the registry/numbering machinery from `plays`-only to a named
collection. A house declares `khai.collection` in package.json (a string
shorthand, or a `{ dir, key, anchor }` object); it defaults to plays, so every
existing play house is byte-identical. `buildRegistry`, `verifyRegistry`,
`validateCollectionRegistry` (new; `validatePlayhouseRegistry` kept as an
alias), `countItems` (new; `countPlays` kept as an alias), and the project
validator all key off the resolved collection. This lets a non-plays content
house (e.g. `khai-cultures` with a `cultures/` folder) build a
`registry.cultures` bill and ride the same computed-minor numbering.
