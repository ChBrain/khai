---
"@chbrain/khai-arch": patch
---

Close two divergences in the portable play checker.

A duplicated frontmatter key was last-wins here and a thrown
`duplicated mapping key` in js-yaml, the loader every house actually runs, so a
play could pass `checkPlay` and fail the validator. `readFrontmatter` now
returns `dupes` (stamp sub-keys by path) and `checkPlay` reports each.

A `---` rule with no chapter after it opens a coda, and a thematic break an
author meant to keep inside the final chapter is spelled the same way -- so its
text silently left `sections.Stakes` while `checkPlay` reported clean. Markdown
cannot tell the two apart, so this reports rather than refuses: `readBody`
returns the coda, and the command notes on stderr how many lines sit outside the
chapters and that `***` is a thematic break that does not open one.
