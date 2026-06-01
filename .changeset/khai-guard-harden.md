---
"@chbrain/khai-guard": patch
---

Harden the guard: validate `khai-guard.config.json` shape (bad buckets
now fail loud with exit 2 instead of silently matching nothing), detect
overlapping source/test globs as a config error rather than a phantom
"mixed" verdict, guard `--base`/`--head` against a missing value, and
lock deletion/typechange diff parsing under test.
