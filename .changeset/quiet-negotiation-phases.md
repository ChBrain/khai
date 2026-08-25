---
"@chbrain/khai-engine-negotiation": minor
---

Take the engine's own name on the two phases that collided:
`process_exploration` → `process_negotiation_exploration`, `process_resolution`
→ `process_negotiation_resolution`. Frees `exploration` for the composite and
`resolution` for `betrayal`. Member files are API and renaming one is breaking,
hence minor.
