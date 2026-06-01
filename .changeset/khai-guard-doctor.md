---
"@chbrain/khai-guard": patch
---

Add a `khai-guard doctor` subcommand that diagnoses a repo's adoption instead
of judging a diff: reports the resolved config and buckets, flags overlapping
globs on the real tracked tree (exit 2), confirms a CI workflow and
`.husky/pre-push` reference khai-guard, and reminds the operator to verify the
branch-protection required check (which it can't read). Exit 0 healthy, 2 on a
definite misconfiguration; warnings don't fail.
