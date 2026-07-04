---
"@chbrain/khai-guard": patch
---

Close four holes in the lockfile-scope gate found in review:

- `lockfile-check` (and `license-check`) now list the tracked tree with
  `git ls-files -z`, so a lockfile under a directory with non-ASCII or
  special characters can no longer evade the gate via core.quotePath
  C-quoting.
- `lockfile-check` anchors itself at the repo toplevel before loading
  config: run from a package directory it used to silently no-op ("no
  lockfilePolicy configured") and would classify that package's own
  nested lock as the allowed root one.
- `allowRoot` now exempts only the authoritative root lock (new
  `lockfilePolicy.rootLockfile`, default `package-lock.json`) instead of
  any policed name at root — a committed root `npm-shrinkwrap.json`
  (which npm prefers over package-lock.json) is now an offender.
- `lockfilePolicy.lockfiles: []` is now a config error instead of an
  always-green gate that still claims the tree was scanned.
