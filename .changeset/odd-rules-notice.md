---
---

CI: drop the shell exemption for the changesets release branch from the
branch-scope job. `khai-guard branch-check` now skips `changeset-release/*`
itself, so the workflow just calls the guard. No package change.
