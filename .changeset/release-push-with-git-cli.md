---
---

Push the release branch with git, not the GitHub API.

The v2 input rename fixed in the previous pass let the action get further, to a
second failure that is specific to this repository:

```
Unexpected executable file at packages/khai-plays/bin/khai-plays.mjs,
GitHub API only supports non-executable files and directories.
```

changesets/action v2 writes the release branch through the GitHub API by default,
and that API's tree format has no mode for an executable file. khai ships CLI
entry points: seven files are 755 in the index, and `npm ci` chmods every
workspace `bin` target besides -- which is how khai-plays gets named while
sitting at 644 in git. Neither dropping the bit nor gitignoring a shipped binary
is available, so the fix is `push-with-git-cli: true`. Git has always carried the
mode, and the checkout already persists RELEASE_TOKEN as the git credential.

**And this is why the identical step works in khai-cultures and khai-misfits:
both track zero executable files, so the API path never meets one.** The previous
pass argued its correctness partly from the step being byte-identical to the one
proven working in cultures. That was true and insufficient: a workflow that works
in one repository is evidence about that repository. The difference here was in
the file modes, not the YAML.

The pinning test gains `push-with-git-cli: true` for the same reason it pins the
two script inputs: under the default the action does not degrade, it refuses the
push.
