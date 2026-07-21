---
"@chbrain/khai-stage": patch
---

Order 5 (blueprint seed, step 2): reconcile the blueprint's audit set to the position-derived harness. The three fixed-rubric audits (`conciseness`, `khai-type`, `voice-conformance`) are replaced by two: a `team` audit that resolves the house's rubrics from its own management positions (`fromPositions`) and runs them robustly (consensus, skeptic), and a `voice-conformance` audit kept as the retained voice lens (global mechanism, local words), now also robust. `conciseness` and `khai-type` drop to opt-in: a house adds them if it wants, they are no longer imposed. This carries order 4's ruling into what every house is raised from: no universal rubric set, the count is the house's, and the review does not ride on one sample of one model. The audit workflow is generic over `audit/*/audit.json`, so no workflow change is needed; a house gains the position-driven audit once it bumps `khai-review` to the version that resolves it.
