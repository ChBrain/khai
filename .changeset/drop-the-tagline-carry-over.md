---
"@chbrain/khai-language": patch
---

Delete `tagline` from the scanned chapter set: it was never a chapter.

`khai.tagline` is a **package.json manifest field**, which khai-arch reads to
render an engine README. It reached a list of H2 section names by mistake. No khai
type declares it, and no `## Tagline` exists in khai, khai-cultures or
khai-misfits -- so it matched nothing and cost nothing, which is exactly why it
survived however long it had been there. A name in a list that the data never
produces is indistinguishable from one that works.

The scanned set is now **32**: all 36 house/element chapters bar the four
structural ones, all four of which belong to `play` (`Estate` and `Name` are
identity lines of URLs and ISO codes; `Company` and `Triggers` are cast lists
whose words are a gloss around a link). `Taxonomy` and `Owner` remain named in
the exclusion set but no type declares them in its `chapters` -- the validator
adds them structurally -- so those two entries are inert, and are kept only so
the intent reads plainly.

No behaviour change: both real houses reported zero findings before and after.
