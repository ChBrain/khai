---
"@chbrain/khai-tests": patch
---

Add house content walls (`resolveHouse`, `unitsOf`, `touchedUnits`, `isolationErrors`,
`filenameErrors`, `ratchet`) and the `khai-tests house check` CLI, lifting the house-built
resolver, isolation, ASCII-filename and ratchet mechanics that khai-misfits and khai-cultures
each carried locally into the shared kit, house-neutral and provider-neutral, so any collection
house gets them by installing the kit rather than re-deriving them per house.
