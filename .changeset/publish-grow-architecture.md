---
"@chbrain/khai-arch": patch
---

Publish the GROW restructure that 0.0.3 documented but never shipped. The
`0.0.3` tarball on the registry still carries the pre-GROW files: the old
overview as `architecture.md` (no frontmatter, no coda) and no `model.md`.
The source moved to the GROW typed spec (`architecture.md` as the Ground/
Root/Open/Weave seam, overview relocated to `model.md`) without a version
bump, so consumers installing `khai-arch` got stale canon. This patch
republishes the canon so the registry matches source: `architecture.md` is
the typed seam and `model.md` is the companion.
