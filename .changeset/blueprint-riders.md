---
"@chbrain/khai-stage": patch
---

Add the management-order rider lane to the blueprint. The houses route
`management/orders/**` as a rider (it rides the lane of the change it drives,
homing to `governance` when it stands alone), declared in
`khai-guard.config.json` and documented in `CLAUDE.md`. The blueprint lacked
both, so a freshly stamped house had no rider lane. Bring the blueprint in line
with the live houses.
