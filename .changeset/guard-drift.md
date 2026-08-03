---
"@chbrain/khai-guard": patch
---

`khai-guard drift`: report khai dependencies a house has fallen behind on. Dependabot cannot read `@chbrain/*` on GitHub Packages, so a house that ignores those updates loses its only notice that it is behind. Advisory by default and never bumping, because a khai bump is a migration rather than a version edit; `--json` for a scheduled caller, `--enforce` to exit 1. Gated on a `driftPolicy` naming the scopes to watch.
