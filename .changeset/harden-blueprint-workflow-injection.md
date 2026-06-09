---
"@chbrain/khai-stage": patch
---

Harden the generated house CI/audit workflows against GitHub Actions expression
injection. Untrusted contexts (PR branch names via `github.head_ref` and
`steps.*.outputs.*_ref`, the PR number, and the diff-derived audit ids) are no
longer interpolated directly into `run:` shell or `github-script` bodies; they
are passed through `env:` and referenced as `"$VAR"` / `process.env.*`. This
clears the code-scanning findings on every newly raised house. No behavioral
change to the gates.
