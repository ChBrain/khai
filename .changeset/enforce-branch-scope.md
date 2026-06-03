---
---

governance: flip branch-scope from advisory to hard-fail. `.husky/pre-push` and
the CI `branch-scope` job drop `--warn` / the `KHAI_GUARD_BRANCH_ADVISORY` env,
and `docs/BRANCHING.md` documents enforced mode. Hooks, CI, and docs only — no
package source changed, so this releases nothing.
