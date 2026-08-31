---
"@chbrain/khai-guard": patch
---

`branch-check` and the source/test split read a diff range, which is committed
history. When that range resolves to zero paths they printed a confident pass over
a working tree they never looked at: staging stray files and running the guard
returned "0 changed path(s) all in lane", and committing the identical files
returned a refusal.

Both now say so instead. A range of zero paths over a dirty tree reports NOTHING
CHECKED, names what is staged, unstaged or untracked, and says to commit and run
again. A clean tree still reports a plain pass, and a non-empty range is
unchanged.
