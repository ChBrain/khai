# @chbrain/khai-engine-decay

## 0.2.0

### Minor Changes

- 4b11d4f: Generalize the decay engine to also wire `on: piece` (at Apparent), alongside its existing `on: place` (at Shown). Material entropy is one phenomenon on two types -- rust is rust on a rail or a blade -- so decay becomes khai's first multi-cargo engine rather than duplicating rust/rot/crumble/patina under object-side stems. This gives objects a use-independent entropy engine (the complement to wear's use-driven degradation) and completes the object-lifecycle's decay phase. Adds a wiring capability (backward-compatible), so a minor bump.
