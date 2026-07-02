---
---

Ignore per-package `package-lock.json` files (`packages/**/package-lock.json`).
This is an npm-workspaces monorepo where the root lockfile is authoritative; a
stray nested lock is what let a fossil desync Dependabot and CI (the phantom
js-yaml advisory + downgrade #701). The root lock is never matched. No release.
