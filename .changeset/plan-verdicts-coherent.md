---
"@chbrain/khai-arch": patch
---

Correct the closed-plan verdict vocabulary. `[?]` flagged read as "not yet
judged", which contradicts `closed` (every target resolved). Replace it with two
genuinely terminal verdicts: `planVerdicts` is now `[x]` done, `[F]` failed,
`[W]` waived (a live target dropped or overtaken by events), and `[-]` struck
(cut as moot or never applicable). The template and architecture note spell the
same set.
