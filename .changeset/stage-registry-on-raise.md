---
"@chbrain/khai-stage": patch
---

Emit `registry.json` when a house is raised, so the house is green on raise with
no manual `khai-tests registry build` step. An empty house lists no plays; name
and version are read from the house package.json (the same source the kit reads),
so the two never drift. Verified: raising a house validates clean immediately.
