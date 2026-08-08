---
---

Add bin-level tests for `khai-guard drift`: the three nothing-to-check paths, the behind, unreachable and level reports, findings confined to stderr so `--json` stdout stays parseable, the `--enforce` exit code, and the human table. The registry is stubbed on PATH rather than called, so the cases are deterministic and offline. Tests only; no shipped content changes.
