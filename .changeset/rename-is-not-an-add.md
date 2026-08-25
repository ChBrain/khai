---
"@chbrain/khai-guard": patch
---

A renamed play is not a new play.

`parseChanges` discarded a rename's source path, so every rename became a plain
add. `changeset-check` then read a MOVED play as an ARRIVED play and demanded a
`minor` changeset for it. Downstream that was a deadlock, not an inconvenience:
obeying it makes `changeset version` compute `0.<count+1>.0`, the registry build
reconciles the minor back to the unchanged count, and the release lands on a
version already published -- while refusing it fails the gate. The rename could
not merge in any form.

The rule now keys on the source: a rename is a count-driven add only if its
source did NOT already match the count-driven glob.
`cultures/hamburg/play_hamburg.md` -> `cultures/de_hamburg/play_hamburg.md`
leaves 290 cultures at 290; `drafts/foo.md` -> `cultures/x/play_x.md` is a play
genuinely arriving. Being independent of git's similarity score, it holds for a
rename that also edits the file, which is the common case -- a play's links
change when its directory does.

Three things deliberately unchanged. The count-driven rule itself: a real add
still demands `minor`. Lane ownership: the destination still reads as status
`A`, because a rename into a lane really is an arrival in that lane, and the two
gates were only ever asking different questions of one record. And
`exemptRenames`, which drops R100 outright and would have had to be widened to
cover an edited rename; the source-glob test needs no widening, having never
asked about similarity.

`from` is carried for a rename (R) and not for a copy (C). A copy leaves its
original in place, so the count really did move and the destination really is an
add -- the one case inside the glob that is still a genuine addition.
