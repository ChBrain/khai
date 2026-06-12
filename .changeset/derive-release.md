---
"@chbrain/khai-stage": patch
---

The generated house derives its version from the play count: the `version`
script now runs `khai-tests registry build` after `changeset version`, so the
minor is set to the play count and `package.json` plus `registry.json` are
reconciled at release. The house CLAUDE.md versioning rule is updated to match,
a play PR is a patch changeset and the build owns the minor, no hand-bumps.
