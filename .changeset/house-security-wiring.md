---
"@chbrain/khai-stage": patch
---

Stamp houses with security wiring: add `.github/dependabot.yml` (npm + github-actions, weekly) and `.github/workflows/codeql.yml`, and declare least-privilege `permissions: contents: read` in the house `ci.yml`. Every future house inherits these; existing houses are backfilled separately.
