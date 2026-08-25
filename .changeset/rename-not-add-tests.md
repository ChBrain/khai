---
---

Cover the rename rule: eight tests over `parseChanges` and `changesetCheck`,
dormant until the source lands.

A rename whose source already matched the count-driven glob moved an item, it did
not add one, so it must not demand a `minor`. The cases hold that both ways: a
rename with edits (R096) and a pure one (R100) pass on a `patch`; a genuinely new
play, a rename in from outside the glob, and a **copy** inside it all still fail,
because a copy leaves its original in place and the count really did move.

The existing rename assertion relaxes from `toEqual` to `toMatchObject`. Its
claim is that the destination reads as an add, which lane ownership needs and
which is true either side of the fix; asserting exact record shape there made it
a second, accidental gate on a field it does not test.

The dormancy sentinel probes for the fix itself (`isCountDrivenAdd(c.from)`)
rather than for a sentence, because a sentence in a wrapped comment is not a
contiguous string. The first draft used one, never matched, and left all eight
skipped -- green, and testing nothing. Tests only; ships no package content.
