---
"@chbrain/khai-guard": patch
---

Add the bump-scope gate (the third khai-guard rule). A changeset may bump
`patch` freely, but `minor`/`major` widen the published release and are the
maintainer's call, not the agent's. The gate cannot HARD-lock that -- the bot
runs with the maintainer's own credentials, so any in-repo lock it could set, it
could also unset -- so the teeth are LOUDNESS: every non-patch bump is detected,
named, and flagged, so an escalation can never ship silently or by accident.

New pure exports `parseChangeset(text)` and `bumpScope(changesets, config)`, a
`khai-guard bump-check` CLI subcommand that prints an unmissable banner (plus a
`::warning::` annotation and a `bump_level`/`bump_label` hand-off on
`GITHUB_OUTPUT` so CI can stamp the PR), and a `bumpScope` config section
(`freeLevel`, `labels`). Advisory by default (exit 0); `--enforce` turns it red.
CI + hook wiring and unit tests land next (kept separate per the source/test
gate).
