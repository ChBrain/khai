---
---

Wire the `lockfile-check` gate: a CI `lockfile-scope` job, a pre-push hook line,
and the dormant-guarded unit tests. Verifiers only (CI/hooks/tests) — no shipped
package change, so no release. Companion to the source PR that adds the gate.
