---
---

Move CLAUDE.md's line-15 case-law pointer from
`packages/khai-arch/architecture/conduct.md` to
`packages/khai-stage/conduct.md` (both the repo path and the
`node_modules/@chbrain/...` path), following the doc's own move to
khai-stage. Ships no package content, hence empty.

Merge order: this PR can merge any time after the stage-lane PR that lands
`packages/khai-stage/conduct.md` lands; until then the link points at a path
that still exists on `main` (khai-arch's copy, deleted by the arch-lane PR
that follows).
