---
"@chbrain/khai-guard": patch
---

`npm run gates` now runs the three checks CI required and it did not: the
source/test split, `branch-check` and `changeset-check`. The command whose point
is "every wall this repo has, in one command" was missing exactly the three that
catch structural mistakes, so an author met them only after a push.

They could not simply be added. On a clean `main` both `branch-check` and
`changeset-check` exited 1, and both were saying something false: `"main" matches
no lane` (main is the destination, you cannot be in the wrong lane on it) and
"no changeset found" for a PR that does not exist.

Both judge a CHANGE, so with no change there is nothing to judge. An empty diff
range now ends each check before a branch name or a changeset is weighed,
reporting either the dirty-tree case from the previous release or a plain nothing
to check. CI is unaffected: there the range is a real PR and is never empty.
