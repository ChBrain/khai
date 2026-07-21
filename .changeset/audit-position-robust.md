---
"@chbrain/khai-review": patch
---

Order 5 (blueprint seed, step 1): make the audit CLI run the order-2 harness. `reviewCard` and `reviewMarkdown` gain an optional `robust` argument: when given the house's thresholds (n, k, skeptic), each rubric runs through `reviewRobust` (consensus, skeptic, source anchor) instead of a single shot, so the audit does not ride on one sample of one model; absent, the single-shot path is unchanged. The CLI's manifest grows two knobs, coexisting with the named rubrics it already reads: `fromPositions` resolves the house's rubrics from its management positions (`resolvePositionRubrics`), and `thresholds` supplies the robustness config. No universal set is imposed; a house checks what its team's positions declare, plus any named rubric it opts into (the voice case), with its own thresholds. Fully back-compatible: a manifest with neither knob keeps the historical conciseness default and single-shot review. Source only; tests follow separately.
