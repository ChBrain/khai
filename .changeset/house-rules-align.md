---
"@chbrain/khai-stage": patch
---

Blueprint aligns every house to one rule set. Versioning: adding a play takes no changeset; `khai-tests registry build` is the single writer and sets `0.<count>.0` (CLAUDE.md). Gates are khai-named: the `branch-scope` job in `ci.yml` is renamed `khai-branch-scope`. And `ci.yml` grants `packages: read` so `npm ci` can pull `@chbrain/*` from GitHub Packages (the houses install them; the Dependabot-context token needs the scope).
