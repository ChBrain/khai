---
"@chbrain/khai-arch": patch
---

Declare the provenance vocabulary: every content file may declare in
frontmatter where its substance stands relative to the declared source -
`sourced`, `free`, or `unverified`. Invention is legitimate; unmarked
invention is the defect. A marked `free` file reviews as clean; an absent key
reads as `sourced` so silence never launders invention. Optional in this bump
so fleets backfill deliberately; a following bump flips it to required. The
kit and rules enforce the enum through the existing frontmatterExtras path
with no changes of their own.
