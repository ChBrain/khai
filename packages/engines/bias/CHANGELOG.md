# @chbrain/khai-engine-bias

## 0.2.0

### Minor Changes

- 9867f1f: Take the suffix the catalogue already runs on for the three members that
  collided: `position_anchoring` → `position_anchoring_bias`, `position_reactance`
  → `position_reactance_bias`, `position_representativeness` →
  `position_representativeness_heuristic`. Frees `anchoring`, `reactance` and
  `representativeness` for the engines that own them. Member files are API and
  renaming one is breaking, hence minor; nothing outside the engine linked them.

## 0.1.2

### Patch Changes

- 920c1b5: Resolve the bare Turner citation to John Turner, so the science index keys the right person.

## 0.1.1

### Patch Changes

- d89e66f: Add bias engine: the resting tilt a persona brings to judgment as a position, cut by motive into self, coherence, ease, belonging, and stake families.
- f6477da: Add named-bias leaf positions to the bias engine, under the sub-motive families.
- Updated dependencies [14b6fd7]
  - @chbrain/khai-arch@0.1.21
