---
"@chbrain/khai-skills": patch
---

The theatre-manager skill's versioning guidance now matches the derived-version
flow: changesets pick the release level only, and the build sets the minor from
the play count. Adding a play is a patch changeset, not a hand-bumped minor.
