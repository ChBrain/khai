---
"@chbrain/khai-tests": minor
---

Give a citation two more things it can declare, and check one of them.

`Delegate (third-place).` -- or the prose the corpus already writes, "owned by
the third-place engine" -- names the unit that holds a work's spine. Unlike
canon, contrast and support, this exit is verified: the named unit must cite the
same (scholar, work) as a spine, and a claim that does not hold leaves the row a
spine so it still collides. `findUnverifiedDelegations` reports the ones that do
not hold.

`Spine (anchoring and adjustment).` declares a **locus** -- which claim in the
work this unit takes -- and the overlap key becomes `Scholar :: work :: locus`,
so a volume of chapters stops being one key. An undeclared spine keys exactly as
before, so nothing migrates; `findSharedLoci` prints one work spining several
units under different loci as a reading list, because whether two loci are
honestly different is a judgement and not a computation.
