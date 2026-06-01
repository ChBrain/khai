---
"@chbrain/khai-tests": patch
---

Enforce the WIRES card. `validateEnginePackage` now calls khai-arch's
`engineCard(manifest)`, so every engine package must declare a valid card (the
five WIRES chapters) or fail conformance - the canon owns the shape, the kit
enforces it. Adds a test proving a cardless engine is rejected; the real gender
engine passes.
