---
"@chbrain/khai-guard": patch
---

Add a `lockfile-check` subcommand (and `checkLockfiles` + a `lockfilePolicy`
config section). In an npm-workspaces monorepo the root `package-lock.json` is
the only authoritative lock; this gate rejects a lockfile committed inside a
package — the fossil class that desynced Dependabot and CI (a stale nested lock
pinned an old dependency, producing a phantom advisory and a downgrade PR). The
CLI scans the tracked tree and exits non-zero on any nested lockfile.
