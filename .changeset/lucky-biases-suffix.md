---
"@chbrain/khai-engine-bias": minor
---

Take the suffix the catalogue already runs on for the three members that
collided: `position_anchoring` → `position_anchoring_bias`, `position_reactance`
→ `position_reactance_bias`, `position_representativeness` →
`position_representativeness_heuristic`. Frees `anchoring`, `reactance` and
`representativeness` for the engines that own them. Member files are API and
renaming one is breaking, hence minor; nothing outside the engine linked them.
