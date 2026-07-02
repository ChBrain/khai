---
---

Remove the fossil `packages/khai-methods/package-lock.json`. In an npm-workspaces
monorepo the root lockfile is authoritative; this stray per-package lock was a
pre-workspaces fossil (pinned `js-yaml@3.14.2` via `gray-matter`) that desynced
Dependabot and triggered a phantom advisory + a downgrade PR (#701). No release.
