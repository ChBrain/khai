---
---

Cover the rule that a changeset must name a package the workspace actually has.
Dormant until the source lands; the sentinel is the `workspaceNames` input.

Eight cases, and the interesting ones are the limits rather than the happy path:
a PRIVATE workspace package is accepted, because `readPackages` drops private
manifests and every rule it feeds is about publishing while existence is not; an
empty `workspaceNames` says nothing at all, since no list means the caller could
not read the workspace rather than that every name in it is wrong; and a
changeset the pull request only EDITS is checked, unlike the release-intent
rules, because the pass that repairs a wrong name edits rather than adds and
exempting it would let a half-done repair merge green.
