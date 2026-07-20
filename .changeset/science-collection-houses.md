---
"@chbrain/khai-tests": minor
---

Generalise `khai-tests science` from engine monorepos to collection houses. A
production house that indexes content subdirs (e.g. khai-misfits, `misfits/<id>/`
each a `REFERENCE.md` warrant and no per-item package.json) can now compute its
own `docs/SCIENCE.md` — the forward map science → item — from the same Origin
tables its per-item warrants carry, with the same build-drift gate the engine
index uses. Dispatch is on the `khai.collection` knob the registry build already
reads: a house that declares it is rendered from its units; anything else is the
engine monorepo, rendered by the untouched pre-existing path (the engine index
is byte-identical). Adds `collectCollectionScience` and `renderCollectionIndex`
to the public surface; `buildScienceIndex`/`verifyScienceIndex` now dispatch by
house shape. Additive and back-compat — the minor bump is the maintainer's label
to confirm.
