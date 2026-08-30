---
"@chbrain/khai-stage": patch
---

stage: ship the Dependabot wiring whole. A house now stamps with a `dependabot/*`
lane in `khai-guard.config.json` (so bot bump PRs have a home and pass
branch-scope) and `packages: read` in `ci.yml` (so the Dependabot-context token
can `npm ci` the public `@chbrain/*` packages from GitHub Packages — without it
only the bot PRs 403). The blueprint already shipped `dependabot.yml`; the lane
and the token scope were the missing halves, so every dependency PR raised against
a fresh house was red. The stage test now asserts all three travel together.
