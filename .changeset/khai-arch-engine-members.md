---
"@chbrain/khai-arch": patch
---

Realize the generalized WIRE in code: an engine is a set of typed members on a
composition tree, not a single-type anchor + flat expressions.

- `engineMembers(manifest)` - normalize a manifest into `{ file, type, parent }[]`.
  Two shapes desugar to the same model: the explicit `members` list, and the
  legacy `{ type, anchor, expressions }` shorthand (so existing engines are
  unchanged). Validates types against the canon, one root, resolvable parents,
  no cycles.
- `compositionOrder(manifest)` - the "carry upward" rule made concrete: for each
  leaf, the ordered file chain from root to leaf. Depth-1 engines yield
  `[anchor, expression]`; a ladder yields `[root, channel, width]`.
- `engineCard` now derives `type`/`anchor` from the root member when an engine
  declares `members` (explicit fields still win), so a members-based engine
  still renders a complete card. Return shape is otherwise unchanged - the
  website card loader is unaffected.
