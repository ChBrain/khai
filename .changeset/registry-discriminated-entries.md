---
"@chbrain/khai-tests": patch
---

registry: discriminated entries, optional geo iso, and referencing collections

`buildRegistry` now stamps a `kind` discriminator on every entry, merges an
optional per-item `geo.json` `iso` (absent ⇒ non-mappable), and supports
referencing collections declared in `khai.collections` (e.g. `groups`) whose
entries derive their `references` from the casts in their anchor file. The
numbering invariant counts the primary collection only, so referencing
collections never move the minor. `verifyRegistry` validates the richer shape:
`kind` (when present) must match its collection, `iso` must be a non-empty
string when present, and each `references` id must name an existing member of
the referenced collection. New exports: `resolveCollections`, `collectionKind`.
Single-collection plays and cultures houses are unaffected.
