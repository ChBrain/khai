---
"@chbrain/khai-stage": patch
---

Blueprint: add a `dependabot/*` branch lane to `khai-guard.config.json`, allowing the dependency-update file set (`package.json`, `package-lock.json`, `.github/workflows/**`). Without it, Dependabot's multi-segment branch names (`dependabot/npm_and_yarn/...`) matched no lane and `khai-branch-scope` rejected every Dependabot PR.
