---
"@chbrain/khai-stage": patch
---

Make stamped houses publishable. The blueprint now carries a `files` field, `version`/`release` scripts, and a `release.yml` workflow, so a freshly raised house ships to GitHub Packages without hand-wiring. Also fixes the changeset config restoring to `changeset/` instead of `.changeset/`: `housePath` now dots the `changeset/` prefix like `.github/` and `.husky/`. Adds RELEASE_TOKEN to the post-stamp handoffs.
