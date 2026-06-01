---
"@chbrain/khai-arch": patch
"@chbrain/khai-engine-gender": patch
---

Engines: introduce the WIRES card. khai-arch gains `engineCard(manifest)` and
`wiresChapters` - the engine-instance contract (Wire, Issue, Require, Enforce +
Setup), derived from the engines type so it can never drift from the definition.
The gender engine authors its `khai.card` (the five WIRES chapters), so a
consumer can render the engine as a card under the playbook's "enriched by"
group. khai-arch owns the schema; @chbrain/khai-tests will enforce it.
