---
---

Fix the khai release: `changesets/action@v2` renamed its inputs and the workflow
still passed the v1 names.

```
##[error]Error: The following inputs have been renamed:
- "publish" -> "publish-script"
- "version" -> "version-script"
```

The action fails outright rather than falling back, so **every release run since
the v2 bump has failed** -- four consecutive, with `npm test` green in each one.
Nothing published and no Version Packages PR was ever opened; the changesets
simply queued on main. The run is red, so this is not a silent outage, but it is
adjacent to one: the failure is in the last step of a job whose visible work all
succeeds, and the symptom downstream is only that a release does not appear.

v2 carries a **second** break, and it is invisible until the first is fixed: the
action now has a `github-token` input defaulting to the built-in token, and it
refuses to run when a `GITHUB_TOKEN` env var is set to something else. The PAT
moves into the input. It cannot be dropped in favour of the default, for the
reason the file's own token note gives: GITHUB_TOKEN suppresses workflow runs on
the commits it makes, so the Version PR would never get CI and could never merge.

Both are fixed together, because fixing only the first buys one more red run.

This is the same pair that took the khai-cultures release down earlier, fixed
there in ChBrain/khai-cultures#361 and #362 -- the second only after the first
made it reachable. The workflow step is now byte-identical to the form proven
working there.
