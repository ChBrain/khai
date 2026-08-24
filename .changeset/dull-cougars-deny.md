---
"@chbrain/khai-stage": patch
---

Stamp the khai-drift alarm into every house. A house had no way to tell it was
behind the kit unless somebody wrote the workflow there by hand, so a stamped
house could sit many minor versions back in silence. The blueprint now carries
all three parts the alarm needs: dependabot ignores `@chbrain/*` (it has no
GitHub Packages credential and only produces broken pull requests),
`.github/workflows/khai-drift.yml` asks `khai-guard drift` weekly and reports
into one issue, and `khai-guard.config.json` declares the `driftPolicy` scopes
without which drift passes silently.
