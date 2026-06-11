---
"@chbrain/khai-plays": patch
---

Move the chain management instructions inside `management/`, mirroring a house:
`management_instructions.md` and `discussion_instructions.md` now live in
`packages/khai-plays/management/` beside the cast, not at repo root. So the chain
management is self-contained and the management guard (validateProject over
`management/`) covers the instructions too, the same as a house. The internal
`docs/BRANCHING.md` reference becomes plain text (no cross-tree link).
