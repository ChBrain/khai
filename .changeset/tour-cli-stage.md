---
"@chbrain/khai-tour": patch
---

Add the `khai-tour stage` CLI command and fix the `venues` listing. `stage
--venue <slug> --out <dir> [--artifact <dir>] [--collection name=glob ...]
[--engine text ...] [--format fmt]` runs the tour() orchestrator and prints the
bundle manifest + warnings. `venues` now prints each venue's kind (and source for
interactive venues) instead of `Format: undefined, Packaging: undefined`. The CLI
core (parsing + presentation) lives in lib/cli.mjs so it is unit-tested.
