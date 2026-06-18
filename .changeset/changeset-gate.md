---
"@chbrain/khai-guard": patch
---

Add a `changeset-check` gate: a play-count-driven house needs no changeset when a PR adds a new play, but every other shipped change must carry one (real or empty) or it merges and publishes nothing. New `changesetCheck` + `parseChanges` in the library, a `changeset-check` CLI subcommand (hard-fail by default, `--advisory` to soften), and a `changesetPolicy.countDrivenAdd` config section.
