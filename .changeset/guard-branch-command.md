---
"@chbrain/khai-guard": patch
---

feat(cli): `khai-guard branch <topic>` -- deterministic lane selection. Reads the working-tree changes, resolves their lane via `advise`, and creates `<lane>[/<unit>]/<topic>` (or `chore/<topic>` for unowned, or refuses a multi-lane change with the split). The lane is computed from the diff, never chosen by hand -- so a weaker agent cannot land engine content on a docs branch. Pairs with the enforced pre-push/CI branch-check (the wall): the helper gets it right up front; the gate is the backstop.
