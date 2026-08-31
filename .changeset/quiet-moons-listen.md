---
"@chbrain/khai-arch": patch
---

Correct `architecture/_schema.yml`'s description: it named a count of typed
spec files that had gone stale, so it now states the computed rule instead
(`tests/helpers/classify.ts` is what decides a companion file, so the
description carries no count to go stale) and names the two companion files
that remain, `model.md` and `reference.md`.

The conduct doctrine, `architecture/conduct.md`, landed here briefly and moved
to `@chbrain/khai-stage` before this package ever released it: khai-stage's
`blueprint/` stamps every new house's CLAUDE.md, GEMINI.md and `management/`,
so the house-conduct case law now lives beside the blueprint that wires a
house to it, and a house is born already pointing there.
